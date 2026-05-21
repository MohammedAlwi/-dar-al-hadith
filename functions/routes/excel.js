const express = require('express');
const { collections } = require('../db');
const { authenticate, authorize } = require('../authMiddleware');
const router = express.Router();

const TYPES = ['students', 'teachers', 'classes', 'subjects', 'dormitories', 'rooms', 'attendance', 'exams', 'grades'];

const TEMPLATES = {
  students: [{ header: 'الاسم', key: 'name' }, { header: 'رقم الجوال', key: 'phone' }, { header: 'العنوان', key: 'address' }],
  teachers: [{ header: 'الاسم', key: 'name' }, { header: 'التخصص', key: 'specialization' }, { header: 'رقم الجوال', key: 'phone' }],
  classes: [{ header: 'اسم الصف', key: 'name' }],
  subjects: [{ header: 'اسم المادة', key: 'name' }],
  dormitories: [{ header: 'اسم المبنى', key: 'name' }, { header: 'الموقع', key: 'location' }],
  rooms: [{ header: 'رقم الغرفة', key: 'roomNumber' }, { header: 'السعة', key: 'capacity' }, { header: 'نوع الغرفة', key: 'type' }],
  attendance: [{ header: 'رقم الطالب', key: 'studentId' }, { header: 'التاريخ (YYYY-MM-DD)', key: 'date' }, { header: 'الحالة (present/absent/late)', key: 'status' }],
  exams: [{ header: 'اسم الامتحان', key: 'name' }, { header: 'التاريخ (YYYY-MM-DD)', key: 'date' }],
  grades: [{ header: 'رقم الطالب', key: 'studentId' }, { header: 'رقم المادة', key: 'subjectId' }, { header: 'الدرجة', key: 'score' }],
};

const MAPPING = {
  students: collections.Student,
  teachers: collections.Teacher,
  classes: collections.Class,
  subjects: collections.Subject,
  dormitories: collections.Dormitory,
  rooms: collections.Room,
  attendance: collections.Attendance,
  exams: collections.Exam,
  grades: collections.Grade,
};

router.get('/template/:type', authenticate, async (req, res) => {
  try {
    const { type } = req.params;
    if (!TEMPLATES[type]) return res.status(400).json({ message: 'نوع غير صالح' });
    const XLSX = require('xlsx');
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([TEMPLATES[type].map(t => t.header)]);
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${type}_template.xlsx`);
    res.send(buf);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/preview', authenticate, async (req, res) => {
  try {
    const { type, file } = req.body;
    if (!TYPES.includes(type)) return res.status(400).json({ message: 'نوع غير صالح' });
    const XLSX = require('xlsx');
    const data = file.replace(/^data:.*,/, '');
    const buf = Buffer.from(data, 'base64');
    const wb = XLSX.read(buf, { type: 'buffer' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(ws, { defval: '' });
    if (!json.length) return res.status(400).json({ message: 'الملف فارغ' });
    const keys = Object.keys(json[0]);
    const templateKeys = TEMPLATES[type].map(t => t.key);
    res.json({
      columns: keys,
      rows: json.slice(0, 10),
      totalRows: json.length,
      mapping: templateKeys,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/import', authenticate, async (req, res) => {
  try {
    const { type, file } = req.body;
    if (!TYPES.includes(type)) return res.status(400).json({ message: 'نوع غير صالح' });
    const XLSX = require('xlsx');
    const data = file.replace(/^data:.*,/, '');
    const buf = Buffer.from(data, 'base64');
    const wb = XLSX.read(buf, { type: 'buffer' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(ws, { defval: '' });
    if (!json.length) return res.status(400).json({ message: 'الملف فارغ' });
    const mapped = json.map(row => {
      const obj = {};
      for (const [key, val] of Object.entries(row)) {
        const tKey = TEMPLATES[type].find(t => t.header === key || t.key === key)?.key || key;
        obj[tKey] = String(val);
      }
      return obj;
    });
    const collection = MAPPING[type];
    const created = await collection.bulkCreate(mapped);
    res.json({ imported: created.length, total: json.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
