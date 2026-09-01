const { Student } = require("../models");
const ExcelJS = require("exceljs");
const puppeteer = require("puppeteer");
const { getDetailedReportData } = require("../services/reportService");
const { buildExcelReport } = require("../services/excelReport");
const { buildPdfReport } = require("../services/pdfReport");

// Translate stored gender codes to Arabic display text if needed
function genderLabel(g) {
    if (g === "ولد" || g === "بنت") return g; // already Arabic
    if (g === "male" || g === "M") return "ذكر";
    if (g === "female" || g === "F") return "أنثى";
    return g || "";
}

// Escape values before injecting into HTML
function esc(value) {
    if (value === null || value === undefined) return "";
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function buildStudentsHtml({ students, level }) {
    const rows = students
        .map((student, index) => {
            const birthday = student.birthday
                ? new Date(student.birthday).toLocaleDateString("fr-FR")
                : "";
            const phone = student.father_phone || student.mother_phone || "";

            return `
                <tr class="${index % 2 === 0 ? "row-alt" : ""}">
                    <td class="col-num">${index + 1}</td>
                    <td>${esc(student.last_name)}</td>
                    <td>${esc(student.name)}</td>
                    <td class="col-center">${esc(genderLabel(student.gender))}</td>
                    <td class="col-center">${esc(birthday)}</td>
                    <td class="col-center">${esc(student.classe)}</td>
                    <td class="col-center">${esc(phone)}</td>
                </tr>
            `;
        })
        .join("");

    return `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
    <meta charset="UTF-8" />
    <style>
        @font-face {
            font-family: 'Cairo';
            src: local('Cairo');
        }

        * { box-sizing: border-box; }

        body {
            font-family: 'Cairo', 'Amiri', 'Segoe UI', Tahoma, sans-serif;
            margin: 0;
            padding: 30px 40px;
            color: #0F172A;
            direction: rtl;
        }

        .header {
            background: #1E293B;
            color: #FFFFFF;
            border-radius: 10px;
            padding: 22px 20px;
            text-align: center;
            margin-bottom: 18px;
        }

        .header h1 {
            margin: 0;
            font-size: 22px;
            font-weight: 700;
        }

        .meta-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            color: #64748B;
            margin-bottom: 14px;
            padding: 0 4px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
        }

        thead tr {
            background: #1E293B;
            color: #FFFFFF;
        }

        th, td {
            padding: 9px 8px;
            text-align: right;
            border: 0.5px solid #CBD5E1;
        }

        th {
            font-weight: 600;
            text-align: center;
        }

        .col-center { text-align: center; }
        .col-num { text-align: center; width: 36px; color: #64748B; }

        tr.row-alt td {
            background: #F1F5F9;
        }

        tfoot td {
            border: none;
            padding-top: 14px;
            font-size: 10px;
            color: #94A3B8;
            text-align: center;
        }
    </style>
    </head>
    <body>
        <div class="header">
            <h1>لائحة التلاميذ</h1>
        </div>

        <div class="meta-row">
            <span>${level ? `القسم: ${esc(level)}` : "جميع الأقسام"}</span>
            <span>عدد التلاميذ: ${students.length}</span>
        </div>

        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>اللقب</th>
                    <th>الاسم</th>
                    <th>الجنس</th>
                    <th>تاريخ الميلاد</th>
                    <th>القسم</th>
                    <th>الهاتف</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    </body>
    </html>
    `;
}

exports.exportStudents = async (req, res) => {
    try {
        const { format, level } = req.query;

        if (!["pdf", "excel"].includes(format)) {
            return res.status(400).json({
                success: false,
                message: "Format must be pdf or excel.",
            });
        }

        const where = { is_deleted: false };
        if (level && level.trim() !== "") {
            where.classe = level;
        }

        const students = await Student.findAll({
            where,
            order: [
                ["last_name", "ASC"],
                ["name", "ASC"],
            ],
        });

        // =========================
        // PDF (Puppeteer)
        // =========================
        if (format === "pdf") {
            const html = buildStudentsHtml({ students, level });

            const browser = await puppeteer.launch({
                headless: "new",
                args: ["--no-sandbox", "--disable-setuid-sandbox"],
            });

            try {
                const page = await browser.newPage();
                await page.setContent(html, { waitUntil: "networkidle0" });

                const pdfBuffer = await page.pdf({
                    format: "A4",
                    printBackground: true,
                    margin: { top: "20px", bottom: "30px", left: "20px", right: "20px" },
                });

                res.setHeader("Content-Type", "application/pdf");

                const rawFilename = `لائحة-التلاميذ${level ? `-${level}` : ""}.pdf`;
                const asciiFallback = `students${level ? `-${level}` : ""}.pdf`;

                res.setHeader(
                    "Content-Disposition",
                    `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encodeURIComponent(rawFilename)}`
                );

                return res.send(pdfBuffer);
            } finally {
                await browser.close();
            }
        }

        // =========================
        // EXCEL — keep your existing logic here
        // =========================
    } catch (error) {
        console.error("Export students error:", error);
        return res.status(500).json({
            success: false,
            message: "Erreur lors de l'exportation des élèves.",
            error: error.message,
        });
    }
};



exports.downloadReport =  async(req, res) => {
  try {
        const { year, month, type } = req.query;
        const yearNum = parseInt(year, 10);

        if (!yearNum || !type) {
            return res.status(400).json({ message: "year و type مطلوبين" });
        }

        const periods = await getDetailedReportData({ year: yearNum, month });
        const isAll = month === "all" || !month;
        const rawLabel = isAll ? `full-${yearNum}` : `${periods[0].label}-${yearNum}`;

        const buildDisposition = (ext) => {
            const asciiFallback = `report-${yearNum}.${ext}`;
            const encoded = encodeURIComponent(`report-${rawLabel}.${ext}`);
            return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encoded}`;
        };

        if (type === "excel") {
            const buffer = await buildExcelReport(periods);
            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            res.setHeader("Content-Disposition", buildDisposition("xlsx"));
            return res.send(buffer);
        }

        if (type === "pdf") {
            const buffer = await buildPdfReport(periods);
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", buildDisposition("pdf"));
            return res.send(buffer);
        }

        return res.status(400).json({ message: "type غير صالح (pdf أو excel)" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "خطأ في إنشاء التقرير", error: error.message });
    }
}

