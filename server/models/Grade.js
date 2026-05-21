module.exports = (sequelize, DataTypes) => {
  const Grade = sequelize.define('Grade', {
    type: { type: DataTypes.ENUM('exam', 'quiz', 'homework', 'project', 'participation', 'final'), defaultValue: 'exam' },
    grade: { type: DataTypes.FLOAT, allowNull: false },
    maxGrade: { type: DataTypes.FLOAT, defaultValue: 100 },
    weight: { type: DataTypes.FLOAT, defaultValue: 1 },
    term: { type: DataTypes.ENUM('first', 'second', 'final'), defaultValue: 'first' },
    date: DataTypes.DATEONLY,
    notes: DataTypes.TEXT,
  });

  Grade.associate = (models) => {
    Grade.belongsTo(models.Student, { foreignKey: 'studentId' });
    Grade.belongsTo(models.Subject, { foreignKey: 'subjectId' });
    Grade.belongsTo(models.Teacher, { foreignKey: 'teacherId' });
    Grade.belongsTo(models.AcademicYear, { foreignKey: 'academicYearId' });
  };

  return Grade;
};
