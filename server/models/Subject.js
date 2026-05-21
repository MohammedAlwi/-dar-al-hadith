module.exports = (sequelize, DataTypes) => {
  const Subject = sequelize.define('Subject', {
    name: { type: DataTypes.STRING, allowNull: false },
    nameAr: DataTypes.STRING,
    code: { type: DataTypes.STRING, unique: true },
    maxGrade: { type: DataTypes.FLOAT, defaultValue: 100 },
    coefficient: { type: DataTypes.FLOAT, defaultValue: 1 },
    weeklyHours: DataTypes.INTEGER,
  });

  Subject.associate = (models) => {
    Subject.belongsTo(models.Class, { foreignKey: 'classId' });
    Subject.belongsTo(models.Teacher, { foreignKey: 'teacherId' });
    Subject.belongsTo(models.AcademicYear, { foreignKey: 'academicYearId' });
    Subject.hasMany(models.Grade, { foreignKey: 'subjectId' });
    Subject.hasMany(models.Attendance, { foreignKey: 'subjectId' });
    Subject.hasMany(models.Exam, { foreignKey: 'subjectId' });
  };

  return Subject;
};
