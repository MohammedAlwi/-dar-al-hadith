import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { FileSpreadsheet } from 'lucide-react';

export default function Grades() {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedType, setSelectedType] = useState('exam');
  const [selectedTerm, setSelectedTerm] = useState('first');
  const [grades, setGrades] = useState({});
  const [existingGrades, setExistingGrades] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([api.get('/classes'), api.get('/subjects')])
      .then(([cRes, sRes]) => { setClasses(cRes.data); setSubjects(sRes.data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedClass) {
      setLoading(true);
      api.get('/students', { params: { classId: selectedClass, status: 'active' } })
        .then((res) => setStudents(res.data)).catch(() => {}).finally(() => setLoading(false));
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedClass && selectedSubject && selectedType && selectedTerm) {
      api.get('/grades', { params: { classId: selectedClass, subjectId: selectedSubject, type: selectedType, term: selectedTerm } })
        .then((res) => {
          const map = {};
          res.data.forEach((g) => { map[g.studentId] = g.grade; });
          setExistingGrades(map);
          setGrades(map);
        }).catch(() => {});
    }
  }, [selectedClass, selectedSubject, selectedType, selectedTerm]);

  const handleSave = async () => {
    if (!selectedSubject) { toast.error('الرجاء اختيار المادة'); return; }
    setSaving(true);
    try {
      const subject = subjects.find(s => s.id === parseInt(selectedSubject));
      const records = Object.entries(grades)
        .filter(([_, grade]) => grade !== '' && grade !== undefined)
        .map(([studentId, grade]) => ({
          studentId: parseInt(studentId), subjectId: parseInt(selectedSubject),
          grade: parseFloat(grade), maxGrade: subject?.maxGrade || 100,
          type: selectedType, term: selectedTerm,
        }));
      await api.post('/grades/batch', { records });
      toast.success('تم حفظ الدرجات بنجاح');
    } catch {} finally { setSaving(false); }
  };

  const getMaxGrade = () => {
    const subject = subjects.find(s => s.id === parseInt(selectedSubject));
    return subject?.maxGrade || 100;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">إدارة الدرجات</h2>
      </div>

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">الصف</label>
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="input-field">
              <option value="">اختر الصف</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">المادة</label>
            <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="input-field">
              <option value="">اختر المادة</option>
              {subjects.filter(s => !selectedClass || s.classId === parseInt(selectedClass)).map((s) =>
                <option key={s.id} value={s.id}>{s.nameAr || s.name}</option>
              )}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">النوع</label>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="input-field">
              <option value="exam">امتحان</option>
              <option value="quiz">اختبار قصير</option>
              <option value="homework">واجب</option>
              <option value="project">مشروع</option>
              <option value="participation">مشاركة</option>
              <option value="final">نهائي</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الفصل</label>
            <select value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)} className="input-field">
              <option value="first">الأول</option>
              <option value="second">الثاني</option>
              <option value="final">النهائي</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={handleSave} disabled={saving || !selectedSubject} className="btn-primary w-full">
              {saving ? 'جاري الحفظ...' : 'حفظ الدرجات'}
            </button>
          </div>
        </div>
      </div>

      {selectedClass && (
        <div className="card">
          {loading ? <div className="text-center py-10"><div className="animate-spin inline-block w-8 h-8 border-b-2 border-blue-900 rounded-full"></div></div>
          : students.length === 0 ? <p className="text-center text-gray-400 py-10">لا يوجد طلاب</p>
          : <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-200">
                  <th className="text-right p-3 text-gray-500">#</th>
                  <th className="text-right p-3 text-gray-500">الطالب</th>
                  <th className="text-center p-3 text-gray-500">الدرجة (من {getMaxGrade()})</th>
                  <th className="text-center p-3 text-gray-500">التقرير</th>
                </tr></thead>
                <tbody>
                  {students.map((s, idx) => (
                    <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 text-gray-400">{idx + 1}</td>
                      <td className="p-3 font-medium">{s.fullName}</td>
                      <td className="p-3 text-center">
                        <input
                          type="number"
                          step="0.01"
                          value={grades[s.id] ?? ''}
                          onChange={(e) => setGrades({ ...grades, [s.id]: e.target.value })}
                          className="input-field w-28 text-center mx-auto"
                          min="0"
                          max={getMaxGrade()}
                        />
                      </td>
                      <td className="p-3 text-center">
                        <Link to={`/grades/report/${s.id}`} className="text-blue-600 hover:underline inline-flex items-center gap-1">
                          <FileSpreadsheet size={14} /> عرض
                        </Link>
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
