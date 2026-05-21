module.exports = (sequelize, DataTypes) => {
  const Student = sequelize.define('Student', {
    studentNumber: { type: DataTypes.STRING, unique: true },
    fullName: { type: DataTypes.STRING, allowNull: false },
    fullNameAr: DataTypes.STRING,
    dateOfBirth: DataTypes.DATEONLY,
    placeOfBirth: DataTypes.STRING,
    nationality: DataTypes.STRING,
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
    address: DataTypes.TEXT,
    guardianName: DataTypes.STRING,
    guardianPhone: DataTypes.STRING,
    enrollmentDate: DataTypes.DATEONLY,
    status: { type: DataTypes.ENUM('active', 'graduated', 'suspended', 'withdrawn'), defaultValue: 'active' },
    notes: DataTypes.TEXT,
    photo: DataTypes.STRING,
  });

  Student.associate = (models) => {
    Student.belongsTo(models.User, { foreignKey: 'userId' });
    Student.belongsTo(models.AcademicYear, { foreignKey: 'academicYearId' });
    Student.belongsTo(models.Class, { foreignKey: 'classId' });
    Student.hasMany(models.Attendance, { foreignKey: 'studentId' });
    Student.hasMany(models.Grade, { foreignKey: 'studentId' });
    Student.hasMany(models.ExamResult, { foreignKey: 'studentId' });
    Student.hasOne(models.RoomAssignment, { foreignKey: 'studentId' });
  };

  return Student;
};
