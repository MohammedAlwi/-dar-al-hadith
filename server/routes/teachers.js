const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { Teacher, User, Subject } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const teachers = await Teacher.findAll({ include: [{ model: User, attributes: { exclude: ['password'] } }, { model: Subject }] });
    res.json(teachers);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', authorize('admin'), async (req, res) => {
  try {
    const { username, email, password, ...teacherData } = req.body;
    const user = await User.create({
      username, email, password: bcrypt.hashSync(password || '123456', 10),
      fullName: teacherData.fullName, role: 'teacher',
    });
    const teacher = await Teacher.create({ ...teacherData, userId: user.id });
    res.status(201).json(teacher);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', authorize('admin'), async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'المعلم غير موجود' });
    await teacher.update(req.body);
    if (req.body.fullName) await User.update({ fullName: req.body.fullName }, { where: { id: teacher.userId } });
    res.json(teacher);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'المعلم غير موجود' });
    await User.destroy({ where: { id: teacher.userId } });
    await teacher.destroy();
    res.json({ message: 'تم حذف المعلم بنجاح' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
