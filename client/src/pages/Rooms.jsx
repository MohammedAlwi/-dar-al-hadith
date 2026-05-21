import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [dormitories, setDormitories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ dormitoryId: '', roomNumber: '', capacity: 4, gender: 'male', notes: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [rRes, dRes] = await Promise.all([api.get('/rooms'), api.get('/dormitories')]);
      setRooms(rRes.data); setDormitories(dRes.data);
    } catch {} finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) { await api.put(`/rooms/${editId}`, form); toast.success('تم التحديث'); }
      else { await api.post('/rooms', form); toast.success('تم الإضافة'); }
      setShowForm(false); setEditId(null); setForm({ dormitoryId: '', roomNumber: '', capacity: 4, gender: 'male', notes: '' }); fetchData();
    } catch {}
  };

  const handleEdit = (r) => { setEditId(r.id); setForm({ dormitoryId: r.dormitoryId || '', roomNumber: r.roomNumber, capacity: r.capacity, gender: r.gender, notes: r.notes || '' }); setShowForm(true); };
  const handleDelete = async (id) => { if (!confirm('هل أنت متأكد؟')) return; try { await api.delete(`/rooms/${id}`); toast.success('تم الحذف'); fetchData(); } catch {} };

  const getActiveResidents = (room) => room.RoomAssignments?.filter((a) => a.isActive)?.length || 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">الغرف السكنية</h2>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ dormitoryId: '', roomNumber: '', capacity: 4, gender: 'male', notes: '' }); }} className="btn-primary flex items-center gap-2"><Plus size={18} /> إضافة غرفة</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h3 className="font-bold text-lg">{editId ? 'تعديل غرفة' : 'إضافة غرفة جديدة'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">المبنى</label>
              <select value={form.dormitoryId} onChange={(e) => setForm({ ...form, dormitoryId: e.target.value })} className="input-field">
                <option value="">اختر المبنى</option>
                {dormitories.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium mb-1">رقم الغرفة *</label><input value={form.roomNumber} onChange={(e) => setForm({ ...form, roomNumber: e.target.value })} className="input-field" required /></div>
            <div><label className="block text-sm font-medium mb-1">السعة</label><input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium mb-1">الجنس</label>
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="input-field">
                <option value="male">ذكور</option>
                <option value="female">إناث</option>
              </select>
            </div>
            <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">ملاحظات</label><input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input-field" /></div>
          </div>
          <div className="flex gap-3"><button type="submit" className="btn-primary">{editId ? 'حفظ' : 'إضافة'}</button><button type="button" onClick={() => setShowForm(false)} className="btn-secondary">إلغاء</button></div>
        </form>
      )}

      <div className="card">
        {loading ? <div className="text-center py-10"><div className="animate-spin inline-block w-8 h-8 border-b-2 border-blue-900 rounded-full"></div></div>
        : rooms.length === 0 ? <p className="text-center text-gray-400 py-10">لا توجد غرف</p>
        : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((r) => {
              const residents = getActiveResidents(r);
              return (
                <div key={r.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold">غرفة {r.roomNumber}</h4>
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(r)} className="p-1.5 hover:bg-blue-100 rounded-lg text-blue-600"><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(r.id)} className="p-1.5 hover:bg-red-100 rounded-lg text-red-600"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>المبنى: {r.Dormitory?.name || '-'}</p>
                    <p>السعة: {r.capacity}</p>
                    <p className={`font-medium ${residents >= r.capacity ? 'text-red-600' : 'text-emerald-600'}`}>
                      <Users size={12} className="inline" /> {residents}/{r.capacity} طالب
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        }
      </div>
    </div>
  );
}
