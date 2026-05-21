const express = require('express');
const { collections } = require('../db');
const { authenticate, authorize } = require('../authMiddleware');
const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const subjects = await collections.Subject.findAll({ order: { name: 'ASC' } });
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const subject = await collections.Subject.findByPk(req.params.id);
    if (!subject) return res.status(404).json({ message: 'المادة غير موجودة' });
    res.json(subject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const subject = await collections.Subject.create(req.body);
    res.status(201).json(subject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const subject = await collections.Subject.update(req.params.id, req.body);
    res.json(subject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await collections.Subject.destroy(req.params.id);
    res.json({ message: 'تم الحذف بنجاح' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
