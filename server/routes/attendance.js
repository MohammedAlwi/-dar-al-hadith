const express = require('express');
const router = express.Router();
const { Op, where: seqWhere, col } = require('sequelize');
const { Attendance, Student, Class, Subject, Teacher, AcademicYear } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { classId, subjectId, date, studentId, startDate, endDate } = req.query;
    const conditions = [];
    if (classId) conditions.push(seqWhere(col('Attendance.classId'), '=', classId));
    if (subjectId) conditions.push(seqWhere(col('Attendance.subjectId'), '=', subjectId));
    if (studentId) conditions.push(seqWhere(col('Attendance.studentId'), '=', studentId));
    if (date) conditions.push(seqWhere(col('Attendance.date'), '=', date));
    if (startDate && endDate) {
      conditions.push({ [Op.and]: [
        seqWhere(col('Attendance.date'), '>=', startDate),
        seqWhere(col('Attendance.date'), '<=', endDate),
      ]});
    }

    const records = await Attendance.findAll({
      where: conditions.length > 0 ? { [Op.and]: conditions } : {},
      include: [{ model: Student, attributes: ['id', 'fullName', 'studentNumber'] }, { model: Class, attributes: ['id', 'name'] }, { model: Subject, attributes: ['id', 'name', 'nameAr'] }, { model: Teacher, attributes: ['id', 'fullName'] }],
      order: [['date', 'DESC']],
    });
    res.json(records);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/batch', authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { records } = req.body;
    const created = [];
    for (const record of records) {
      const [attendance, created_at] = await Attendance.findOrCreate({
        where: { studentId: record.studentId, date: record.date, subjectId: record.subjectId },
        defaults: { ...record, teacherId: req.user.teacherId || req.user.id },
      });
      if (!created_at) {
        await attendance.update({ status: record.status, notes: record.notes || '' });
      }
      created.push(attendance);
    }
    res.json(created);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', authorize('admin', 'teacher'), async (req, res) => {
  try {
    const attendance = await Attendance.create({ ...req.body, teacherId: req.user.teacherId || req.user.id });
    res.status(201).json(attendance);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', authorize('admin', 'teacher'), async (req, res) => {
  try {
    const attendance = await Attendance.findByPk(req.params.id);
    if (!attendance) return res.status(404).json({ message: 'سجل الحضور غير موجود' });
    await attendance.update(req.body);
    res.json(attendance);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const attendance = await Attendance.findByPk(req.params.id);
    if (!attendance) return res.status(404).json({ message: 'سجل الحضور غير موجود' });
    await attendance.destroy();
    res.json({ message: 'تم حذف السجل بنجاح' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/report/:classId', async (req, res) => {
  try {
    const { classId } = req.params;
    const { startDate, endDate } = req.query;
    const students = await Student.findAll({ where: { classId, status: 'active' } });
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.date = { [require('sequelize').Op.between]: [startDate, endDate] };
    }

    const report = await Promise.all(students.map(async (student) => {
      const attendance = await Attendance.findAll({ where: { studentId: student.id, ...dateFilter } });
      const total = attendance.length;
      const present = attendance.filter(a => a.status === 'present').length;
      const absent = attendance.filter(a => a.status === 'absent').length;
      const late = attendance.filter(a => a.status === 'late').length;
      const excused = attendance.filter(a => a.status === 'excused').length;
      return {
        student: { id: student.id, fullName: student.fullName, studentNumber: student.studentNumber },
        total, present, absent, late, excused,
        attendanceRate: total ? ((present + excused) / total * 100).toFixed(1) : 0,
      };
    }));

    res.json(report);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
