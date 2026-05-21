const express = require('express');
const { collections } = require('../db');
const { authenticate, authorize } = require('../authMiddleware');
const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const dormitories = await collections.Dormitory.findAll({ order: { name: 'ASC' } });
    const withCounts = await Promise.all(dormitories.map(async (d) => {
      const rooms = await collections.Room.findAll({ where: { dormitoryId: d.id } });
      return { ...d, roomCount: rooms.length };
    }));
    res.json(withCounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const dormitory = await collections.Dormitory.findByPk(req.params.id);
    if (!dormitory) return res.status(404).json({ message: 'المبنى غير موجود' });
    const rooms = await collections.Room.findAll({ where: { dormitoryId: dormitory.id } });
    res.json({ ...dormitory, rooms });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const dormitory = await collections.Dormitory.create(req.body);
    res.status(201).json(dormitory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const dormitory = await collections.Dormitory.update(req.params.id, req.body);
    res.json(dormitory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await collections.Dormitory.destroy(req.params.id);
    res.json({ message: 'تم الحذف بنجاح' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
