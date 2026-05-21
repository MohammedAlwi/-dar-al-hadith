const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const config = require('../config');
const { User } = require('../models');
const { authenticate } = require('../middleware/auth');

router.post('/login', [
  body('username').notEmpty().withMessage('اسم المستخدم مطلوب'),
  body('password').notEmpty().withMessage('كلمة المرور مطلوبة'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    }
    if (!user.isActive) {
      return res.status(401).json({ message: 'هذا الحساب غير نشط' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
    res.json({
      token,
      user: { id: user.id, username: user.username, fullName: user.fullName, email: user.email, role: user.role },
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/me', authenticate, async (req, res) => {
  res.json(req.user);
});

router.post('/change-password', authenticate, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const user = await User.findByPk(req.user.id);
    if (!bcrypt.compareSync(req.body.currentPassword, user.password)) {
      return res.status(400).json({ message: 'كلمة المرور الحالية غير صحيحة' });
    }
    user.password = bcrypt.hashSync(req.body.newPassword, 10);
    await user.save();
    res.json({ message: 'تم تغيير كلمة المرور بنجاح' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
