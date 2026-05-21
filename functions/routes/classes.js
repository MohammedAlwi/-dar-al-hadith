const express = require('express');
const { collections } = require('../db');
const { authenticate, authorize } = require('../authMiddleware');
const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const classes = await collections.Class.findAll({ order: { name: 'ASC' } });
    const classesWithCount = await Promise.all(
      classes.map(async (c) => {
        const students = await collections.Student.findAll({ where: { classId: c.id } });
        return { ...c, studentCount: students.length };
      })
    );
    res.json(classesWithCount);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const cls = await collections.Class.findByPk(req.params.id);
    if (!cls) return res.status(404).json({ message: 'الصف غير موجود' });
    const students = await collections.Student.findAll({ where: { classId: cls.id } });
    res.json({ ...cls, studentCount: students.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const cls = await collections.Class.create(req.body);
    res.status(201).json(cls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const cls = await collections.Class.update(req.params.id, req.body);
    res.json(cls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await collections.Class.destroy(req.params.id);
    res.json({ message: 'تم الحذف بنجاح' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
