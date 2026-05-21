const express = require('express');
const router = express.Router();
const { Room, Dormitory, RoomAssignment, Student } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { dormitoryId } = req.query;
    const where = {};
    if (dormitoryId) where.dormitoryId = dormitoryId;
    const rooms = await Room.findAll({
      where,
      include: [{ model: Dormitory }, { model: RoomAssignment, include: [{ model: Student }] }],
    });
    res.json(rooms);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', authorize('admin'), async (req, res) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json(room);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', authorize('admin'), async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) return res.status(404).json({ message: 'الغرفة غير موجودة' });
    await room.update(req.body);
    res.json(room);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) return res.status(404).json({ message: 'الغرفة غير موجودة' });
    await room.destroy();
    res.json({ message: 'تم حذف الغرفة بنجاح' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
