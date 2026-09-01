const Student = require("../models/Student");
const Subscription = require("../models/Subscription");

exports.getAllSubscription = async (req,res) => {
    try{
        const subscriptions = await Subscription.findAll({
            include:[
                {
                    model:Student,
                    as:"student",
                    attributes:["id","name","last_name","class"]
                }
            ]
        });
        if(subscriptions.length === 0) {
             return res.status(404).json({
            message: "subscriptions empty.",
        });
        }
        return res.json({
            message: "subscriptions retrieved successfully.",
            subscriptions,
        })
    }catch{
        console.error("Get Supervisors error:", error);

        return res.status(500).json({
            message: "Server error.",
        });
    }
}

exports.paySubscription = async (req, res) => {
    try {
        const { id } = req.params;
        const subscription = await Subscription.findByPk(id);
        if (!subscription) {
            return res.status(404).json({
                message: "subscription not found.",
            });
        }
        await subscription.update({ status: "payé" });
        return res.json({
            message: "subscription payed with success.",
        });
    } catch (error) {
        console.error("Pay subscription error:", error);

        return res.status(500).json({
            message: "Server error.",
        });
    }
}