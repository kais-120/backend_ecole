const { body, validationResult } = require("express-validator");
const Price = require("../models/TuitionFee");

exports.getPrices = async (req, res) => {
    try {
        const price = await Price.findAll();


        return res.status(200).json({
            message: "Absence students retrieved successfully.",
            price,
        });

    } catch (error) {
        console.error("Get student absences error:", error);

        return res.status(500).json({
            message: "Server error.",
        });
    }
};

exports.getAllAbsenceSupervisor = async (req, res) => {
    try {
        const absences = await Absence.findAll({
             where: {
                person_type: "surveillants"
            },
            order: [["createdAt", "DESC"]],
        });

        const persons = await Promise.all(
            absences.map(async (absence) => {

                const supervisor = await Supervisor.findByPk(absence.person_id);

                if (!supervisor) {
                    return {
                        ...absence.toJSON(),
                        supervisor: null
                    };
                }


                return {
                    ...absence.toJSON(),
                    person: {
                        id: supervisor.id,
                        name: supervisor.name,
                        last_name: supervisor.last_name,
                        role: supervisor.role
                    }
                };
            })
        );

        return res.status(200).json({
            message: "Absence supervisors retrieved successfully.",
            persons,
        });

    } catch (error) {
        console.error("Get supervisors error:", error);

        return res.status(500).json({
            message: "Server error.",
        });
    }
};

exports.getAllAbsenceTeacher = async (req, res) => {
    try {
        const absences = await Absence.findAll({
             where: {
                person_type: "maître"
            },
            order: [["createdAt", "DESC"]],
        });

        const persons = await Promise.all(
            absences.map(async (absence) => {

                const teacher = await Teacher.findByPk(absence.person_id,{
                    include:[{
                        model:Subject,
                        as:"subject"
                    }]
                });

                if (!teacher) {
                    return {
                        ...absence.toJSON(),
                        teacher: null
                    };
                }
                return {
                    ...absence.toJSON(),
                    person: {
                        id: teacher.id,
                        name: teacher.name,
                        last_name: teacher.last_name,
                        subjects: teacher.subject.map(subject => subject.label)
                    }
                };
            })
        );

        return res.status(200).json({
            message: "Absence teacher retrieved successfully.",
            persons,
        });

    } catch (error) {
        console.error("Get teacher error:", error);

        return res.status(500).json({
            message: "Server error.",
        });
    }
};

exports.getAllAbsenceEmploys = async (req, res) => {
    try {
        const absences = await Absence.findAll({
             where: {
                person_type: "employé"
            },
            order: [["createdAt", "DESC"]],
        });

        const persons = await Promise.all(
            absences.map(async (absence) => {

                const employ = await Employ.findByPk(absence.person_id);

                if (!employ) {
                    return {
                        ...absence.toJSON(),
                        employ: null
                    };
                }


                return {
                    ...absence.toJSON(),
                    person: {
                        id: employ.id,
                        name: employ.name,
                        last_name: employ.last_name,
                        role: employ.role
                    }
                };
            })
        );

        return res.status(200).json({
            message: "Absence employs retrieved successfully.",
            persons,
        });

    } catch (error) {
        console.error("Get employs error:", error);

        return res.status(500).json({
            message: "Server error.",
        });
    }
};