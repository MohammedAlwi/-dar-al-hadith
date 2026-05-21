const express = require('express');
const { collections } = require('../db');
const { authenticate, authorize } = require('../authMiddleware');
const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { academicYearId, classId, subjectId } = req.query;
    let where = {};
    if (academicYearId) where.academicYearId = academicYearId;
    if (classId) where.classId = classId;
    if (subjectId) where.subjectId = subjectId;
    let exams = await collections.Exam.findAll({ where, order: { date: 'DESC' } });
    exams = await Promise.all(exams.map(async (e) => {
      const [subject, cls] = await Promise.all([
        collections.Subject.findByPk(e.subjectId),
        collections.Class.findByPk(e.classId),
      ]);
      return { ...e, subjectName: subject?.name || '', className: cls?.name || '' };
    }));
    res.json(exams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const exam = await collections.Exam.findByPk(req.params.id);
    if (!exam) return res.status(404).json({ message: 'الامتحان غير موجود' });
    const [subject, cls] = await Promise.all([
      collections.Subject.findByPk(exam.subjectId),
      collections.Class.findByPk(exam.classId),
    ]);
    res.json({ ...exam, subjectName: subject?.name || '', className: cls?.name || '' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const exam = await collections.Exam.create(req.body);
    res.status(201).json(exam);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const exam = await collections.Exam.update(req.params.id, req.body);
    res.json(exam);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await collections.Exam.destroy(req.params.id);
    res.json({ message: 'تم الحذف بنجاح' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
