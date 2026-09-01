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
    ]
})

module.exports = StaffSalary