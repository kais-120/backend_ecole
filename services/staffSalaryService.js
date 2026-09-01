const { Op } = require("sequelize");
const Absence = require("../models/Absence");
const StaffSalary = require("../models/StaffSalary");

/**
 * Calculates and stores salaries for a given staff type (employé / surveillants)
 * by deducting unjustified absence days from the fixed monthly salary.
 *
 * @param {string} personType - "employé" or "surveillants"
 * @param {Model} PersonModel - Employ or Supervisor sequelize model
 */
async function calculateStaffSalaries(personType, PersonModel, month, year) {
    const now = new Date();
    if (!month || !year) {
        const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        month = prev.getMonth() + 1;
        year = prev.getFullYear();
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // last day of month
    const daysInMonth = endDate.getDate();

    const people = await PersonModel.findAll();
    const results = [];

    for (const person of people) {
        const absenceDays = await Absence.count({
            where: {
                person_type: personType,
                person_id: person.id,
                justification: false,
                date: {
                    [Op.between]: [
                        startDate.toISOString().slice(0, 10),
                        endDate.toISOString().slice(0, 10)
                    ]
                }
            }
        });

        const baseSalary = parseFloat(person.salary || 0);
        const dailyRate = baseSalary / daysInMonth;
        const totalSalary = Math.max(0, baseSalary - dailyRate * absenceDays);

        await StaffSalary.upsert({
            person_type: personType,
            person_id: person.id,
            month,
            year,
            base_salary: baseSalary.toFixed(2),
            absence_days: absenceDays,
            total_salary: totalSalary.toFixed(2)
        });

        results.push({
            person_id: person.id,
            name: `${person.name} ${person.last_name}`,
            base_salary: baseSalary.toFixed(2),
            absence_days: absenceDays,
            total_salary: totalSalary.toFixed(2)
        });
    }

    return results;
}

module.exports = { calculateStaffSalaries };