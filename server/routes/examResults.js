const express = require('express');
const router = express.Router();
const { ExamResult, Exam, Student, Subject, Class } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { examId, studentId } = req.query;
    const where = {};
    if (examId) where.examId = examId;
    if (studentId) where.studentId = studentId;

    const results = await ExamResult.findAll({
      where,
      include: [{ model: Exam, include: [{ model: Subject }] }, { model: Student }],
    });
    res.json(results);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/batch', authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { records } = req.body;
    const created = [];
    for (const record of records) {
      const exam = await Exam.findByPk(record.examId);
      const percentage = exam ? (record.grade / exam.maxGrade) * 100 : 0;
      const [result, created_at] = await ExamResult.findOrCreate({
        where: { examId: record.examId, studentId: record.studentId },
        defaults: { ...record, percentage },
      });
      if (!created_at) {
        await result.update({ grade: record.grade, percentage, notes: record.notes || '' });
      }
      created.push(result);
    }
    res.status(201).json(created);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', authorize('admin', 'teacher'), async (req, res) => {
  try {
    const result = await ExamResult.findByPk(req.params.id);
    if (!result) return res.status(404).json({ message: 'النتيجة غير موجودة' });
    const exam = await Exam.findByPk(result.examId);
    const percentage = exam ? (req.body.grade / exam.maxGrade) * 100 : 0;
    await result.update({ ...req.body, percentage });
    res.json(result);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
