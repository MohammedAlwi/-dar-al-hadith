const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Student, Class, AcademicYear, Attendance, Grade, RoomAssignment } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { status, classId, search } = req.query;
    const where = {};
    if (status) where.status = status;
    if (classId) where.classId = classId;
    if (search) {
      where[require('sequelize').Op.or] = [
        { fullName: { [require('sequelize').Op.like]: `%${search}%` } },
        { studentNumber: { [require('sequelize').Op.like]: `%${search}%` } },
      ];
    }
    const students = await Student.findAll({
      where,
      include: [{ model: Class }, { model: AcademicYear, where: { isActive: true }, required: false }],
      order: [['fullName', 'ASC']],
    });
    res.json(students);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id, {
      include: [
        { model: Class },
        { model: AcademicYear },
        { model: Attendance },
        { model: Grade },
        { model: RoomAssignment },
      ],
    });
    if (!student) return res.status(404).json({ message: 'الطالب غير موجود' });
    res.json(student);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', authorize('admin'), [
  body('fullName').notEmpty().withMessage('اسم الطالب مطلوب'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const activeYear = await AcademicYear.findOne({ where: { isActive: true } });
    const classObj = await Class.findByPk(req.body.classId);

    const student = await Student.create({
      ...req.body,
      academicYearId: activeYear?.id,
      studentNumber: req.body.studentNumber || `STD-${Date.now()}`,
    });
    res.status(201).json(student);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', authorize('admin'), async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ message: 'الطالب غير موجود' });
    await student.update(req.body);
    res.json(student);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ message: 'الطالب غير موجود' });
    await student.destroy();
    res.json({ message: 'تم حذف الطالب بنجاح' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
