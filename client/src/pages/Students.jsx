import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Plus, Search, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (filterStatus) params.status = filterStatus;
      const res = await api.get('/students', { params });
      setStudents(res.data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchStudents(); }, [search, filterStatus]);

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطالب؟')) return;
    try {
      await api.delete(`/students/${id}`);
      toast.success('تم حذف الطالب بنجاح');
      fetchStudents();
    } catch {}
  };

  const statusBadge = (status) => {
    const map = { active: 'badge-green', graduated: 'badge-blue', suspended: 'badge-yellow', withdrawn: 'badge-red' };
    const labels = { active: 'نشط', graduated: 'متخرج', suspended: 'موقوف', withdrawn: 'منسحب' };
    return <span className={`badge ${map[status] || 'badge-gray'}`}>{labels[status] || status}</span>;
  };

  const getResidencyWarning = (expiry) => {
    if (!expiry) return null;
    const now = new Date();
    const expDate = new Date(expiry);
    const diffMs = expDate - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return { type: 'danger', text: 'منتهية' };
    if (diffDays <= 30) return { type: 'warning', text: `تتبقى ${diffDays} يوم` };
    return null;
  };

  const expiringStudents = students.filter(s => {
    const warning = getResidencyWarning(s.residencyExpiry);
    return warning !== null;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">إدارة الطلاب</h2>
        <div className="flex gap-2">
          <Link to="/students/new" className="btn-primary flex items-center gap-2">
            <Plus size={18} /> إضافة طالب
          </Link>
        </div>
      </div>

      {expiringStudents.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-amber-800 font-bold mb-2">
            <AlertTriangle size={18} /> تنبيهات الإقامة
          </div>
          <div className="text-sm text-amber-700 space-y-1">
            {expiringStudents.slice(0, 5).map(s => {
              const warning = getResidencyWarning(s.residencyExpiry);
              return (
                <div key={s.id} className="flex items-center gap-2">
                  <span className={`inline-block w-2 h-2 rounded-full ${warning?.type === 'danger' ? 'bg-red-500' : 'bg-amber-500'}`} />
                  <Link to={`/students/edit/${s.id}`} className="hover:underline font-medium">{s.fullName}</Link>
                  <span className={warning?.type === 'danger' ? 'text-red-600 font-bold' : 'text-amber-600'}>
                    {warning?.text}
                  </span>
                </div>
              );
            })}
            {expiringStudents.length > 5 && (
              <p className="text-xs text-amber-500">...و {expiringStudents.length - 5} طلاب آخرين</p>
            )}
          </div>
        </div>
      )}

      <div className="card">
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute right-3 top-2.5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pr-10"
              placeholder="بحث بالاسم أو رقم الطالب..."
            />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field w-40">
            <option value="">كل الحالات</option>
            <option value="active">نشط</option>
            <option value="graduated">متخرج</option>
            <option value="suspended">موقوف</option>
            <option value="withdrawn">منسحب</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-10"><div className="animate-spin inline-block w-8 h-8 border-b-2 border-blue-900 rounded-full"></div></div>
        ) : students.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p>لا يوجد طلاب</p>
            <Link to="/students/new" className="text-blue-600 hover:underline mt-2 inline-block">إضافة أول طالب</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-right p-3 text-gray-500 font-medium">رقم الطالب</th>
                  <th className="text-right p-3 text-gray-500 font-medium">الاسم</th>
                  <th className="text-right p-3 text-gray-500 font-medium">الجنسية</th>
                  <th className="text-right p-3 text-gray-500 font-medium">انتهاء الإقامة</th>
                  <th className="text-right p-3 text-gray-500 font-medium">الهاتف</th>
                  <th className="text-right p-3 text-gray-500 font-medium">الحالة</th>
                  <th className="text-left p-3 text-gray-500 font-medium">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => {
                  const warning = getResidencyWarning(s.residencyExpiry);
                  return (
                    <tr key={s.id} className={`border-b border-gray-100 hover:bg-gray-50 ${warning ? 'bg-amber-50/50' : ''}`}>
                      <td className="p-3 font-medium">{s.studentNumber}</td>
                      <td className="p-3">{s.fullName}</td>
                      <td className="p-3 text-gray-500">{s.nationality || '-'}</td>
                      <td className="p-3">
                        {s.residencyExpiry ? (
                          <span className={`inline-flex items-center gap-1 ${warning?.type === 'danger' ? 'text-red-600 font-bold' : warning ? 'text-amber-600 font-medium' : 'text-gray-500'}`}>
                            {s.residencyExpiry}
                            {warning && <AlertTriangle size={14} />}
                            {warning && <span className="text-xs">{warning.text}</span>}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="p-3 text-gray-500">{s.phone || '-'}</td>
                      <td className="p-3">{statusBadge(s.status)}</td>
                      <td className="p-3">
                        <div className="flex gap-2 justify-end">
                          <Link to={`/students/edit/${s.id}`} className="p-1.5 hover:bg-blue-100 rounded-lg text-blue-600">
                            <Pencil size={16} />
                          </Link>
                          <button onClick={() => handleDelete(s.id)} className="p-1.5 hover:bg-red-100 rounded-lg text-red-600">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
