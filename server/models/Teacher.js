module.exports = (sequelize, DataTypes) => {
  const Teacher = sequelize.define('Teacher', {
    fullName: { type: DataTypes.STRING, allowNull: false },
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
    specialization: DataTypes.STRING,
    hireDate: DataTypes.DATEONLY,
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  });

  Teacher.associate = (models) => {
    Teacher.belongsTo(models.User, { foreignKey: 'userId' });
    Teacher.hasMany(models.Subject, { foreignKey: 'teacherId' });
    Teacher.hasMany(models.Class, { foreignKey: 'teacherId' });
  };

  return Teacher;
};
