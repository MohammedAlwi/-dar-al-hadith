const express = require('express');
const { collections } = require('../db');
const { authenticate, authorize } = require('../authMiddleware');
const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { dormitoryId, status } = req.query;
    let where = {};
    if (dormitoryId) where.dormitoryId = dormitoryId;
    if (status) where.status = status;
    let rooms = await collections.Room.findAll({ where, order: { roomNumber: 'ASC' } });
    rooms = await Promise.all(rooms.map(async (r) => {
      const dormitory = await collections.Dormitory.findByPk(r.dormitoryId);
      const assignments = await collections.RoomAssignment.findAll({ where: { roomId: r.id } });
      return { ...r, dormitoryName: dormitory?.name || '', occupantCount: assignments.length };
    }));
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const room = await collections.Room.findByPk(req.params.id);
    if (!room) return res.status(404).json({ message: 'الغرفة غير موجودة' });
    const dormitory = await collections.Dormitory.findByPk(room.dormitoryId);
    const assignments = await collections.RoomAssignment.findAll({ where: { roomId: room.id } });
    const occupants = await Promise.all(assignments.map(async (a) => {
      const student = await collections.Student.findByPk(a.studentId);
      return { ...a, studentName: student?.name || '' };
    }));
    res.json({ ...room, dormitoryName: dormitory?.name || '', occupants });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const room = await collections.Room.create(req.body);
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const room = await collections.Room.update(req.params.id, req.body);
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await collections.Room.destroy(req.params.id);
    res.json({ message: 'تم الحذف بنجاح' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
