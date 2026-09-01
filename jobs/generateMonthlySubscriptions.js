// jobs/generateMonthlySubscriptions.js
const Student = require("../models/Student");
const Zone = require("../models/Zone");
const Subscription = require("../models/Subscription");
const JobLog = require("../models/JobLog");

const JOB_NAME = "generate_monthly_subscriptions";

function currentPeriod(date = new Date()) {
    // "YYYY-MM"
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

async function hasRunThisMonth(period = currentPeriod()) {
    const log = await JobLog.findOne({ where: { job_name: JOB_NAME, period } });
    return !!log;
}

async function runMonthlySubscriptionJob() {
    const period = currentPeriod();

    if (await hasRunThisMonth(period)) {
        console.log(`[${JOB_NAME}] already ran for ${period}, skipping`);
        return;
    }

    const students = await Student.findAll({ include: [{ model: Zone }] });
    // if Student isn't directly associated to Zone, fetch zones separately:
    // const zones = await Zone.findAll();
    // const zoneMap = Object.fromEntries(zones.map(z => [z.id, z]));

    let created = 0;

    for (const student of students) {
        const zone = student.Zone; // or zoneMap[student.zone_id]
        if (!zone) continue;

        await Subscription.create({
            amount: zone.price,
            transport: !!student.transport, // adjust if transport lives elsewhere
            status: "non payé",
            student_id: student.id,
            zone_id: zone.id
        });

        created++;
    }

    await JobLog.create({ job_name: JOB_NAME, period });
    console.log(`[${JOB_NAME}] created ${created} subscriptions for ${period}`);
}

module.exports = { runMonthlySubscriptionJob, hasRunThisMonth, currentPeriod, JOB_NAME };