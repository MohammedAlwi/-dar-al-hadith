const express = require('express');
const router = express.Router();
const { Subject, Teacher, Class, AcademicYear } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const subjects = await Subject.findAll({
      include: [{ model: Teacher }, { model: Class }, { model: AcademicYear, where: { isActive: true } }],
    });
    res.json(subjects);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', authorize('admin'), async (req, res) => {
  try {
    const activeYear = await AcademicYear.findOne({ where: { isActive: true } });
    const subject = await Subject.create({ ...req.body, academicYearId: activeYear.id });
    res.status(201).json(subject);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', authorize('admin'), async (req, res) => {
  try {
    const subject = await Subject.findByPk(req.params.id);
    if (!subject) return res.status(404).json({ message: 'المادة غير موجودة' });
    await subject.update(req.body);
    res.json(subject);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const subject = await Subject.findByPk(req.params.id);
    if (!subject) return res.status(404).json({ message: 'المادة غير موجودة' });
    await subject.destroy();
    res.json({ message: 'تم حذف المادة بنجاح' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
