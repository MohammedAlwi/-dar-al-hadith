const express = require('express');
const router = express.Router();
const { AcademicYear } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const years = await AcademicYear.findAll({ order: [['startDate', 'DESC']] });
    res.json(years);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', authorize('admin'), async (req, res) => {
  try {
    if (req.body.isActive) {
      await AcademicYear.update({ isActive: false }, { where: { isActive: true } });
    }
    const year = await AcademicYear.create(req.body);
    res.status(201).json(year);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', authorize('admin'), async (req, res) => {
  try {
    const year = await AcademicYear.findByPk(req.params.id);
    if (!year) return res.status(404).json({ message: 'السنة الدراسية غير موجودة' });
    if (req.body.isActive) {
      await AcademicYear.update({ isActive: false }, { where: { isActive: true } });
    }
    await year.update(req.body);
    res.json(year);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
