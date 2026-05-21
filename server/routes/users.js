const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize('admin'));

router.get('/', async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] }, order: [['createdAt', 'DESC']] });
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { username, email, password, fullName, role, phone } = req.body;
    const exist = await User.findOne({ where: { username } });
    if (exist) return res.status(400).json({ message: 'اسم المستخدم موجود مسبقاً' });
    const emailExist = await User.findOne({ where: { email } });
    if (emailExist) return res.status(400).json({ message: 'البريد الإلكتروني موجود مسبقاً' });
    const user = await User.create({ username, email, password: bcrypt.hashSync(password, 10), fullName, role: role || 'teacher', phone, isActive: true });
    const { password: _, ...userData } = user.toJSON();
    res.status(201).json(userData);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });
    const updates = {};
    if (req.body.fullName) updates.fullName = req.body.fullName;
    if (req.body.email) updates.email = req.body.email;
    if (req.body.role) updates.role = req.body.role;
    if (req.body.phone) updates.phone = req.body.phone;
    if (req.body.isActive !== undefined) updates.isActive = req.body.isActive;
    if (req.body.password) updates.password = bcrypt.hashSync(req.body.password, 10);
    await user.update(updates);
    const { password: _, ...userData } = user.toJSON();
    res.json(userData);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });
    if (user.role === 'admin') return res.status(400).json({ message: 'لا يمكن حذف حساب مسئول' });
    if (user.id === req.user.id) return res.status(400).json({ message: 'لا يمكن حذف حسابك الشخصي' });
    await user.destroy();
    res.json({ message: 'تم الحذف بنجاح' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
