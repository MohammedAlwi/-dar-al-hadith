const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config');
const models = require('./models');

const app = express();

app.use(cors({ origin: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/teachers', require('./routes/teachers'));
app.use('/api/classes', require('./routes/classes'));
app.use('/api/subjects', require('./routes/subjects'));
app.use('/api/academic-years', require('./routes/academicYears'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/grades', require('./routes/grades'));
app.use('/api/dormitories', require('./routes/dormitories'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/room-assignments', require('./routes/roomAssignments'));
app.use('/api/exams', require('./routes/exams'));
app.use('/api/exam-results', require('./routes/examResults'));
app.use('/api/excel', require('./routes/excel'));
app.use('/api/dashboard', require('./routes/dashboard'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
});

const startServer = async () => {
  try {
    await models.sequelize.sync({ force: false });
    const { User, AcademicYear } = models;
    const adminExists = await User.findOne({ where: { username: 'admin' } });
    if (!adminExists) {
      const bcrypt = require('bcryptjs');
      await User.create({
        username: 'admin',
        email: 'admin@daralhadith.com',
        password: bcrypt.hashSync('admin123', 10),
        fullName: 'مدير النظام',
        role: 'admin',
        isActive: true,
      });
      console.log('✔ Admin user created (admin / admin123)');
    }
    const yearExists = await AcademicYear.findOne({ where: { isActive: true } });
    if (!yearExists) {
      const year = new Date().getFullYear();
      await AcademicYear.create({
        name: `${year}-${year + 1}`,
        startDate: `${year}-09-01`,
        endDate: `${year + 1}-06-30`,
        isActive: true,
      });
      console.log('✔ Academic year created');
    }
    const server = app.listen(config.port, () => {
      console.log(`✔ Railway server running on port ${config.port}`);
    });
    return { app, server };
  } catch (err) {
    console.error('Startup error:', err);
    throw err;
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
