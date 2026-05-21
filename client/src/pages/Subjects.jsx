import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', nameAr: '', code: '', teacherId: '', classId: '', maxGrade: 100, coefficient: 1, weeklyHours: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [sRes, tRes, cRes] = await Promise.all([api.get('/subjects'), api.get('/teachers'), api.get('/classes')]);
      setSubjects(sRes.data); setTeachers(tRes.data); setClasses(cRes.data);
    } catch {} finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) { await api.put(`/subjects/${editId}`, form); toast.success('تم التحديث'); }
      else { await api.post('/subjects', form); toast.success('تم الإضافة'); }
      setShowForm(false); setEditId(null); setForm({ name: '', nameAr: '', code: '', teacherId: '', classId: '', maxGrade: 100, coefficient: 1, weeklyHours: '' }); fetchData();
    } catch {}
  };

  const handleEdit = (s) => { setEditId(s.id); setForm({ name: s.name, nameAr: s.nameAr || '', code: s.code || '', teacherId: s.teacherId || '', classId: s.classId || '', maxGrade: s.maxGrade, coefficient: s.coefficient, weeklyHours: s.weeklyHours || '' }); setShowForm(true); };
  const handleDelete = async (id) => { if (!confirm('هل أنت متأكد؟')) return; try { await api.delete(`/subjects/${id}`); toast.success('تم الحذف'); fetchData(); } catch {} };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">المواد الدراسية</h2>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ name: '', nameAr: '', code: '', teacherId: '', classId: '', maxGrade: 100, coefficient: 1, weeklyHours: '' }); }} className="btn-primary flex items-center gap-2"><Plus size={18} /> إضافة مادة</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h3 className="font-bold text-lg">{editId ? 'تعديل مادة' : 'إضافة مادة جديدة'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium mb-1">الاسم *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required /></div>
            <div><label className="block text-sm font-medium mb-1">الاسم بالعربية</label><input value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium mb-1">الرمز</label><input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium mb-1">المعلم</label>
              <select value={form.teacherId} onChange={(e) => setForm({ ...form, teacherId: e.target.value })} className="input-field">
                <option value="">اختر المعلم</option>
                {teachers.map((t) => <option key={t.id} value={t.id}>{t.fullName}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium mb-1">الصف</label>
              <select value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value })} className="input-field">
                <option value="">اختر الصف</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium mb-1">الدرجة القصوى</label><input type="number" value={form.maxGrade} onChange={(e) => setForm({ ...form, maxGrade: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium mb-1">المعامل</label><input type="number" step="0.1" value={form.coefficient} onChange={(e) => setForm({ ...form, coefficient: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium mb-1">الساعات الأسبوعية</label><input type="number" value={form.weeklyHours} onChange={(e) => setForm({ ...form, weeklyHours: e.target.value })} className="input-field" /></div>
          </div>
          <div className="flex gap-3"><button type="submit" className="btn-primary">{editId ? 'حفظ' : 'إضافة'}</button><button type="button" onClick={() => setShowForm(false)} className="btn-secondary">إلغاء</button></div>
        </form>
      )}

      <div className="card">
        {loading ? <div className="text-center py-10"><div className="animate-spin inline-block w-8 h-8 border-b-2 border-blue-900 rounded-full"></div></div>
        : subjects.length === 0 ? <p className="text-center text-gray-400 py-10">لا توجد مواد</p>
        : <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-200">
                <th className="text-right p-3 text-gray-500 font-medium">الاسم</th><th className="text-right p-3 text-gray-500 font-medium">المعلم</th>
                <th className="text-right p-3 text-gray-500 font-medium">الصف</th><th className="text-right p-3 text-gray-500 font-medium">الدرجة القصوى</th>
                <th className="text-right p-3 text-gray-500 font-medium">المعامل</th><th className="text-left p-3 text-gray-500 font-medium">الإجراءات</th>
              </tr></thead>
              <tbody>{subjects.map((s) => (
                <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-3 font-medium">{s.nameAr || s.name}</td>
                  <td className="p-3 text-gray-500">{s.Teacher?.fullName || '-'}</td>
                  <td className="p-3 text-gray-500">{s.Class?.name || '-'}</td>
                  <td className="p-3">{s.maxGrade}</td>
                  <td className="p-3">{s.coefficient}</td>
                  <td className="p-3"><div className="flex gap-2 justify-end">
                    <button onClick={() => handleEdit(s)} className="p-1.5 hover:bg-blue-100 rounded-lg text-blue-600"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(s.id)} className="p-1.5 hover:bg-red-100 rounded-lg text-red-600"><Trash2 size={16} /></button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        }
      </div>
    </div>
  );
}
