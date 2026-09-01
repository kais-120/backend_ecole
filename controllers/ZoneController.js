const { validationResult, body } = require("express-validator");
const Zone = require("../models/Zone");

exports.createZone = [
    body("label")
        .trim()
        .notEmpty()
        .withMessage("Label is required."),

    body("amount")
        .notEmpty()
        .withMessage("Amount is required.")
        .isNumeric()
        .withMessage("Amount must be a number.")
        .custom((value) => {
            if (Number(value) < 0) {
                throw new Error("Amount cannot be negative.");
            }
            return true;
        }),
    body("amount_yearly")
        .notEmpty()
        .withMessage("amount yearly is required.")
        .isNumeric()
        .withMessage("amount yearly must be a number.")
        .custom((value) => {
            if (Number(value) < 0) {
                throw new Error("Amount yearly cannot be negative.");
            }
            return true;
        }),

    async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({
                    message: "Validation failed",
                    errors: errors.array(),
                });
            }

            const {
                label,
                amount,
                amount_yearly
            } = req.body;

            const zone = await Zone.create({
                label,
                amount,
                amount_yearly
            });
            return res.status(201).json({
                message: "Zone added successfully.",
                zone,
            });

        } catch (error) {
            console.error("Create teacher error:", error);

            return res.status(500).json({
                message: "Server error.",
            });
        }
    }
];

exports.getAllZone = async (req, res) => {
    try {
        const zones = await Zone.findAll({
            order: [["createdAt", "DESC"]],
        });

        return res.status(200).json({
            message: "Zone retrieved successfully.",
            zones,
        });

    } catch (error) {
        console.error("Get zone error:", error);

        return res.status(500).json({
            message: "Server error.",
        });
    }
};