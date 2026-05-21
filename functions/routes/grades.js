const express = require('express');
const { collections } = require('../db');
const { authenticate } = require('../authMiddleware');
const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { classId, subjectId, studentId, examId, academicYearId } = req.query;
    let where = {};
    if (classId) where.classId = classId;
    if (subjectId) where.subjectId = subjectId;
    if (studentId) where.studentId = studentId;
    if (examId) where.examId = examId;
    if (academicYearId) where.academicYearId = academicYearId;
    let grades = await collections.Grade.findAll({ where, order: { createdAt: 'DESC' } });
    grades = await Promise.all(grades.map(async (g) => {
      const [student, subject, exam] = await Promise.all([
        collections.Student.findByPk(g.studentId),
        collections.Subject.findByPk(g.subjectId),
        g.examId ? collections.Exam.findByPk(g.examId) : null,
      ]);
      return { ...g, studentName: student?.name || '', subjectName: subject?.name || '', examName: exam?.name || '' };
    }));
    res.json(grades);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/report', authenticate, async (req, res) => {
  try {
    const { classId, examId, academicYearId } = req.query;
    let where = {};
    if (classId) where.classId = classId;
    if (examId) where.examId = examId;
    if (academicYearId) where.academicYearId = academicYearId;
    const grades = await collections.Grade.findAll({ where });
    const students = await collections.Student.findAll(classId ? { where: { classId } } : {});
    const subjects = await collections.Subject.findAll();
    const report = students.map(s => {
      const sGrades = grades.filter(g => g.studentId === s.id);
      return {
        studentId: s.id,
        studentName: s.name,
        subjects: subjects.map(sub => ({
          subjectId: sub.id,
          subjectName: sub.name,
          grade: sGrades.find(g => g.subjectId === sub.id)?.score || null,
        })),
        total: sGrades.reduce((sum, g) => sum + Number(g.score || 0), 0),
        average: sGrades.length ? (sGrades.reduce((sum, g) => sum + Number(g.score || 0), 0) / sGrades.length).toFixed(2) : 0,
      };
    });
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const grade = await collections.Grade.create(req.body);
    res.status(201).json(grade);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const grade = await collections.Grade.update(req.params.id, req.body);
    res.json(grade);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    await collections.Grade.destroy(req.params.id);
    res.json({ message: 'تم الحذف بنجاح' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
