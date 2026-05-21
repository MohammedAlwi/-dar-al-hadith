import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RoomAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ studentId: '', roomId: '', startDate: new Date().toISOString().split('T')[0], notes: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [aRes, rRes, sRes] = await Promise.all([
        api.get('/room-assignments', { params: { isActive: true } }),
        api.get('/rooms'),
        api.get('/students', { params: { status: 'active' } }),
      ]);
      setAssignments(aRes.data); setRooms(rRes.data); setStudents(sRes.data);
    } catch {} finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/room-assignments', form);
      toast.success('تم تسجيل الطالب في السكن');
      setShowForm(false); setForm({ studentId: '', roomId: '', startDate: new Date().toISOString().split('T')[0], notes: '' }); fetchData();
    } catch {}
  };

  const handleDelete = async (id) => {
    if (!confirm('هل تريد إلغاء تسجيل هذا الطالب؟')) return;
    try { await api.delete(`/room-assignments/${id}`); toast.success('تم إلغاء التسجيل'); fetchData(); } catch {}
  };

  const getRoomOccupancy = (roomId) => {
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return { current: 0, capacity: 0 };
    const activeAssignments = room.RoomAssignments?.filter((a) => a.isActive)?.length || 0;
    return { current: activeAssignments, capacity: room.capacity };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">تسجيل الطلاب في السكن</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> تسجيل طالب</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h3 className="font-bold text-lg">تسجيل طالب في السكن</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">الطالب *</label>
              <select value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} className="input-field" required>
                <option value="">اختر الطالب</option>
                {students.filter((s) => !assignments.some((a) => a.studentId === s.id)).map((s) =>
                  <option key={s.id} value={s.id}>{s.fullName} ({s.studentNumber})</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">الغرفة *</label>
              <select value={form.roomId} onChange={(e) => setForm({ ...form, roomId: e.target.value })} className="input-field" required>
                <option value="">اختر الغرفة</option>
                {rooms.map((r) => {
                  const { current, capacity } = getRoomOccupancy(r.id);
                  const full = current >= capacity;
                  return (
                    <option key={r.id} value={r.id} disabled={full}>
                      {r.Dormitory?.name || '-'} - غرفة {r.roomNumber} ({current}/{capacity})
                      {full ? ' (ممتلئة)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">تاريخ البداية</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="input-field" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary">تسجيل</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">إلغاء</button>
          </div>
        </form>
      )}

      <div className="card">
        {loading ? <div className="text-center py-10"><div className="animate-spin inline-block w-8 h-8 border-b-2 border-blue-900 rounded-full"></div></div>
        : assignments.length === 0 ? <p className="text-center text-gray-400 py-10">لا يوجد طلاب مسجلون في السكن</p>
        : <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-200">
                <th className="text-right p-3 text-gray-500">الطالب</th>
                <th className="text-right p-3 text-gray-500">المبنى</th>
                <th className="text-right p-3 text-gray-500">الغرفة</th>
                <th className="text-right p-3 text-gray-500">تاريخ التسجيل</th>
                <th className="text-left p-3 text-gray-500">الإجراءات</th>
              </tr></thead>
              <tbody>{assignments.map((a) => (
                <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-3 font-medium flex items-center gap-2">
                    <KeyRound size={14} className="text-amber-500" /> {a.Student?.fullName}
                  </td>
                  <td className="p-3 text-gray-500">{a.Room?.Dormitory?.name || '-'}</td>
                  <td className="p-3 text-gray-500">غرفة {a.Room?.roomNumber}</td>
                  <td className="p-3 text-gray-500">{a.startDate}</td>
                  <td className="p-3 text-left">
                    <button onClick={() => handleDelete(a.id)} className="p-1.5 hover:bg-red-100 rounded-lg text-red-600"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        }
      </div>
    </div>
  );
}
