import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, ClipboardCheck,
  FileSpreadsheet, Building2, DoorOpen, KeyRound, CalendarCheck,
  School, FileText, LogOut, BookMarked, ChevronDown, ChevronUp,
  UserCog,
} from 'lucide-react';
import { useState } from 'react';

const allNavItems = [
  { to: '/', label: 'لوحة التحكم', icon: LayoutDashboard, roles: ['admin', 'teacher', 'student', 'data_entry'] },
  { to: '/students', label: 'الطلاب', icon: Users, roles: ['admin', 'teacher', 'data_entry'] },
  { to: '/teachers', label: 'المعلمون', icon: GraduationCap, roles: ['admin', 'data_entry'] },
  { to: '/classes', label: 'الصفوف', icon: School, roles: ['admin', 'teacher', 'data_entry'] },
  { to: '/subjects', label: 'المواد الدراسية', icon: BookOpen, roles: ['admin', 'teacher', 'data_entry'] },
  { to: '/academic-years', label: 'السنوات الدراسية', icon: CalendarCheck, roles: ['admin', 'data_entry'] },
  {
    label: 'الحضور والغياب', icon: ClipboardCheck, roles: ['admin', 'teacher', 'data_entry'],
    children: [
      { to: '/attendance', label: 'تسجيل الحضور', roles: ['admin', 'teacher', 'data_entry'] },
      { to: '/attendance/report', label: 'تقارير الحضور', roles: ['admin', 'teacher'] },
    ],
  },
  {
    label: 'الدرجات', icon: FileSpreadsheet, roles: ['admin', 'teacher'],
    children: [
      { to: '/grades', label: 'إدارة الدرجات', roles: ['admin', 'teacher'] },
    ],
  },
  { to: '/exams', label: 'الامتحانات', icon: BookMarked, roles: ['admin', 'teacher'] },
  {
    label: 'الإقامة', icon: Building2, roles: ['admin', 'data_entry'],
    children: [
      { to: '/dormitories', label: 'المباني', roles: ['admin', 'data_entry'] },
      { to: '/rooms', label: 'الغرف', roles: ['admin', 'data_entry'] },
      { to: '/room-assignments', label: 'تسجيل الطلاب', roles: ['admin', 'data_entry'] },
    ],
  },
  { to: '/excel', label: 'رفع Excel', icon: FileText, roles: ['admin', 'data_entry'] },
  { to: '/users', label: 'المستخدمين', icon: UserCog, roles: ['admin'] },
];

function userCanSee(item, userRole) {
  if (!item.roles) return true;
  return item.roles.includes(userRole);
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (label) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const navItems = allNavItems.filter(item => {
    if (item.children) {
      const visibleChildren = item.children.filter(c => userCanSee(c, user?.role));
      return visibleChildren.length > 0;
    }
    return userCanSee(item, user?.role);
  });

  return (
    <aside className="w-64 bg-blue-950 text-white flex flex-col h-full">
      <div className="p-5 border-b border-blue-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center font-bold text-lg">د</div>
          <div>
            <h2 className="font-bold text-sm">دار الحديث بتريم</h2>
            <p className="text-xs text-blue-300">نظام الإدارة المتكامل</p>
          </div>
        </div>
        {user && (
          <div className="mt-2 text-xs text-blue-300 bg-blue-900/50 rounded-lg p-2">
            <div className="font-medium text-white">{user.fullName}</div>
            <div>
              {user.role === 'admin' && 'مسئول النظام'}
              {user.role === 'teacher' && 'معلم'}
              {user.role === 'student' && 'طالب'}
              {user.role === 'data_entry' && 'مدخل بيانات'}
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => {
          if (item.children) {
            const visibleChildren = item.children.filter(c => userCanSee(c, user?.role));
            const isOpen = openMenus[item.label];
            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleMenu(item.label)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-blue-200 hover:bg-blue-800 hover:text-white transition"
                >
                  <item.icon size={18} />
                  <span className="flex-1 text-right">{item.label}</span>
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {isOpen && (
                  <div className="mr-6 space-y-1 mt-1">
                    {visibleChildren.map((child) => (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        className={({ isActive }) =>
                          `block px-3 py-2 rounded-lg text-sm transition ${
                            isActive ? 'bg-blue-700 text-white' : 'text-blue-300 hover:bg-blue-800 hover:text-white'
                          }`
                        }
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                  isActive ? 'bg-blue-700 text-white' : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                }`
              }
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-blue-800">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-300 hover:bg-red-900/30 hover:text-red-200 transition"
        >
          <LogOut size={18} />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}
