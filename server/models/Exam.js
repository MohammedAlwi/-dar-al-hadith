module.exports = (sequelize, DataTypes) => {
  const Exam = sequelize.define('Exam', {
    name: { type: DataTypes.STRING, allowNull: false },
    term: { type: DataTypes.ENUM('first', 'second', 'final'), defaultValue: 'first' },
    date: DataTypes.DATEONLY,
    maxGrade: { type: DataTypes.FLOAT, defaultValue: 100 },
    coefficient: { type: DataTypes.FLOAT, defaultValue: 1 },
    duration: DataTypes.INTEGER,
    notes: DataTypes.TEXT,
  });

  Exam.associate = (models) => {
    Exam.belongsTo(models.Subject, { foreignKey: 'subjectId' });
    Exam.belongsTo(models.Class, { foreignKey: 'classId' });
    Exam.belongsTo(models.AcademicYear, { foreignKey: 'academicYearId' });
    Exam.hasMany(models.ExamResult, { foreignKey: 'examId' });
  };

  return Exam;
};
