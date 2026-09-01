const express = require("express");
const { createZone, getAllZone } = require("../controllers/ZoneController");
const router = express.Router()

router.get("/",getAllZone)
router.post("/",createZone)

module.exports = router