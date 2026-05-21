const express = require('express');
const { collections } = require('../db');
const { authenticate } = require('../authMiddleware');
const router = express.Router();

router.get('/stats', authenticate, async (req, res) => {
  try {
    const [students, teachers, classes, subjects, dormitories] = await Promise.all([
      collections.Student.findAll(),
      collections.Teacher.findAll(),
      collections.Class.findAll(),
      collections.Subject.findAll(),
      collections.Dormitory.findAll(),
    ]);
    res.json({
      totalStudents: students.length,
      totalTeachers: teachers.length,
      totalClasses: classes.length,
      totalSubjects: subjects.length,
      totalDormitories: dormitories.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/recent', authenticate, async (req, res) => {
  try {
    const [students, attendance] = await Promise.all([
      collections.Student.findAll({ order: { createdAt: 'DESC' }, limit: 5 }),
      collections.Attendance.findAll({ order: { createdAt: 'DESC' }, limit: 10 }),
    ]);
    const attendanceWithNames = await Promise.all(attendance.map(async (a) => {
      const student = await collections.Student.findByPk(a.studentId);
      return { ...a, studentName: student?.name || '' };
    }));
    res.json({ recentStudents: students, recentAttendance: attendanceWithNames });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/attendance-summary', authenticate, async (req, res) => {
  try {
    const allAttendance = await collections.Attendance.findAll();
    const present = allAttendance.filter(a => a.status === 'present').length;
    const absent = allAttendance.filter(a => a.status === 'absent').length;
    const late = allAttendance.filter(a => a.status === 'late').length;
    res.json({ present, absent, late, total: allAttendance.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/classes-distribution', authenticate, async (req, res) => {
  try {
    const classes = await collections.Class.findAll();
    const distribution = await Promise.all(classes.map(async (c) => {
      const students = await collections.Student.findAll({ where: { classId: c.id } });
      return { name: c.name, count: students.length };
    }));
    res.json(distribution);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
