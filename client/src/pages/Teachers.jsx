import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Pencil, Trash2, Download, FileDown } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', specialization: '', username: '', password: '' });

  useEffect(() => { fetchTeachers(); }, []);

  const fetchTeachers = async () => {
    try { const res = await api.get('/teachers'); setTeachers(res.data); } catch {} finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/teachers/${editId}`, form);
        toast.success('تم تحديث بيانات المعلم');
      } else {
        await api.post('/teachers', form);
        toast.success('تم إضافة المعلم بنجاح');
      }
      setShowForm(false); setEditId(null); setForm({ fullName: '', phone: '', email: '', specialization: '', username: '', password: '' });
      fetchTeachers();
    } catch {}
  };

  const handleEdit = (t) => {
    setEditId(t.id);
    setForm({ fullName: t.fullName, phone: t.phone || '', email: t.email || '', specialization: t.specialization || '', username: '', password: '' });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد؟')) return;
    try { await api.delete(`/teachers/${id}`); toast.success('تم الحذف'); fetchTeachers(); } catch {}
  };

  const handleExport = async () => {
    try {
      const res = await api.post('/excel/export-teachers', {}, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url; link.download = `teachers.xlsx`; link.click();
      window.URL.revokeObjectURL(url);
      toast.success('تم التحميل');
    } catch { toast.error('حدث خطأ'); }
  };

  const handleExportTeacher = async (id, name) => {
    try {
      const res = await api.post(`/excel/export-teacher/${id}`, {}, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url; link.download = `${name}.xlsx`; link.click();
      window.URL.revokeObjectURL(url);
      toast.success('تم تحميل ملف المعلم');
    } catch { toast.error('حدث خطأ'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">إدارة المعلمين</h2>
        <div className="flex gap-2">
          <button onClick={handleExport} className="btn-secondary flex items-center gap-2">
            <Download size={18} /> تحميل Excel
          </button>
          <button onClick={() => { setShowForm(true); setEditId(null); setForm({ fullName: '', phone: '', email: '', specialization: '', username: '', password: '' }); }} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> إضافة معلم
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h3 className="font-bold text-lg">{editId ? 'تعديل معلم' : 'إضافة معلم جديد'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium mb-1">الاسم *</label><input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="input-field" required /></div>
            <div><label className="block text-sm font-medium mb-1">الهاتف</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium mb-1">البريد</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium mb-1">التخصص</label><input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} className="input-field" /></div>
            {!editId && (<><div><label className="block text-sm font-medium mb-1">اسم المستخدم *</label><input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="input-field" required /></div>
            <div><label className="block text-sm font-medium mb-1">كلمة المرور</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field" /></div></>)}
          </div>
          <div className="flex gap-3"><button type="submit" className="btn-primary">{editId ? 'حفظ' : 'إضافة'}</button><button type="button" onClick={() => setShowForm(false)} className="btn-secondary">إلغاء</button></div>
        </form>
      )}

      <div className="card">
        {loading ? <div className="text-center py-10"><div className="animate-spin inline-block w-8 h-8 border-b-2 border-blue-900 rounded-full"></div></div>
        : teachers.length === 0 ? <p className="text-center text-gray-400 py-10">لا يوجد معلمون</p>
        : <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-200">
                <th className="text-right p-3 text-gray-500 font-medium">الاسم</th><th className="text-right p-3 text-gray-500 font-medium">التخصص</th>
                <th className="text-right p-3 text-gray-500 font-medium">الهاتف</th><th className="text-right p-3 text-gray-500 font-medium">البريد</th>
                <th className="text-left p-3 text-gray-500 font-medium">الإجراءات</th>
              </tr></thead>
              <tbody>{teachers.map((t) => (
                <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-3 font-medium">{t.fullName}</td>
                  <td className="p-3 text-gray-500">{t.specialization || '-'}</td>
                  <td className="p-3 text-gray-500">{t.phone || '-'}</td>
                  <td className="p-3 text-gray-500">{t.email || '-'}</td>
                  <td className="p-3"><div className="flex gap-2 justify-end">
                    <button onClick={() => handleExportTeacher(t.id, t.fullName)} className="p-1.5 hover:bg-emerald-100 rounded-lg text-emerald-600" title="تحميل ملف المعلم"><FileDown size={16} /></button>
                    <button onClick={() => handleEdit(t)} className="p-1.5 hover:bg-blue-100 rounded-lg text-blue-600"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(t.id)} className="p-1.5 hover:bg-red-100 rounded-lg text-red-600"><Trash2 size={16} /></button>
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
