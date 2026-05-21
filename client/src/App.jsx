import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import StudentForm from './pages/StudentForm';
import Teachers from './pages/Teachers';
import Classes from './pages/Classes';
import Subjects from './pages/Subjects';
import Attendance from './pages/Attendance';
import AttendanceReport from './pages/AttendanceReport';
import Grades from './pages/Grades';
import GradeReport from './pages/GradeReport';
import Dormitories from './pages/Dormitories';
import Rooms from './pages/Rooms';
import RoomAssignments from './pages/RoomAssignments';
import Exams from './pages/Exams';
import ExcelImport from './pages/ExcelImport';
import AcademicYears from './pages/AcademicYears';
import Users from './pages/Users';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div></div>;
  if (!user) return <Navigate to="/login" />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="students" element={<Students />} />
        <Route path="students/new" element={<StudentForm />} />
        <Route path="students/edit/:id" element={<StudentForm />} />
        <Route path="teachers" element={<Teachers />} />
        <Route path="classes" element={<Classes />} />
        <Route path="subjects" element={<Subjects />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="attendance/report" element={<AttendanceReport />} />
        <Route path="grades" element={<Grades />} />
        <Route path="grades/report/:studentId" element={<GradeReport />} />
        <Route path="dormitories" element={<Dormitories />} />
        <Route path="rooms" element={<Rooms />} />
        <Route path="room-assignments" element={<RoomAssignments />} />
        <Route path="exams" element={<Exams />} />
        <Route path="excel" element={<ExcelImport />} />
        <Route path="academic-years" element={<AcademicYears />} />
        <Route path="users" element={<Users />} />
      </Route>
    </Routes>
  );
}
