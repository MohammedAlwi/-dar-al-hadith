import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, ClipboardCheck,
  FileSpreadsheet, Building2, DoorOpen, KeyRound, CalendarCheck,
  School, FileText, LogOut, BookMarked, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/', label: 'لوحة التحكم', icon: LayoutDashboard },
  { to: '/students', label: 'الطلاب', icon: Users },
  { to: '/teachers', label: 'المعلمون', icon: GraduationCap },
  { to: '/classes', label: 'الصفوف', icon: School },
  { to: '/subjects', label: 'المواد الدراسية', icon: BookOpen },
  { to: '/academic-years', label: 'السنوات الدراسية', icon: CalendarCheck },
  {
    label: 'الحضور والغياب', icon: ClipboardCheck,
    children: [
      { to: '/attendance', label: 'تسجيل الحضور' },
      { to: '/attendance/report', label: 'تقارير الحضور' },
    ],
  },
  {
    label: 'الدرجات', icon: FileSpreadsheet,
    children: [
      { to: '/grades', label: 'إدارة الدرجات' },
    ],
  },
  { to: '/exams', label: 'الامتحانات', icon: BookMarked },
  {
    label: 'الإقامة', icon: Building2,
    children: [
      { to: '/dormitories', label: 'المباني' },
      { to: '/rooms', label: 'الغرف' },
      { to: '/room-assignments', label: 'تسجيل الطلاب' },
    ],
  },
  { to: '/excel', label: 'رفع Excel', icon: FileText },
];

export default function Sidebar() {
  const { logout } = useAuth();
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (label) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

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
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => {
          if (item.children) {
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
                    {item.children.map((child) => (
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
