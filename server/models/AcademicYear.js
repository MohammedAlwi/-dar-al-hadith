module.exports = (sequelize, DataTypes) => {
  const AcademicYear = sequelize.define('AcademicYear', {
    name: { type: DataTypes.STRING, allowNull: false },
    startDate: DataTypes.DATEONLY,
    endDate: DataTypes.DATEONLY,
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  });

  AcademicYear.associate = (models) => {
    AcademicYear.hasMany(models.Student, { foreignKey: 'academicYearId' });
    AcademicYear.hasMany(models.Class, { foreignKey: 'academicYearId' });
    AcademicYear.hasMany(models.Subject, { foreignKey: 'academicYearId' });
    AcademicYear.hasMany(models.Grade, { foreignKey: 'academicYearId' });
    AcademicYear.hasMany(models.Exam, { foreignKey: 'academicYearId' });
  };

  return AcademicYear;
};
