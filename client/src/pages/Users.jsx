import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { UserPlus, Pencil, Trash2, Shield, ShieldCheck, ShieldAlert, Eye, EyeOff } from 'lucide-react';

const roleLabels = {
  admin: 'مسئول النظام',
  teacher: 'معلم',
  student: 'طالب',
  data_entry: 'مدخل بيانات',
};

const roleColors = {
  admin: 'bg-red-100 text-red-700',
  teacher: 'bg-blue-100 text-blue-700',
  student: 'bg-green-100 text-green-700',
  data_entry: 'bg-amber-100 text-amber-700',
};

const roleIcons = {
  admin: ShieldAlert,
  teacher: Shield,
  student: ShieldCheck,
  data_entry: Shield,
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '', fullName: '', role: 'teacher', phone: '' });

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try { setUsers((await api.get('/users')).data); } catch {} finally { setLoading(false); }
  };

  const openNew = () => {
    setEditUser(null);
    setForm({ username: '', email: '', password: '', fullName: '', role: 'teacher', phone: '' });
    setShowForm(true);
  };

  const openEdit = (u) => {
    setEditUser(u);
    setForm({ username: u.username, email: u.email, password: '', fullName: u.fullName, role: u.role, phone: u.phone || '' });
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      if (editUser) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        const res = await api.put(`/users/${editUser.id}`, payload);
        setUsers(users.map(u => u.id === editUser.id ? res.data : u));
        toast.success('تم تحديث المستخدم');
      } else {
        const res = await api.post('/users', form);
        setUsers([res.data, ...users]);
        toast.success('تم إنشاء المستخدم');
      }
      setShowForm(false);
    } catch (err) { toast.error(err.response?.data?.message || 'حدث خطأ'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('تأكيد حذف المستخدم؟')) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
      toast.success('تم الحذف');
    } catch (err) { toast.error(err.response?.data?.message || 'حدث خطأ'); }
  };

  if (loading) return <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mx-auto mt-20"></div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">إدارة المستخدمين</h1>
        <button onClick={openNew} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          <UserPlus size={18} /> مستخدم جديد
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border">
          <h2 className="text-lg font-bold mb-4">{editUser ? 'تعديل مستخدم' : 'مستخدم جديد'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">اسم المستخدم</label>
              <input value={form.username} onChange={e => setForm({...form, username: e.target.value})} className="w-full border rounded-lg p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border rounded-lg p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">الاسم الكامل</label>
              <input value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} className="w-full border rounded-lg p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">رقم الجوال</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full border rounded-lg p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">كلمة المرور {editUser && '(اتركه فارغاً بدون تغيير)'}</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full border rounded-lg p-2 pl-10" />
                <button onClick={() => setShowPassword(!showPassword)} className="absolute left-2 top-2 text-gray-500">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">الصلاحية</label>
              <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full border rounded-lg p-2">
                <option value="admin">مسئول النظام</option>
                <option value="teacher">معلم</option>
                <option value="student">طالب</option>
                <option value="data_entry">مدخل بيانات</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">حفظ</button>
            <button onClick={() => setShowForm(false)} className="bg-gray-200 px-6 py-2 rounded-lg hover:bg-gray-300 transition">إلغاء</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-right p-3 text-sm font-medium text-gray-600">الاسم</th>
              <th className="text-right p-3 text-sm font-medium text-gray-600">اسم المستخدم</th>
              <th className="text-right p-3 text-sm font-medium text-gray-600">البريد</th>
              <th className="text-right p-3 text-sm font-medium text-gray-600">الصلاحية</th>
              <th className="text-right p-3 text-sm font-medium text-gray-600">الحالة</th>
              <th className="text-center p-3 text-sm font-medium text-gray-600">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map(u => {
              const RoleIcon = roleIcons[u.role] || Shield;
              return (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="p-3 font-medium">{u.fullName}</td>
                  <td className="p-3 text-gray-600">{u.username}</td>
                  <td className="p-3 text-gray-600">{u.email}</td>
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${roleColors[u.role] || ''}`}>
                      <RoleIcon size={14} /> {roleLabels[u.role] || u.role}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {u.isActive ? 'نشط' : 'موقوف'}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEdit(u)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="تعديل">
                        <Pencil size={16} />
                      </button>
                      {u.role !== 'admin' && (
                        <button onClick={() => handleDelete(u.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition" title="حذف">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && (
              <tr><td colSpan="6" className="p-8 text-center text-gray-500">لا يوجد مستخدمون</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
