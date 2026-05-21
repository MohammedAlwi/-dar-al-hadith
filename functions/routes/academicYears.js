const express = require('express');
const { collections } = require('../db');
const { authenticate, authorize } = require('../authMiddleware');
const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const years = await collections.AcademicYear.findAll({ order: { createdAt: 'DESC' } });
    res.json(years);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/current', authenticate, async (req, res) => {
  try {
    const year = await collections.AcademicYear.findOne({ where: { isCurrent: true } });
    if (!year) return res.status(404).json({ message: 'لا يوجد عام دراسي نشط' });
    res.json(year);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const year = await collections.AcademicYear.findByPk(req.params.id);
    if (!year) return res.status(404).json({ message: 'العام الدراسي غير موجود' });
    res.json(year);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const year = await collections.AcademicYear.create(req.body);
    res.status(201).json(year);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    if (req.body.isCurrent) {
      const allYears = await collections.AcademicYear.findAll();
      await Promise.all(allYears.map(y => collections.AcademicYear.update(y.id, { isCurrent: false })));
    }
    const year = await collections.AcademicYear.update(req.params.id, req.body);
    res.json(year);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await collections.AcademicYear.destroy(req.params.id);
    res.json({ message: 'تم الحذف بنجاح' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
