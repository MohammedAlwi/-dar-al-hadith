const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { parseExcel, createExcel, getSheetNames } = require('../utils/excel');
const { Student, Grade, Attendance, Subject, Class, AcademicYear, Teacher, Dormitory, Room, RoomAssignment, Exam, ExamResult, User } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const { Op } = require('sequelize');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, fileFilter: (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (['.xlsx', '.xls', '.csv'].includes(ext)) cb(null, true);
  else cb(new Error('يرجى رفع ملف Excel فقط (.xlsx, .xls, .csv)'));
}});

router.use(authenticate);

router.post('/upload', authorize('admin'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'الرجاء اختيار ملف' });
    const { data, sheetNames } = parseExcel(req.file.path);
    res.json({
      fileName: req.file.filename,
      originalName: req.file.originalname,
      sheetNames,
      rowCount: data.length,
      columns: data.length ? Object.keys(data[0]) : [],
      preview: data.slice(0, 10),
      filePath: req.file.path,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/import-students', authorize('admin'), upload.single('file'), async (req, res) => {
  try {
    const { data } = parseExcel(req.file.path);
    const activeYear = await AcademicYear.findOne({ where: { isActive: true } });
    const results = { imported: 0, skipped: 0, errors: [] };

    for (let i = 0; i < data.length; i++) {
      try {
        const row = data[i];
        const existing = await Student.findOne({
          where: { [Op.or]: [{ studentNumber: row.رقم_الطالب || row.studentNumber }, { fullName: row.الاسم || row.fullName }] },
        });
        if (existing) { results.skipped++; continue; }

        await Student.create({
          studentNumber: row.رقم_الطالب || row.studentNumber || `STD-${Date.now()}-${i}`,
          fullName: row.الاسم || row.fullName,
          fullNameAr: row.الاسم_بالعربية || row.fullNameAr,
          dateOfBirth: row.تاريخ_الميلاد || row.dateOfBirth,
          placeOfBirth: row.مكان_الميلاد || row.placeOfBirth,
          nationality: row.الجنسية || row.nationality,
          phone: row.الهاتف || row.phone,
          email: row.البريد || row.email,
          address: row.العنوان || row.address,
          guardianName: row.ولي_الأمر || row.guardianName,
          guardianPhone: row.هاتف_ولي_الأمر || row.guardianPhone,
          classId: row.الصف || row.classId || null,
          academicYearId: activeYear?.id,
          status: 'active',
        });
        results.imported++;
      } catch (e) { results.errors.push({ row: i + 1, message: e.message }); }
    }

    res.json(results);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/import-grades', authorize('admin'), upload.single('file'), async (req, res) => {
  try {
    const { data } = parseExcel(req.file.path);
    const activeYear = await AcademicYear.findOne({ where: { isActive: true } });
    const results = { imported: 0, skipped: 0, errors: [] };

    for (let i = 0; i < data.length; i++) {
      try {
        const row = data[i];
        const student = await Student.findOne({ where: { [Op.or]: [{ studentNumber: row.رقم_الطالب || row.studentNumber }, { fullName: row.الاسم || row.fullName }] } });
        const subject = await Subject.findOne({ where: { [Op.or]: [{ code: row.رمز_المادة || row.subjectCode }, { name: row.المادة || row.subjectName }] } });
        if (!student || !subject) { results.skipped++; continue; }

        await Grade.create({
          studentId: student.id,
          subjectId: subject.id,
          grade: parseFloat(row.الدرجة || row.grade) || 0,
          maxGrade: parseFloat(row.الدرجة_القصوى || row.maxGrade) || 100,
          type: row.النوع || row.type || 'exam',
          term: row.الفصل || row.term || 'first',
          date: row.التاريخ || row.date || new Date().toISOString().split('T')[0],
          academicYearId: activeYear?.id,
        });
        results.imported++;
      } catch (e) { results.errors.push({ row: i + 1, message: e.message }); }
    }

    res.json(results);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/import-teachers', authorize('admin'), upload.single('file'), async (req, res) => {
  try {
    const { data } = parseExcel(req.file.path);
    const results = { imported: 0, skipped: 0, errors: [] };

    for (let i = 0; i < data.length; i++) {
      try {
        const row = data[i];
        const fullName = row.الاسم || row.fullName || row.اسم_المعلم || row.teacherName;
        const existing = await Teacher.findOne({ where: { fullName } });
        if (existing) { results.skipped++; continue; }

        const teacher = await Teacher.create({
          fullName,
          phone: row.الهاتف || row.phone,
          email: row.البريد || row.email,
          specialization: row.التخصص || row.specialization,
          hireDate: row.تاريخ_التعيين || row.hireDate,
          isActive: row.نشط !== 'لا' && row.isActive !== false,
        });
        results.imported++;
      } catch (e) { results.errors.push({ row: i + 1, message: e.message }); }
    }
    res.json(results);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/import-classes', authorize('admin'), upload.single('file'), async (req, res) => {
  try {
    const { data } = parseExcel(req.file.path);
    const activeYear = await AcademicYear.findOne({ where: { isActive: true } });
    const results = { imported: 0, skipped: 0, errors: [] };

    for (let i = 0; i < data.length; i++) {
      try {
        const row = data[i];
        const name = row.اسم_الصف || row.name || row.الصف || row.className;
        const existing = await Class.findOne({ where: { name, academicYearId: activeYear?.id } });
        if (existing) { results.skipped++; continue; }

        await Class.create({
          name,
          level: parseInt(row.المستوى || row.level) || null,
          academicYearId: activeYear?.id,
        });
        results.imported++;
      } catch (e) { results.errors.push({ row: i + 1, message: e.message }); }
    }
    res.json(results);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/import-subjects', authorize('admin'), upload.single('file'), async (req, res) => {
  try {
    const { data } = parseExcel(req.file.path);
    const activeYear = await AcademicYear.findOne({ where: { isActive: true } });
    const results = { imported: 0, skipped: 0, errors: [] };

    for (let i = 0; i < data.length; i++) {
      try {
        const row = data[i];
        const name = row.اسم_المادة || row.name || row.material || row.subjectName;
        const existing = await Subject.findOne({ where: { [Op.or]: [{ name }, { code: row.رمز_المادة || row.code || row.subjectCode }] } });
        if (existing) { results.skipped++; continue; }

        let teacherId = null;
        const teacherName = row.المعلم || row.teacherName || row.اسم_المعلم;
        if (teacherName) {
          const teacher = await Teacher.findOne({ where: { fullName: teacherName } });
          if (teacher) teacherId = teacher.id;
        }

        let classId = null;
        const className = row.الصف || row.className || row.اسم_الصف;
        if (className) {
          const cls = await Class.findOne({ where: { name: className, academicYearId: activeYear?.id } });
          if (cls) classId = cls.id;
        }

        await Subject.create({
          name,
          nameAr: row.الاسم_بالعربية || row.nameAr,
          code: row.رمز_المادة || row.code || row.subjectCode,
          teacherId,
          classId,
          maxGrade: parseFloat(row.الدرجة_القصوى || row.maxGrade) || 100,
          coefficient: parseFloat(row.المعامل || row.coefficient) || 1,
          weeklyHours: parseInt(row.الساعات || row.weeklyHours) || null,
          academicYearId: activeYear?.id,
        });
        results.imported++;
      } catch (e) { results.errors.push({ row: i + 1, message: e.message }); }
    }
    res.json(results);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/import-dormitories', authorize('admin'), upload.single('file'), async (req, res) => {
  try {
    const { data } = parseExcel(req.file.path);
    const results = { imported: 0, skipped: 0, errors: [] };

    for (let i = 0; i < data.length; i++) {
      try {
        const row = data[i];
        const name = row.اسم_المبنى || row.name || row.dormitoryName;
        const existing = await Dormitory.findOne({ where: { name } });
        if (existing) { results.skipped++; continue; }

        await Dormitory.create({
          name,
          location: row.الموقع || row.location,
          capacity: parseInt(row.السعة || row.capacity) || null,
          supervisor: row.المشرف || row.supervisor,
          notes: row.ملاحظات || row.notes,
        });
        results.imported++;
      } catch (e) { results.errors.push({ row: i + 1, message: e.message }); }
    }
    res.json(results);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/import-rooms', authorize('admin'), upload.single('file'), async (req, res) => {
  try {
    const { data } = parseExcel(req.file.path);
    const results = { imported: 0, skipped: 0, errors: [] };

    for (let i = 0; i < data.length; i++) {
      try {
        const row = data[i];
        const roomNumber = row.رقم_الغرفة || row.roomNumber;
        const existing = await Room.findOne({ where: { roomNumber } });
        if (existing) { results.skipped++; continue; }

        let dormitoryId = null;
        const dormName = row.المبنى || row.dormitoryName || row.اسم_المبنى;
        if (dormName) {
          const dorm = await Dormitory.findOne({ where: { name: dormName } });
          if (dorm) dormitoryId = dorm.id;
        }

        await Room.create({
          roomNumber,
          dormitoryId,
          capacity: parseInt(row.السعة || row.capacity) || 4,
          gender: row.الجنس || row.gender === 'أنثى' || row.gender === 'female' ? 'female' : 'male',
          notes: row.ملاحظات || row.notes,
        });
        results.imported++;
      } catch (e) { results.errors.push({ row: i + 1, message: e.message }); }
    }
    res.json(results);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/import-attendance', authorize('admin'), upload.single('file'), async (req, res) => {
  try {
    const { data } = parseExcel(req.file.path);
    const results = { imported: 0, skipped: 0, errors: [] };

    for (let i = 0; i < data.length; i++) {
      try {
        const row = data[i];
        const student = await Student.findOne({ where: { [Op.or]: [{ studentNumber: row.رقم_الطالب || row.studentNumber }, { fullName: row.الاسم || row.fullName }] } });
        if (!student) { results.skipped++; continue; }

        const date = row.التاريخ || row.date;
        if (!date) { results.skipped++; continue; }

        const [attendance, created] = await Attendance.findOrCreate({
          where: { studentId: student.id, date },
          defaults: {
            studentId: student.id,
            classId: student.classId,
            date,
            status: (row.الحالة || row.status || 'present').toLowerCase(),
            notes: row.ملاحظات || row.notes,
          },
        });
        if (created) results.imported++; else results.skipped++;
      } catch (e) { results.errors.push({ row: i + 1, message: e.message }); }
    }
    res.json(results);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/import-exams', authorize('admin'), upload.single('file'), async (req, res) => {
  try {
    const { data } = parseExcel(req.file.path);
    const activeYear = await AcademicYear.findOne({ where: { isActive: true } });
    const results = { imported: 0, skipped: 0, errors: [] };

    for (let i = 0; i < data.length; i++) {
      try {
        const row = data[i];
        const examName = row.اسم_الامتحان || row.name || row.examName;
        const existing = await Exam.findOne({ where: { name: examName } });
        if (existing) { results.skipped++; continue; }

        let subjectId = null;
        const subjName = row.المادة || row.subjectName || row.اسم_المادة;
        if (subjName) {
          const subj = await Subject.findOne({ where: { [Op.or]: [{ name: subjName }, { nameAr: subjName }, { code: row.رمز_المادة || row.subjectCode }] } });
          if (subj) subjectId = subj.id;
        }

        let classId = null;
        const className = row.الصف || row.className || row.اسم_الصف;
        if (className) {
          const cls = await Class.findOne({ where: { name: className, academicYearId: activeYear?.id } });
          if (cls) classId = cls.id;
        }

        await Exam.create({
          name: examName,
          subjectId,
          classId,
          term: row.الفصل || row.term || 'first',
          date: row.التاريخ || row.date,
          maxGrade: parseFloat(row.الدرجة_القصوى || row.maxGrade) || 100,
          coefficient: parseFloat(row.المعامل || row.coefficient) || 1,
          duration: parseInt(row.المدة || row.duration) || null,
          notes: row.ملاحظات || row.notes,
          academicYearId: activeYear?.id,
        });
        results.imported++;
      } catch (e) { results.errors.push({ row: i + 1, message: e.message }); }
    }
    res.json(results);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/template/:type', authorize('admin'), (req, res) => {
  const { type } = req.params;
  const templates = {
    students: [{ الاسم: 'أحمد محمد', رقم_الطالب: 'STD001', الجنسية: 'يمني', الهاتف: '777777777', البريد: 'ahmed@test.com', ولي_الأمر: 'محمد أحمد', هاتف_ولي_الأمر: '777777778', الصف: 'الأول', تاريخ_التسجيل: '2025-09-01' }],
    teachers: [{ الاسم: 'علي حسن', الهاتف: '777777779', البريد: 'ali@test.com', التخصص: 'فقه', تاريخ_التعيين: '2025-01-01' }],
    classes: [{ اسم_الصف: 'الأول', المستوى: '1' }, { اسم_الصف: 'الثاني', المستوى: '2' }],
    subjects: [{ اسم_المادة: 'الفقه', رمز_المادة: 'FQH', المعلم: 'علي حسن', الصف: 'الأول', الدرجة_القصوى: '100', المعامل: '1', الساعات: '3' }],
    dormitories: [{ اسم_المبنى: 'المبنى الرئيسي', الموقع: 'الجهة الشرقية', السعة: '50', المشرف: 'أحمد عمر' }],
    rooms: [{ رقم_الغرفة: '101', المبنى: 'المبنى الرئيسي', السعة: '4', الجنس: 'ذكر' }],
    attendance: [{ رقم_الطالب: 'STD001', الاسم: 'أحمد محمد', التاريخ: '2026-01-01', الحالة: 'present' }],
    exams: [{ اسم_الامتحان: 'امتحان الفقه الأول', المادة: 'الفقه', الصف: 'الأول', الفصل: 'first', التاريخ: '2026-01-15', الدرجة_القصوى: '100', المعامل: '1', المدة: '90' }],
    grades: [{ رقم_الطالب: 'STD001', الاسم: 'أحمد محمد', المادة: 'الفقه', رمز_المادة: 'FQH', الدرجة: '85', الدرجة_القصوى: '100', النوع: 'exam', الفصل: 'first', التاريخ: '2026-01-15' }],
  };

  const data = templates[type];
  if (!data) return res.status(404).json({ message: 'النموذج غير موجود' });

  const headers = Object.keys(data[0]);
  const headerMap = {};
  headers.forEach(h => { headerMap[h] = h; });

  const buffer = createExcel(data, type);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=template-${type}.xlsx`);
  res.send(buffer);
});

router.post('/export-students', authorize('admin'), async (req, res) => {
  try {
    const { classId } = req.body;
    const where = {};
    if (classId) where.classId = classId;
    const students = await Student.findAll({ where, include: [{ model: Class }] });

    const data = students.map(s => ({
      رقم_الطالب: s.studentNumber,
      الاسم: s.fullName,
      الجنسية: s.nationality,
      الهاتف: s.phone,
      البريد: s.email,
      الصف: s.Class?.name,
      تاريخ_التسجيل: s.enrollmentDate,
      الحالة: s.status,
    }));

    const buffer = createExcel(data, 'الطلاب');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=students.xlsx');
    res.send(buffer);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/preview/:fileName', authorize('admin'), (req, res) => {
  try {
    const filePath = path.join(__dirname, '../uploads', req.params.fileName);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'الملف غير موجود' });
    const { data, sheetNames } = parseExcel(filePath);
    res.json({ sheetNames, rowCount: data.length, columns: data.length ? Object.keys(data[0]) : [], preview: data.slice(0, 20) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
