const express = require("express");
const { getPrices } = require("../controllers/PriceController");
const router = express.Router()

router.get("/",getPrices)

module.exports = router