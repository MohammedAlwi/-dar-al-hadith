import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function StudentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [form, setForm] = useState({
    studentNumber: '', fullName: '', fullNameAr: '', dateOfBirth: '', placeOfBirth: '',
    nationality: '', phone: '', email: '', address: '', guardianName: '', guardianPhone: '',
    enrollmentDate: new Date().toISOString().split('T')[0], classId: '', status: 'active', notes: '',
  });

  useEffect(() => {
    api.get('/classes').then((res) => setClasses(res.data)).catch(() => {});
    if (id) {
      api.get(`/students/${id}`).then((res) => {
        const s = res.data;
        setForm({
          studentNumber: s.studentNumber || '', fullName: s.fullName || '', fullNameAr: s.fullNameAr || '',
          dateOfBirth: s.dateOfBirth || '', placeOfBirth: s.placeOfBirth || '',
          nationality: s.nationality || '', phone: s.phone || '', email: s.email || '',
          address: s.address || '', guardianName: s.guardianName || '', guardianPhone: s.guardianPhone || '',
          enrollmentDate: s.enrollmentDate || '', classId: s.classId || '', status: s.status || 'active', notes: s.notes || '',
        });
      }).catch(() => navigate('/students'));
    }
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        await api.put(`/students/${id}`, form);
        toast.success('تم تحديث بيانات الطالب');
      } else {
        await api.post('/students', form);
        toast.success('تم إضافة الطالب بنجاح');
      }
      navigate('/students');
    } catch {} finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">{id ? 'تعديل بيانات الطالب' : 'إضافة طالب جديد'}</h2>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">رقم الطالب</label>
            <input name="studentNumber" value={form.studentNumber} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل *</label>
            <input name="fullName" value={form.fullName} onChange={handleChange} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الاسم بالعربية</label>
            <input name="fullNameAr" value={form.fullNameAr} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الميلاد</label>
            <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">مكان الميلاد</label>
            <input name="placeOfBirth" value={form.placeOfBirth} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الجنسية</label>
            <input name="nationality" value={form.nationality} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الهاتف</label>
            <input name="phone" value={form.phone} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} className="input-field" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
            <textarea name="address" value={form.address} onChange={handleChange} className="input-field" rows="2"></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ولي الأمر</label>
            <input name="guardianName" value={form.guardianName} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">هاتف ولي الأمر</label>
            <input name="guardianPhone" value={form.guardianPhone} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ التسجيل</label>
            <input name="enrollmentDate" type="date" value={form.enrollmentDate} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الصف</label>
            <select name="classId" value={form.classId} onChange={handleChange} className="input-field">
              <option value="">اختر الصف</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
            <select name="status" value={form.status} onChange={handleChange} className="input-field">
              <option value="active">نشط</option>
              <option value="graduated">متخرج</option>
              <option value="suspended">موقوف</option>
              <option value="withdrawn">منسحب</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} className="input-field" rows="2"></textarea>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'جاري الحفظ...' : id ? 'حفظ التغييرات' : 'إضافة الطالب'}
          </button>
          <button type="button" onClick={() => navigate('/students')} className="btn-secondary">إلغاء</button>
        </div>
      </form>
    </div>
  );
}
