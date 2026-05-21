import { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import {
  Users, GraduationCap, School, BookOpen, Building2, DoorOpen,
  ClipboardCheck, UserCheck, UserX, KeyRound, AlertTriangle,
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [expiringStudents, setExpiringStudents] = useState([]);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const [statsRes, studentsRes] = await Promise.all([api.get('/dashboard/stats'), api.get('/students')]);
      setStats(statsRes.data);
      const now = new Date();
      const expiring = studentsRes.data.filter(s => {
        if (!s.residencyExpiry) return false;
        const diff = (new Date(s.residencyExpiry) - now) / (1000 * 60 * 60 * 24);
        return diff <= 30;
      });
      setExpiringStudents(expiring);
    } catch {} finally { setLoading(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-900"></div></div>;

  const cards = [
    { label: 'الطلاب', value: stats?.totalStudents || 0, icon: Users, color: 'bg-blue-500', link: '/students' },
    { label: 'المعلمون', value: stats?.totalTeachers || 0, icon: GraduationCap, color: 'bg-emerald-500', link: '/teachers' },
    { label: 'الصفوف', value: stats?.totalClasses || 0, icon: School, color: 'bg-purple-500', link: '/classes' },
    { label: 'المواد', value: stats?.totalSubjects || 0, icon: BookOpen, color: 'bg-amber-500', link: '/subjects' },
    { label: 'المباني', value: stats?.totalDormitories || 0, icon: Building2, color: 'bg-rose-500', link: '/dormitories' },
    { label: 'الغرف', value: stats?.totalRooms || 0, icon: DoorOpen, color: 'bg-cyan-500', link: '/rooms' },
    { label: 'المقيمون', value: stats?.totalResidents || 0, icon: KeyRound, color: 'bg-indigo-500', link: '/room-assignments' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">لوحة التحكم</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Link key={card.label} to={card.link} className="card hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className={`${card.color} p-3 rounded-xl`}>
                <card.icon size={24} className="text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                <p className="text-sm text-gray-500">{card.label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {expiringStudents.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-amber-800 font-bold mb-2">
            <AlertTriangle size={18} /> تنبيهات انتهاء الإقامة ({expiringStudents.length})
          </div>
          <Link to="/students" className="text-sm text-amber-700 hover:underline">
            طلاب ستنتهي إقامتهم خلال 30 يوماً - اضغط لعرض التفاصيل
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-bold text-lg text-gray-800 mb-4">حضور اليوم</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-emerald-50 rounded-xl">
              <UserCheck size={28} className="text-emerald-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-emerald-700">{stats?.todayPresent || 0}</p>
              <p className="text-xs text-emerald-600">حاضر</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-xl">
              <UserX size={28} className="text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-700">{stats?.todayAbsent || 0}</p>
              <p className="text-xs text-red-600">غائب</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <ClipboardCheck size={28} className="text-gray-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-700">{stats?.todayAttendance || 0}</p>
              <p className="text-xs text-gray-600">إجمالي</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold text-lg text-gray-800 mb-4">توزيع الطلاب حسب الصفوف</h3>
          <div className="space-y-3">
            {stats?.studentsByClass?.map((item) => (
              <div key={item.classId} className="flex items-center justify-between">
                <span className="text-sm font-medium">{item.Class?.name || `صف #${item.classId}`}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-900 h-2 rounded-full"
                      style={{ width: `${Math.min(100, (item.count / Math.max(...stats.studentsByClass.map(s => s.count))) * 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-gray-700">{item.count}</span>
                </div>
              </div>
            ))}
            {(!stats?.studentsByClass || stats.studentsByClass.length === 0) && (
              <p className="text-gray-400 text-sm">لا يوجد طلاب مسجلون بعد</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
