const express = require("express");

const router = express.Router();

const {
  getSchoolInfo,
  updateSchoolInfo,
} = require("../controllers/schoolInfoController");

router.get("/", getSchoolInfo);

router.put("/", updateSchoolInfo);

module.exports = router;