const jwt = require('jsonwebtoken');
const { collections } = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'dar-al-hadith-secret-key-2024';

function generateToken(user) {
  return jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

async function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'مطلوب تسجيل الدخول' });
  }
  try {
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await collections.User.findByPk(decoded.id);
    if (!user) return res.status(401).json({ message: 'المستخدم غير موجود' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'رمز غير صالح' });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'ليس لديك صلاحية' });
    }
    next();
  };
}

module.exports = { generateToken, authenticate, authorize };
