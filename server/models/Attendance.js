module.exports = (sequelize, DataTypes) => {
  const Attendance = sequelize.define('Attendance', {
    date: { type: DataTypes.DATEONLY, allowNull: false },
    status: { type: DataTypes.ENUM('present', 'absent', 'late', 'excused'), allowNull: false },
    notes: DataTypes.TEXT,
  });

  Attendance.associate = (models) => {
    Attendance.belongsTo(models.Student, { foreignKey: 'studentId' });
    Attendance.belongsTo(models.Class, { foreignKey: 'classId' });
    Attendance.belongsTo(models.Subject, { foreignKey: 'subjectId' });
    Attendance.belongsTo(models.Teacher, { foreignKey: 'teacherId' });
  };

  return Attendance;
};
