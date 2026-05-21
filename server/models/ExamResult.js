module.exports = (sequelize, DataTypes) => {
  const ExamResult = sequelize.define('ExamResult', {
    grade: { type: DataTypes.FLOAT, allowNull: false },
    percentage: DataTypes.FLOAT,
    notes: DataTypes.TEXT,
  });

  ExamResult.associate = (models) => {
    ExamResult.belongsTo(models.Exam, { foreignKey: 'examId' });
    ExamResult.belongsTo(models.Student, { foreignKey: 'studentId' });
  };

  return ExamResult;
};
