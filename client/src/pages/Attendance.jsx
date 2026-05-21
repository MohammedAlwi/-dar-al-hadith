import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Attendance() {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/classes').then((res) => setClasses(res.data)).catch(() => {});
    api.get('/subjects').then((res) => setSubjects(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedClass) {
      setLoading(true);
      api.get('/students', { params: { classId: selectedClass, status: 'active' } })
        .then((res) => {
          setStudents(res.data);
          const att = {};
          res.data.forEach((s) => { att[s.id] = 'present'; });
          setAttendance(att);

          if (selectedDate && selectedSubject) {
            api.get('/attendance', { params: { classId: selectedClass, date: selectedDate, subjectId: selectedSubject || undefined } })
              .then((aRes) => {
                const updated = { ...att };
                aRes.data.forEach((a) => { updated[a.studentId] = a.status; });
                setAttendance(updated);
              }).catch(() => {});
          }
        }).catch(() => {}).finally(() => setLoading(false));
    }
  }, [selectedClass, selectedDate, selectedSubject]);

  const statusColors = { present: 'bg-emerald-500', absent: 'bg-red-500', late: 'bg-amber-500', excused: 'bg-blue-500' };
  const statusLabels = { present: 'حاضر', absent: 'غائب', late: 'متأخر', excused: 'معذر' };

  const toggleStatus = (studentId) => {
    const order = ['present', 'absent', 'late', 'excused'];
    const current = attendance[studentId] || 'present';
    const nextIndex = (order.indexOf(current) + 1) % order.length;
    setAttendance({ ...attendance, [studentId]: order[nextIndex] });
  };

  const handleSave = async () => {
    if (!selectedSubject) { toast.error('الرجاء اختيار المادة'); return; }
    setSaving(true);
    try {
      const records = Object.entries(attendance).map(([studentId, status]) => ({
        studentId: parseInt(studentId), classId: parseInt(selectedClass),
        subjectId: parseInt(selectedSubject), date: selectedDate, status,
      }));
      await api.post('/attendance/batch', { records });
      toast.success('تم حفظ الحضور بنجاح');
    } catch {} finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">تسجيل الحضور والغياب</h2>

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">الصف</label>
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="input-field">
              <option value="">اختر الصف</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">المادة</label>
            <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="input-field">
              <option value="">اختر المادة</option>
              {subjects.filter(s => !selectedClass || s.classId === parseInt(selectedClass)).map((s) =>
                <option key={s.id} value={s.id}>{s.nameAr || s.name}</option>
              )}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">التاريخ</label>
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="input-field" />
          </div>
          <div className="flex items-end">
            <button onClick={handleSave} disabled={saving || !selectedClass || !selectedSubject} className="btn-primary w-full">
              {saving ? 'جاري الحفظ...' : 'حفظ الحضور'}
            </button>
          </div>
        </div>
      </div>

      {selectedClass && (
        <div className="card">
          {loading ? <div className="text-center py-10"><div className="animate-spin inline-block w-8 h-8 border-b-2 border-blue-900 rounded-full"></div></div>
          : students.length === 0 ? <p className="text-center text-gray-400 py-10">لا يوجد طلاب في هذا الصف</p>
          : <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-200">
                  <th className="text-right p-3 text-gray-500">#</th>
                  <th className="text-right p-3 text-gray-500">الاسم</th>
                  <th className="text-center p-3 text-gray-500">الحالة</th>
                </tr></thead>
                <tbody>
                  {students.map((s, idx) => (
                    <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 text-gray-400">{idx + 1}</td>
                      <td className="p-3 font-medium">{s.fullName}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => toggleStatus(s.id)}
                          className={`px-4 py-1.5 rounded-lg text-white text-sm font-medium transition ${statusColors[attendance[s.id]] || 'bg-gray-400'}`}
                        >
                          {statusLabels[attendance[s.id]] || 'حاضر'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex gap-3 mt-4 pt-3 border-t border-gray-100">
                <span className="flex items-center gap-1 text-xs"><span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span> حاضر</span>
                <span className="flex items-center gap-1 text-xs"><span className="w-3 h-3 rounded bg-red-500 inline-block"></span> غائب</span>
                <span className="flex items-center gap-1 text-xs"><span className="w-3 h-3 rounded bg-amber-500 inline-block"></span> متأخر</span>
                <span className="flex items-center gap-1 text-xs"><span className="w-3 h-3 rounded bg-blue-500 inline-block"></span> معذر</span>
              </div>
            </div>
          }
        </div>
      )}
    </div>
  );
}
