const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

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

app.get('/health', (req, res) => res.json({ status: 'ok' }));

exports.api = functions.https.onRequest(app);
