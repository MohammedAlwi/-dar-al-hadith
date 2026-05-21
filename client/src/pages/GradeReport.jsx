import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { ArrowRight } from 'lucide-react';

export default function GradeReport() {
  const { studentId } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/grades/report/${studentId}`)
      .then((res) => setReport(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) return <div className="text-center py-20"><div className="animate-spin inline-block w-10 h-10 border-b-2 border-blue-900 rounded-full"></div></div>;
  if (!report) return <p className="text-center text-gray-400 py-20">لا توجد بيانات</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Link to="/grades" className="text-blue-600 hover:underline flex items-center gap-1"><ArrowRight size={16} /> العودة</Link>
        <h2 className="text-2xl font-bold text-gray-800">تقرير درجات الطالب</h2>
      </div>

      <div className="card">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div><p className="text-sm text-gray-500">الاسم</p><p className="font-bold">{report.student?.fullName}</p></div>
          <div><p className="text-sm text-gray-500">رقم الطالب</p><p className="font-bold">{report.student?.studentNumber}</p></div>
          <div><p className="text-sm text-gray-500">الصف</p><p className="font-bold">{report.student?.Class?.name || '-'}</p></div>
          <div><p className="text-sm text-gray-500">المعدل العام</p>
            <p className={`font-bold text-xl ${parseFloat(report.overallPercentage) >= 70 ? 'text-emerald-600' : parseFloat(report.overallPercentage) >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
              {report.overallPercentage}%
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200">
              <th className="text-right p-3 text-gray-500">المادة</th>
              <th className="text-center p-3 text-gray-500">الدرجة</th>
              <th className="text-center p-3 text-gray-500">النسبة</th>
              <th className="text-center p-3 text-gray-500">المعامل</th>
              <th className="text-center p-3 text-gray-500">النتيجة الموزونة</th>
            </tr></thead>
            <tbody>
              {report.subjects?.map((s) => (
                <tr key={s.subject.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-3 font-medium">{s.subject.name}</td>
                  <td className="p-3 text-center">{s.total} / {s.maxTotal}</td>
                  <td className="p-3 text-center">
                    <span className={`badge ${parseFloat(s.percentage) >= 70 ? 'badge-green' : parseFloat(s.percentage) >= 50 ? 'badge-yellow' : 'badge-red'}`}>
                      {s.percentage}%
                    </span>
                  </td>
                  <td className="p-3 text-center">{s.subject.coefficient}</td>
                  <td className="p-3 text-center font-medium">{s.weightedScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
