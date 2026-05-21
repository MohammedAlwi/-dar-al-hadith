const jwt = require('jsonwebtoken');
const config = require('../config');
const { User } = require('../models');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'الرجاء تسجيل الدخول أولاً' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findByPk(decoded.id, { attributes: { exclude: ['password'] } });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'المستخدم غير موجود أو غير نشط' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'انتهت صلاحية الجلسة، الرجاء تسجيل الدخول مرة أخرى' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'ليس لديك صلاحية للوصول إلى هذه الميزة' });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
