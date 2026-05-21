const express = require('express');
const bcrypt = require('bcryptjs');
const { collections } = require('../db');
const { generateToken, authenticate } = require('../authMiddleware');
const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'الرجاء إدخال اسم المستخدم وكلمة المرور' });
    const users = await collections.User.findAll({ where: { username } });
    const user = users[0];
    if (!user) return res.status(401).json({ message: 'اسم مستخدم أو كلمة مرور غير صحيحة' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'اسم مستخدم أو كلمة مرور غير صحيحة' });
    const token = generateToken(user);
    const { password: _, ...userData } = user;
    res.json({ token, user: userData });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const { password: _, ...userData } = req.user;
    res.json(userData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
