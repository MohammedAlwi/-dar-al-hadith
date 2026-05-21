const express = require('express');
const router = express.Router();
const { Grade, Student, Subject, Teacher, AcademicYear, Class } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const { Op } = require('sequelize');

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { studentId, subjectId, classId, term, type } = req.query;
    const where = {};
    if (studentId) where.studentId = studentId;
    if (subjectId) where.subjectId = subjectId;
    if (term) where.term = term;
    if (type) where.type = type;
    if (classId) {
      const students = await Student.findAll({ where: { classId }, attributes: ['id'] });
      where.studentId = { [Op.in]: students.map(s => s.id) };
    }

    const grades = await Grade.findAll({
      where,
      include: [
        { model: Student, include: [{ model: Class }] },
        { model: Subject },
        { model: Teacher },
        { model: AcademicYear, where: { isActive: true } },
      ],
      order: [['date', 'DESC']],
    });
    res.json(grades);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/batch', authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { records } = req.body;
    const activeYear = await AcademicYear.findOne({ where: { isActive: true } });
    const created = [];
    for (const record of records) {
      const grade = await Grade.create({
        ...record,
        teacherId: req.user.teacherId || req.user.id,
        academicYearId: activeYear?.id,
      });
      created.push(grade);
    }
    res.status(201).json(created);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', authorize('admin', 'teacher'), async (req, res) => {
  try {
    const activeYear = await AcademicYear.findOne({ where: { isActive: true } });
    const grade = await Grade.create({
      ...req.body,
      teacherId: req.user.teacherId || req.user.id,
      academicYearId: activeYear?.id,
    });
    res.status(201).json(grade);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', authorize('admin', 'teacher'), async (req, res) => {
  try {
    const grade = await Grade.findByPk(req.params.id);
    if (!grade) return res.status(404).json({ message: 'الدرجة غير موجودة' });
    await grade.update(req.body);
    res.json(grade);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const grade = await Grade.findByPk(req.params.id);
    if (!grade) return res.status(404).json({ message: 'الدرجة غير موجودة' });
    await grade.destroy();
    res.json({ message: 'تم حذف الدرجة بنجاح' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/report/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findByPk(studentId, { include: [{ model: Class }] });
    if (!student) return res.status(404).json({ message: 'الطالب غير موجود' });

    const subjects = await Subject.findAll({ where: { classId: student.classId } });
    const grades = await Grade.findAll({ where: { studentId, academicYearId: (await AcademicYear.findOne({ where: { isActive: true } }))?.id } });

    const report = subjects.map(subject => {
      const subjectGrades = grades.filter(g => g.subjectId === subject.id);
      const total = subjectGrades.reduce((sum, g) => sum + g.grade, 0);
      const maxTotal = subjectGrades.reduce((sum, g) => sum + (g.maxGrade || 100), 0);
      return {
        subject: { id: subject.id, name: subject.name, coefficient: subject.coefficient },
        grades: subjectGrades,
        total,
        maxTotal,
        percentage: maxTotal ? ((total / maxTotal) * 100).toFixed(1) : 0,
        weightedScore: maxTotal ? ((total / maxTotal) * (subject.coefficient || 1) * 100).toFixed(1) : 0,
      };
    });

    const overallPercentage = report.reduce((sum, r) => sum + parseFloat(r.percentage), 0) / (report.length || 1);
    res.json({ student, subjects: report, overallPercentage: overallPercentage.toFixed(1) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
