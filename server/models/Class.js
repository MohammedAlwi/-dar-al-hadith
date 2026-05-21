module.exports = (sequelize, DataTypes) => {
  const Class = sequelize.define('Class', {
    name: { type: DataTypes.STRING, allowNull: false },
    level: DataTypes.INTEGER,
  });

  Class.associate = (models) => {
    Class.belongsTo(models.AcademicYear, { foreignKey: 'academicYearId' });
    Class.belongsTo(models.Teacher, { foreignKey: 'teacherId', as: 'homeroomTeacher' });
    Class.hasMany(models.Student, { foreignKey: 'classId' });
    Class.hasMany(models.Subject, { foreignKey: 'classId' });
    Class.hasMany(models.Attendance, { foreignKey: 'classId' });
    Class.hasMany(models.Exam, { foreignKey: 'classId' });
  };

  return Class;
};
