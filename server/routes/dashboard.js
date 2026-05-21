const express = require('express');
const router = express.Router();
const { Op, fn, col } = require('sequelize');
const { Student, Teacher, Class, Subject, Attendance, Grade, Dormitory, Room, RoomAssignment, AcademicYear } = require('../models');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/stats', async (req, res) => {
  try {
    const activeYear = await AcademicYear.findOne({ where: { isActive: true } });

    const totalStudents = await Student.count({ where: { status: 'active' } });
    const totalTeachers = await Teacher.count({ where: { isActive: true } });
    const totalClasses = await Class.count({ where: { academicYearId: activeYear?.id } });
    const totalSubjects = await Subject.count({ where: { academicYearId: activeYear?.id } });
    const totalDormitories = await Dormitory.count();
    const totalRooms = await Room.count();
    const totalResidents = await RoomAssignment.count({ where: { isActive: true } });

    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = await Attendance.count({ where: { date: today } });
    const todayPresent = await Attendance.count({ where: { date: today, status: 'present' } });
    const todayAbsent = await Attendance.count({ where: { date: today, status: 'absent' } });

    const classCounts = await Student.findAll({
      attributes: ['classId', [fn('COUNT', col('Student.id')), 'count']],
      where: { status: 'active' },
      group: ['classId'],
      raw: true,
    });

    const classIds = classCounts.map(c => c.classId).filter(Boolean);
    const classMap = {};
    if (classIds.length > 0) {
      const classes = await Class.findAll({ where: { id: classIds } });
      classes.forEach(c => { classMap[c.id] = c; });
    }

    const studentsByClass = classCounts.map(c => ({
      classId: c.classId,
      count: parseInt(c.count),
      Class: classMap[c.classId] || null,
    }));

    res.json({
      totalStudents, totalTeachers, totalClasses, totalSubjects,
      totalDormitories, totalRooms, totalResidents,
      todayAttendance, todayPresent, todayAbsent,
      studentsByClass,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/recent-attendance', async (req, res) => {
  try {
    const records = await Attendance.findAll({
      include: [{ model: Student, attributes: ['id', 'fullName', 'studentNumber'] }, { model: Subject, attributes: ['id', 'name'] }],
      order: [['date', 'DESC'], [col('Attendance.createdAt'), 'DESC']],
      limit: 20,
    });
    res.json(records);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/attendance-chart', async (req, res) => {
  try {
    const { period } = req.query;
    const days = parseInt(period) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const records = await Attendance.findAll({
      attributes: ['date', 'status', [fn('COUNT', col('id')), 'count']],
      where: { date: { [Op.gte]: startDate.toISOString().split('T')[0] } },
      group: ['date', 'status'],
      order: [['date', 'ASC']],
    });
    res.json(records);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
