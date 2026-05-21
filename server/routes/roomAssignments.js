const express = require('express');
const router = express.Router();
const { RoomAssignment, Student, Room, Dormitory } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { roomId, isActive } = req.query;
    const where = {};
    if (roomId) where.roomId = roomId;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const assignments = await RoomAssignment.findAll({
      where,
      include: [{ model: Student }, { model: Room, include: [{ model: Dormitory }] }],
    });
    res.json(assignments);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', authorize('admin'), async (req, res) => {
  try {
    const activeAssignment = await RoomAssignment.findOne({ where: { studentId: req.body.studentId, isActive: true } });
    if (activeAssignment) {
      return res.status(400).json({ message: 'هذا الطالب مسجل بالفعل في غرفة' });
    }
    const assignment = await RoomAssignment.create(req.body);
    const fullAssignment = await RoomAssignment.findByPk(assignment.id, {
      include: [{ model: Student }, { model: Room, include: [{ model: Dormitory }] }],
    });
    res.status(201).json(fullAssignment);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', authorize('admin'), async (req, res) => {
  try {
    const assignment = await RoomAssignment.findByPk(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'التسجيل غير موجود' });
    await assignment.update(req.body);
    res.json(assignment);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const assignment = await RoomAssignment.findByPk(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'التسجيل غير موجود' });
    await assignment.destroy();
    res.json({ message: 'تم حذف التسجيل بنجاح' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
