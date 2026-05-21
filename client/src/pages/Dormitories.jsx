import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Pencil, Trash2, DoorOpen } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dormitories() {
  const [dormitories, setDormitories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', location: '', capacity: '', supervisor: '', notes: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try { const res = await api.get('/dormitories'); setDormitories(res.data); } catch {} finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) { await api.put(`/dormitories/${editId}`, form); toast.success('تم التحديث'); }
      else { await api.post('/dormitories', form); toast.success('تم الإضافة'); }
      setShowForm(false); setEditId(null); setForm({ name: '', location: '', capacity: '', supervisor: '', notes: '' }); fetchData();
    } catch {}
  };

  const handleEdit = (d) => { setEditId(d.id); setForm({ name: d.name, location: d.location || '', capacity: d.capacity || '', supervisor: d.supervisor || '', notes: d.notes || '' }); setShowForm(true); };
  const handleDelete = async (id) => { if (!confirm('هل أنت متأكد؟')) return; try { await api.delete(`/dormitories/${id}`); toast.success('تم الحذف'); fetchData(); } catch {} };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">المباني السكنية</h2>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ name: '', location: '', capacity: '', supervisor: '', notes: '' }); }} className="btn-primary flex items-center gap-2"><Plus size={18} /> إضافة مبنى</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h3 className="font-bold text-lg">{editId ? 'تعديل مبنى' : 'إضافة مبنى جديد'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">الاسم *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required /></div>
            <div><label className="block text-sm font-medium mb-1">الموقع</label><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium mb-1">السعة الإجمالية</label><input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium mb-1">المشرف</label><input value={form.supervisor} onChange={(e) => setForm({ ...form, supervisor: e.target.value })} className="input-field" /></div>
            <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">ملاحظات</label><input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input-field" /></div>
          </div>
          <div className="flex gap-3"><button type="submit" className="btn-primary">{editId ? 'حفظ' : 'إضافة'}</button><button type="button" onClick={() => setShowForm(false)} className="btn-secondary">إلغاء</button></div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? <div className="col-span-full text-center py-10"><div className="animate-spin inline-block w-8 h-8 border-b-2 border-blue-900 rounded-full"></div></div>
        : dormitories.map((d) => (
          <div key={d.id} className="card hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg">{d.name}</h3>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(d)} className="p-1.5 hover:bg-blue-100 rounded-lg text-blue-600"><Pencil size={14} /></button>
                <button onClick={() => handleDelete(d.id)} className="p-1.5 hover:bg-red-100 rounded-lg text-red-600"><Trash2 size={14} /></button>
              </div>
            </div>
            <div className="space-y-1 text-sm text-gray-500">
              <p>الموقع: {d.location || '-'}</p>
              <p>المشرف: {d.supervisor || '-'}</p>
              <div className="flex items-center gap-1 mt-2"><DoorOpen size={14} /> <span>{d.Rooms?.length || 0} غرفة</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
