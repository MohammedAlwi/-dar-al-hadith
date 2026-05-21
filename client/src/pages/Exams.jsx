import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Exams() {
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showGrades, setShowGrades] = useState(null);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', subjectId: '', classId: '', date: '', maxGrade: 100, coefficient: 1, duration: '', notes: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [eRes, sRes, cRes] = await Promise.all([api.get('/exams'), api.get('/subjects'), api.get('/classes')]);
      setExams(eRes.data); setSubjects(sRes.data); setClasses(cRes.data);
    } catch {} finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) { await api.put(`/exams/${editId}`, form); toast.success('تم التحديث'); }
      else { await api.post('/exams', form); toast.success('تم الإضافة'); }
      setShowForm(false); setEditId(null); setForm({ name: '', subjectId: '', classId: '', date: '', maxGrade: 100, coefficient: 1, duration: '', notes: '' }); fetchData();
    } catch {}
  };

  const loadStudents = async (exam) => {
    setShowGrades(exam);
    try {
      const res = await api.get('/students', { params: { classId: exam.classId, status: 'active' } });
      setStudents(res.data);
      const gRes = await api.get('/exam-results', { params: { examId: exam.id } });
      const gMap = {};
      gRes.data.forEach((r) => { gMap[r.studentId] = r.grade; });
      setGrades(gMap);
    } catch {}
  };

  const saveGrades = async () => {
    try {
      const records = Object.entries(grades).map(([studentId, grade]) => ({
        examId: showGrades.id, studentId: parseInt(studentId), grade: parseFloat(grade) || 0,
      }));
      await api.post('/exam-results/batch', { records });
      toast.success('تم حفظ النتائج');
    } catch {}
  };

  const handleDelete = async (id) => { if (!confirm('هل أنت متأكد؟')) return; try { await api.delete(`/exams/${id}`); toast.success('تم الحذف'); fetchData(); } catch {} };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">الامتحانات</h2>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ name: '', subjectId: '', classId: '', date: '', maxGrade: 100, coefficient: 1, duration: '', notes: '' }); }} className="btn-primary flex items-center gap-2"><Plus size={18} /> إضافة امتحان</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h3 className="font-bold text-lg">{editId ? 'تعديل امتحان' : 'إضافة امتحان جديد'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium mb-1">الاسم *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required /></div>
            <div><label className="block text-sm font-medium mb-1">المادة</label>
              <select value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })} className="input-field">
                <option value="">اختر المادة</option>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.nameAr || s.name}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium mb-1">الصف</label>
              <select value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value })} className="input-field">
                <option value="">اختر الصف</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium mb-1">التاريخ</label><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium mb-1">الدرجة القصوى</label><input type="number" value={form.maxGrade} onChange={(e) => setForm({ ...form, maxGrade: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium mb-1">المعامل</label><input type="number" step="0.1" value={form.coefficient} onChange={(e) => setForm({ ...form, coefficient: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium mb-1">المدة (دقائق)</label><input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="input-field" /></div>
            <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">ملاحظات</label><input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input-field" /></div>
          </div>
          <div className="flex gap-3"><button type="submit" className="btn-primary">{editId ? 'حفظ' : 'إضافة'}</button><button type="button" onClick={() => setShowForm(false)} className="btn-secondary">إلغاء</button></div>
        </form>
      )}

      {showGrades && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">نتائج: {showGrades.name}</h3>
            <div className="flex gap-2">
              <button onClick={saveGrades} className="btn-primary">حفظ النتائج</button>
              <button onClick={() => setShowGrades(null)} className="btn-secondary">إغلاق</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-200">
                <th className="text-right p-3 text-gray-500">الطالب</th>
                <th className="text-center p-3 text-gray-500">الدرجة (من {showGrades.maxGrade})</th>
              </tr></thead>
              <tbody>{students.map((s) => (
                <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-3 font-medium">{s.fullName}</td>
                  <td className="p-3 text-center">
                    <input type="number" step="0.01" value={grades[s.id] ?? ''}
                      onChange={(e) => setGrades({ ...grades, [s.id]: e.target.value })}
                      className="input-field w-24 text-center mx-auto" min="0" max={showGrades.maxGrade} />
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card">
        {loading ? <div className="text-center py-10"><div className="animate-spin inline-block w-8 h-8 border-b-2 border-blue-900 rounded-full"></div></div>
        : exams.length === 0 ? <p className="text-center text-gray-400 py-10">لا توجد امتحانات</p>
        : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exams.map((e) => (
              <div key={e.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold">{e.name}</h4>
                  <div className="flex gap-1">
                    <button onClick={() => loadStudents(e)} className="p-1.5 hover:bg-indigo-100 rounded-lg text-indigo-600"><Users size={14} /></button>
                    <button onClick={() => handleDelete(e.id)} className="p-1.5 hover:bg-red-100 rounded-lg text-red-600"><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>المادة: {e.Subject?.nameAr || e.Subject?.name || '-'}</p>
                  <p>الصف: {e.Class?.name || '-'}</p>
                  <p>التاريخ: {e.date || '-'}</p>
                  <p>الدرجة القصوى: {e.maxGrade}</p>
                </div>
              </div>
            ))}
          </div>
        }
      </div>
    </div>
  );
}
