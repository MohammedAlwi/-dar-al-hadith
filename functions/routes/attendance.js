const express = require('express');
const { collections } = require('../db');
const { authenticate } = require('../authMiddleware');
const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { classId, date, studentId, startDate, endDate } = req.query;
    let where = {};
    if (classId) where.classId = classId;
    if (studentId) where.studentId = studentId;
    if (date) where.date = date;
    if (startDate && endDate) {
      where.createdAt = { gte: new Date(startDate), lte: new Date(endDate + 'T23:59:59') };
    }
    let records = await collections.Attendance.findAll({ where, order: { date: 'DESC' } });
    records = await Promise.all(records.map(async (r) => {
      const student = await collections.Student.findByPk(r.studentId);
      return { ...r, studentName: student ? student.name : '' };
    }));
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/report', authenticate, async (req, res) => {
  try {
    const { classId, subjectId, startDate, endDate } = req.query;
    let where = {};
    if (classId) where.classId = classId;
    if (subjectId) where.subjectId = subjectId;
    if (startDate && endDate) {
      where.date = { gte: startDate, lte: endDate };
    }
    let records = await collections.Attendance.findAll({ where, order: { date: 'DESC' } });
    const students = await collections.Student.findAll(
      classId ? { where: { classId } } : {}
    );
    const report = students.map(s => {
      const sRecords = records.filter(r => r.studentId === s.id);
      return {
        studentId: s.id,
        studentName: s.name,
        present: sRecords.filter(r => r.status === 'present').length,
        absent: sRecords.filter(r => r.status === 'absent').length,
        late: sRecords.filter(r => r.status === 'late').length,
        total: sRecords.length,
      };
    });
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { records } = req.body;
    if (!records || !records.length) return res.status(400).json({ message: 'لا توجد سجلات' });
    const created = await collections.Attendance.bulkCreate(records);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const record = await collections.Attendance.update(req.params.id, req.body);
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
