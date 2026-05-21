import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function AcademicYears() {
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '', isActive: false });

  useEffect(() => { fetchYears(); }, []);

  const fetchYears = async () => {
    try { const res = await api.get('/academic-years'); setYears(res.data); } catch {} finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/academic-years', form);
      toast.success('تم إضافة السنة الدراسية');
      setShowForm(false); setForm({ name: '', startDate: '', endDate: '', isActive: false }); fetchYears();
    } catch {}
  };

  const toggleActive = async (year) => {
    try {
      await api.put(`/academic-years/${year.id}`, { isActive: !year.isActive });
      toast.success('تم التحديث'); fetchYears();
    } catch {}
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">السنوات الدراسية</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary">إضافة سنة</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h3 className="font-bold text-lg">إضافة سنة دراسية</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium mb-1">الاسم *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required /></div>
            <div><label className="block text-sm font-medium mb-1">تاريخ البداية</label><input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium mb-1">تاريخ النهاية</label><input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="input-field" /></div>
          </div>
          <div className="flex gap-3"><button type="submit" className="btn-primary">إضافة</button><button type="button" onClick={() => setShowForm(false)} className="btn-secondary">إلغاء</button></div>
        </form>
      )}

      <div className="card">
        {loading ? <div className="text-center py-10"><div className="animate-spin inline-block w-8 h-8 border-b-2 border-blue-900 rounded-full"></div></div>
        : <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-200">
                <th className="text-right p-3 text-gray-500">الاسم</th><th className="text-right p-3 text-gray-500">تاريخ البداية</th>
                <th className="text-right p-3 text-gray-500">تاريخ النهاية</th><th className="text-right p-3 text-gray-500">الحالة</th>
                <th className="text-left p-3 text-gray-500">إجراء</th>
              </tr></thead>
              <tbody>{years.map((y) => (
                <tr key={y.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-3 font-medium">{y.name}</td>
                  <td className="p-3 text-gray-500">{y.startDate || '-'}</td>
                  <td className="p-3 text-gray-500">{y.endDate || '-'}</td>
                  <td className="p-3">{y.isActive ? <span className="badge badge-green">نشطة</span> : <span className="badge badge-gray">غير نشطة</span>}</td>
                  <td className="p-3 text-left">
                    <button onClick={() => toggleActive(y)} className={`px-3 py-1 rounded-lg text-xs ${y.isActive ? 'bg-gray-200 text-gray-600' : 'bg-blue-100 text-blue-700'}`}>
                      {y.isActive ? 'إلغاء التنشيط' : 'تفعيل'}
                    </button>
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
