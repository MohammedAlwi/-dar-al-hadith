import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Upload, FileSpreadsheet, Download, Users, GraduationCap, BookOpen, Building2, School, ClipboardCheck, BookMarked, DoorOpen } from 'lucide-react';

const importTypes = [
  { value: 'students', label: 'طلاب', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
  { value: 'teachers', label: 'معلمين', icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { value: 'classes', label: 'صفوف', icon: School, color: 'text-purple-600', bg: 'bg-purple-50' },
  { value: 'subjects', label: 'مواد دراسية', icon: BookOpen, color: 'text-amber-600', bg: 'bg-amber-50' },
  { value: 'dormitories', label: 'مباني سكنية', icon: Building2, color: 'text-rose-600', bg: 'bg-rose-50' },
  { value: 'rooms', label: 'غرف', icon: DoorOpen, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  { value: 'attendance', label: 'حضور وغياب', icon: ClipboardCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { value: 'exams', label: 'امتحانات', icon: BookMarked, color: 'text-orange-600', bg: 'bg-orange-50' },
  { value: 'grades', label: 'درجات', icon: FileSpreadsheet, color: 'text-emerald-600', bg: 'bg-emerald-50' },
];

const guides = {
  students: { required: 'الاسم', optional: 'رقم_الطالب, الجنسية, الهاتف, البريد, العنوان, ولي_الأمر, الصف' },
  teachers: { required: 'الاسم', optional: 'الهاتف, البريد, التخصص, تاريخ_التعيين — أو استخدم "تصدير المعلمين" للحصول على ملف بجميع المعلمين مع موادهم وتلاميذهم' },
  classes: { required: 'اسم_الصف', optional: 'المستوى' },
  subjects: { required: 'اسم_المادة', optional: 'رمز_المادة, المعلم, الصف, الدرجة_القصوى, المعامل, الساعات' },
  dormitories: { required: 'اسم_المبنى', optional: 'الموقع, السعة, المشرف' },
  rooms: { required: 'رقم_الغرفة', optional: 'المبنى, السعة, الجنس (ذكر/أنثى)' },
  attendance: { required: 'رقم_الطالب أو الاسم + التاريخ', optional: 'الحالة (present/absent/late/excused)' },
  exams: { required: 'اسم_الامتحان', optional: 'المادة, الصف, الفصل, التاريخ, الدرجة_القصوى, المعامل, المدة' },
  grades: { required: 'رقم_الطالب أو الاسم + رمز_المادة أو المادة', optional: 'الدرجة, الدرجة_القصوى, النوع, الفصل, التاريخ' },
};

export default function ExcelImport() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [importType, setImportType] = useState('students');
  const [result, setResult] = useState(null);

  const currentType = importTypes.find(t => t.value === importType);
  const Icon = currentType?.icon || FileSpreadsheet;

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) { setFile(f); setPreview(null); setResult(null); }
  };

  const handleUpload = async () => {
    if (!file) { toast.error('الرجاء اختيار ملف'); return; }
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/excel/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPreview(res.data);
      toast.success(`تم رفع الملف: ${res.data.rowCount} صف`);
    } catch {} finally { setUploading(false); }
  };

  const handleImport = async () => {
    if (!file) { toast.error('الرجاء اختيار ملف'); return; }
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const endpoint = `/excel/import-${importType}`;
      const res = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data);
      toast.success(`تم استيراد ${res.data.imported} سجل بنجاح`);
    } catch {} finally { setUploading(false); }
  };

  const handleExport = async () => {
    try {
      const res = await api.post('/excel/export-students', {}, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'students.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('تم تصدير الملف');
    } catch {}
  };

  const handleExportTeachers = async () => {
    try {
      const res = await api.post('/excel/export-teachers', {}, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url; link.download = 'teachers.xlsx'; link.click();
      window.URL.revokeObjectURL(url);
      toast.success('تم تصدير المعلمين');
    } catch {}
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">رفع وتحليل ملفات Excel</h2>

      <div className="card">
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">اختر ملف Excel</label>
            <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">نوع الاستيراد</label>
            <select value={importType} onChange={(e) => setImportType(e.target.value)} className="input-field">
              {importTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleUpload} disabled={!file || uploading} className="btn-secondary flex items-center gap-2">
            <Upload size={16} /> {uploading ? 'جاري الرفع...' : 'معاينة الملف'}
          </button>
          <button onClick={handleImport} disabled={!file || uploading} className="btn-primary flex items-center gap-2">
            <FileSpreadsheet size={16} /> {uploading ? 'جاري...' : `استيراد ${currentType?.label}`}
          </button>
          <a href={`/api/excel/template/${importType}`} className="btn-secondary flex items-center gap-2">
            <Download size={16} /> نموذج Excel
          </a>
          <div className="flex-1"></div>
          <button onClick={handleExport} className="btn-success flex items-center gap-2">
            <Download size={16} /> تصدير الطلاب
          </button>
          <button onClick={handleExportTeachers} className="btn-success flex items-center gap-2 bg-green-600 hover:bg-green-700">
            <Download size={16} /> تصدير المعلمين
          </button>
        </div>
      </div>

      {preview && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <FileSpreadsheet size={20} className="text-emerald-600" />
            <h3 className="font-bold text-lg">{preview.originalName}</h3>
            <span className="badge badge-blue">{preview.rowCount} صف</span>
            <span className="badge badge-gray">{preview.sheetNames?.length || 1} ورقة</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-gray-200">
                {preview.columns?.map((col) => <th key={col} className="text-right p-2 text-gray-500">{col}</th>)}
              </tr></thead>
              <tbody>
                {preview.preview?.map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-100">
                    {preview.columns.map((col) => (
                      <td key={col} className="p-2">{row[col] ?? ''}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.rowCount > 10 && <p className="text-xs text-gray-400 mt-2">...وعرض أول 10 صفوف فقط</p>}
          </div>
        </div>
      )}

      {result && (
        <div className="card">
          <h3 className="font-bold text-lg mb-4">نتائج الاستيراد</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-emerald-50 rounded-xl">
              <Icon size={24} className="text-emerald-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-emerald-700">{result.imported}</p>
              <p className="text-xs text-emerald-600">تم الاستيراد</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <Icon size={24} className="text-gray-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-700">{result.skipped}</p>
              <p className="text-xs text-gray-600">تم التخطي</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-xl">
              <Icon size={24} className="text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-700">{result.errors?.length || 0}</p>
              <p className="text-xs text-red-600">أخطاء</p>
            </div>
          </div>
          {result.errors?.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-sm mb-2">تفاصيل الأخطاء:</h4>
              <div className="bg-red-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                {result.errors.map((err, idx) => (
                  <p key={idx} className="text-xs text-red-700">الصف {err.row}: {err.message}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="card bg-blue-50 border border-blue-200">
        <div className="flex items-center gap-2 text-blue-800 font-bold mb-2">
          <Download size={18} /> تصدير ملف معلم كامل
        </div>
        <p className="text-sm text-blue-700 mb-2">
          يمكنك تصدير ملف Excel لكل معلم على حدة من صفحة <strong>المعلمين</strong> بالضغط على أيقونة التحميل
          بجانب كل معلم. الملف يحتوي على ثلاث أوراق:
        </p>
        <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
          <li><strong>المعلم:</strong> معلومات المعلم الأساسية (الاسم، التخصص، الهاتف، البريد)</li>
          <li><strong>المواد:</strong> جميع المواد التي يدرسها المعلم مع أسماء الصفوف وعدد الطلاب</li>
          <li><strong>الطلاب:</strong> جميع تلاميذ المعلم في صفوفه المختلفة</li>
        </ul>
      </div>

      <div className="card">
        <h3 className="font-bold text-lg mb-3">طريقة الاستيراد حسب النوع</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {importTypes.map((t) => {
            const guide = guides[t.value];
            return (
              <div key={t.value} className={`p-4 rounded-xl ${t.bg} border border-gray-100`}>
                <h4 className={`font-bold text-sm ${t.color} mb-2 flex items-center gap-1.5`}>
                  <t.icon size={16} /> {t.label}
                </h4>
                <p className="text-xs text-gray-600 mb-1">
                  <span className="font-medium">مطلوب:</span> {guide.required}
                </p>
                <p className="text-xs text-gray-500">
                  <span className="font-medium">اختياري:</span> {guide.optional}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
