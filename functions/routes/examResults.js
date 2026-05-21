const express = require('express');
const { collections } = require('../db');
const { authenticate } = require('../authMiddleware');
const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { examId, studentId, classId } = req.query;
    let where = {};
    if (examId) where.examId = examId;
    if (studentId) where.studentId = studentId;
    if (classId) where.classId = classId;
    let results = await collections.ExamResult.findAll({ where, order: { score: 'DESC' } });
    results = await Promise.all(results.map(async (r) => {
      const [student, exam] = await Promise.all([
        collections.Student.findByPk(r.studentId),
        collections.Exam.findByPk(r.examId),
      ]);
      return { ...r, studentName: student?.name || '', examName: exam?.name || '' };
    }));
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const result = await collections.ExamResult.create(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const result = await collections.ExamResult.update(req.params.id, req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    await collections.ExamResult.destroy(req.params.id);
    res.json({ message: 'تم الحذف بنجاح' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/bulk', authenticate, async (req, res) => {
  try {
    const { results } = req.body;
    if (!results || !results.length) return res.status(400).json({ message: 'لا توجد نتائج' });
    const created = await collections.ExamResult.bulkCreate(results);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
