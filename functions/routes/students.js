const express = require('express');
const { collections } = require('../db');
const { authenticate, authorize } = require('../authMiddleware');
const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { classId, search, status } = req.query;
    let options = {};
    if (classId) options.where = { ...options.where, classId };
    if (search) options.where = { ...options.where, name: { like: `%${search}%` } };
    if (status) options.where = { ...options.where, status };
    options.order = { createdAt: 'DESC' };
    const students = await collections.Student.findAll(options);
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const student = await collections.Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ message: 'الطالب غير موجود' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const student = await collections.Student.create(req.body);
    res.status(201).json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const student = await collections.Student.update(req.params.id, req.body);
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await collections.Student.destroy(req.params.id);
    res.json({ message: 'تم الحذف بنجاح' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
