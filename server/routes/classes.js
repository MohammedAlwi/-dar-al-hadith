const express = require('express');
const router = express.Router();
const { Class, AcademicYear, Teacher, Student } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const classes = await Class.findAll({
      include: [
        { model: AcademicYear, where: { isActive: true } },
        { model: Teacher, as: 'homeroomTeacher' },
        { model: Student },
      ],
    });
    res.json(classes);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', authorize('admin'), async (req, res) => {
  try {
    const activeYear = await AcademicYear.findOne({ where: { isActive: true } });
    const classObj = await Class.create({ ...req.body, academicYearId: activeYear.id });
    res.status(201).json(classObj);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', authorize('admin'), async (req, res) => {
  try {
    const classObj = await Class.findByPk(req.params.id);
    if (!classObj) return res.status(404).json({ message: 'الصف غير موجود' });
    await classObj.update(req.body);
    res.json(classObj);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const classObj = await Class.findByPk(req.params.id);
    if (!classObj) return res.status(404).json({ message: 'الصف غير موجود' });
    await classObj.destroy();
    res.json({ message: 'تم حذف الصف بنجاح' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
