const express = require('express');
const { collections } = require('../db');
const { authenticate } = require('../authMiddleware');
const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { roomId, studentId } = req.query;
    let where = {};
    if (roomId) where.roomId = roomId;
    if (studentId) where.studentId = studentId;
    let assignments = await collections.RoomAssignment.findAll({ where, order: { createdAt: 'DESC' } });
    assignments = await Promise.all(assignments.map(async (a) => {
      const [student, room] = await Promise.all([
        collections.Student.findByPk(a.studentId),
        collections.Room.findByPk(a.roomId),
      ]);
      return { ...a, studentName: student?.name || '', roomNumber: room?.roomNumber || '' };
    }));
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const assignment = await collections.RoomAssignment.create(req.body);
    res.status(201).json(assignment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const assignment = await collections.RoomAssignment.update(req.params.id, req.body);
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    await collections.RoomAssignment.destroy(req.params.id);
    res.json({ message: 'تم الحذف بنجاح' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
