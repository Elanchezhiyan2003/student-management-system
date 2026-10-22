
const express = require("express");
const mongoose = require("mongoose");
const Student = require("../models/Student");

const router = express.Router();

router.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: "Student records are unavailable because the database is disconnected",
    });
  }

  next();
});

// GET: View all students
router.get("/", async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch students" });
  }
});

// POST: Add a student
router.post("/", async (req, res) => {
  try {
    const { name, email, age, course } = req.body;

    if (
      !name?.trim() ||
      !email?.trim() ||
      age === undefined ||
      age === "" ||
      !course?.trim()
    ) {
      return res.status(400).json({
        message: "Name, email, age, and course are required",
      });
    }

    const student = await Student.create({
      name,
      email,
      age,
      course,
    });

    res.status(201).json(student);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "A student with this email already exists",
      });
    }

    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Failed to add student" });
  }
});


// PUT: Update a student by ID
router.put("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    const { name, email, age, course } = req.body;

    if (
      !name?.trim() ||
      !email?.trim() ||
      age === undefined ||
      age === "" ||
      !course?.trim()
    ) {
      return res.status(400).json({
        message: "Name, email, age, and course are required",
      });
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        age: Number(age),
        course: course.trim(),
      },
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json(student);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "A student with this email already exists",
      });
    }

    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Failed to update student" });
  }
});

// DELETE: Remove a student by ID
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete student" });
  }
});


module.exports = router;
