const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Absence  = sequelize.define("absences",{
    id:{
        type:DataTypes.BIGINT,
        primaryKey:true,
        autoIncrement:true
    },
    reason:{
        type:DataTypes.STRING,
    },
    date:{
        type:DataTypes.DATEONLY,
    },
    justification:{
        type:DataTypes.BOOLEAN,
    },
    person_type:{
        type:DataTypes.ENUM("employé","élève","surveillants","maître"),
    },
    
    person_id:{
        type:DataTypes.BIGINT,
    },
    
})
module.exports = Absence
