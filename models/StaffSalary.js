const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const StaffSalary = sequelize.define("staff_salary", {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    person_type: {
        type: DataTypes.ENUM("employ", "supervisor"),
        allowNull: false
    },
    person_id: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    month: {
        type: DataTypes.INTEGER,
    },
    year: {
        type: DataTypes.INTEGER,
    },
    base_salary: {
        type: DataTypes.DECIMAL(10, 2),
    },
    absence_days: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    unjustified_absence_days: {          // <-- new: basis for the salary deduction
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM(
            "payé",
            "non payé",
            "en attente"
        ),
        defaultValue: "en attente",
    },
    total_salary: {
        type: DataTypes.DECIMAL(10, 2),
    }

}, {
    indexes: [
        { unique: true, fields: ["person_type", "person_id", "month", "year"] }
    ],
    hooks: {
        // Se déclenche à chaque save() (create ou update), peu importe quel
        // champ a changé (base_salary saisi à la main, ou absences resynchronisées).
        beforeSave: (staffSalary) => {
            if (staffSalary.base_salary !== null && staffSalary.base_salary !== undefined) {
                const dailyRate = parseFloat(staffSalary.base_salary) / 30;
                const deduction = dailyRate * (staffSalary.unjustified_absence_days || 0);
                let total = parseFloat(staffSalary.base_salary) - deduction;
                if (total < 0) total = 0;
                staffSalary.total_salary = total.toFixed(2);
            }
        }
    }
});

module.exports = StaffSalary;