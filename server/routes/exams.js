const express = require('express');
const router = express.Router();
const { Op, where: seqWhere, col } = require('sequelize');
const { Exam, Subject, Class, AcademicYear, ExamResult } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { classId, subjectId, term } = req.query;
    const conditions = [];
    if (classId) conditions.push(seqWhere(col('Exam.classId'), '=', classId));
    if (subjectId) conditions.push(seqWhere(col('Exam.subjectId'), '=', subjectId));
    if (term) conditions.push(seqWhere(col('Exam.term'), '=', term));

    const exams = await Exam.findAll({
      where: conditions.length > 0 ? { [Op.and]: conditions } : {},
      include: [{ model: Subject, attributes: ['id', 'name', 'nameAr'] }, { model: Class, attributes: ['id', 'name'] }, { model: AcademicYear, where: { isActive: true }, attributes: ['id', 'name'] }],
    });
    res.json(exams);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', authorize('admin', 'teacher'), async (req, res) => {
  try {
    const activeYear = await AcademicYear.findOne({ where: { isActive: true } });
    const exam = await Exam.create({ ...req.body, academicYearId: activeYear.id });
    res.status(201).json(exam);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', authorize('admin', 'teacher'), async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.id);
    if (!exam) return res.status(404).json({ message: 'الامتحان غير موجود' });
    await exam.update(req.body);
    res.json(exam);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.id);
    if (!exam) return res.status(404).json({ message: 'الامتحان غير موجود' });
    await exam.destroy();
    res.json({ message: 'تم حذف الامتحان بنجاح' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
