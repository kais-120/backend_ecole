const express = require("express");
const { createStudent, getAllStudents, deleteStudents, updateStudent } = require("../controllers/StudentController");
const router = express.Router()

router.get("/",getAllStudents)
router.post("/",createStudent)
router.delete("/:id",deleteStudents)
router.put("/:id",updateStudent)

module.exports = router