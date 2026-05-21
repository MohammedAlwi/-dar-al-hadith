import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', level: '', teacherId: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [cRes, tRes] = await Promise.all([api.get('/classes'), api.get('/teachers')]);
      setClasses(cRes.data); setTeachers(tRes.data);
    } catch {} finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) { await api.put(`/classes/${editId}`, form); toast.success('تم التحديث'); }
      else { await api.post('/classes', form); toast.success('تم الإضافة'); }
      setShowForm(false); setEditId(null); setForm({ name: '', level: '', teacherId: '' }); fetchData();
    } catch {}
  };

  const handleEdit = (c) => { setEditId(c.id); setForm({ name: c.name, level: c.level || '', teacherId: c.teacherId || '' }); setShowForm(true); };
  const handleDelete = async (id) => { if (!confirm('هل أنت متأكد؟')) return; try { await api.delete(`/classes/${id}`); toast.success('تم الحذف'); fetchData(); } catch {} };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">إدارة الصفوف</h2>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ name: '', level: '', teacherId: '' }); }} className="btn-primary flex items-center gap-2"><Plus size={18} /> إضافة صف</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h3 className="font-bold text-lg">{editId ? 'تعديل صف' : 'إضافة صف جديد'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium mb-1">اسم الصف *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required /></div>
            <div><label className="block text-sm font-medium mb-1">المستوى</label><input type="number" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium mb-1">المعلم المسؤول</label>
              <select value={form.teacherId} onChange={(e) => setForm({ ...form, teacherId: e.target.value })} className="input-field">
                <option value="">اختر المعلم</option>
                {teachers.map((t) => <option key={t.id} value={t.id}>{t.fullName}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3"><button type="submit" className="btn-primary">{editId ? 'حفظ' : 'إضافة'}</button><button type="button" onClick={() => setShowForm(false)} className="btn-secondary">إلغاء</button></div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? <div className="col-span-full text-center py-10"><div className="animate-spin inline-block w-8 h-8 border-b-2 border-blue-900 rounded-full"></div></div>
        : classes.map((c) => (
          <div key={c.id} className="card hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg">{c.name}</h3>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(c)} className="p-1.5 hover:bg-blue-100 rounded-lg text-blue-600"><Pencil size={14} /></button>
                <button onClick={() => handleDelete(c.id)} className="p-1.5 hover:bg-red-100 rounded-lg text-red-600"><Trash2 size={14} /></button>
              </div>
            </div>
            <div className="space-y-1 text-sm text-gray-500">
              <p>المستوى: {c.level || '-'}</p>
              <p>المعلم: {c.homeroomTeacher?.fullName || '-'}</p>
              <div className="flex items-center gap-1 mt-2"><Users size={14} /> <span>{c.Students?.length || 0} طالب</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
