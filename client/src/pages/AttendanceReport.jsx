import { useState, useEffect } from 'react';
import api from '../services/api';

export default function AttendanceReport() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { api.get('/classes').then((res) => setClasses(res.data)).catch(() => {}); }, []);

  const fetchReport = async () => {
    if (!selectedClass) return;
    setLoading(true);
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const res = await api.get(`/attendance/report/${selectedClass}`, { params });
      setReport(res.data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { if (selectedClass) fetchReport(); }, [selectedClass]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">تقارير الحضور والغياب</h2>

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">الصف</label>
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="input-field">
              <option value="">اختر الصف</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">من تاريخ</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">إلى تاريخ</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-field" />
          </div>
          <div className="flex items-end">
            <button onClick={fetchReport} className="btn-primary w-full">عرض التقرير</button>
          </div>
        </div>
      </div>

      {loading && <div className="text-center py-10"><div className="animate-spin inline-block w-8 h-8 border-b-2 border-blue-900 rounded-full"></div></div>}

      {report && !loading && (
        <div className="card">
          {report.length === 0 ? <p className="text-center text-gray-400 py-10">لا توجد بيانات</p>
          : <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-200">
                  <th className="text-right p-3 text-gray-500">الطالب</th>
                  <th className="text-center p-3 text-gray-500">إجمالي</th>
                  <th className="text-center p-3 text-gray-500">حاضر</th>
                  <th className="text-center p-3 text-gray-500">غائب</th>
                  <th className="text-center p-3 text-gray-500">متأخر</th>
                  <th className="text-center p-3 text-gray-500">معذر</th>
                  <th className="text-center p-3 text-gray-500">نسبة الحضور</th>
                </tr></thead>
                <tbody>
                  {report.map((r) => (
                    <tr key={r.student.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 font-medium">{r.student.fullName}</td>
                      <td className="p-3 text-center">{r.total}</td>
                      <td className="p-3 text-center text-emerald-600 font-medium">{r.present}</td>
                      <td className="p-3 text-center text-red-600 font-medium">{r.absent}</td>
                      <td className="p-3 text-center text-amber-600 font-medium">{r.late}</td>
                      <td className="p-3 text-center text-blue-600 font-medium">{r.excused}</td>
                      <td className="p-3 text-center">
                        <span className={`badge ${parseFloat(r.attendanceRate) >= 80 ? 'badge-green' : parseFloat(r.attendanceRate) >= 60 ? 'badge-yellow' : 'badge-red'}`}>
                          {r.attendanceRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          }
        </div>
      )}
    </div>
  );
}
