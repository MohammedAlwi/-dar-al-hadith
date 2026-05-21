module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    fullName: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('admin', 'teacher', 'student', 'data_entry'), defaultValue: 'teacher' },
    phone: DataTypes.STRING,
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  });

  return User;
};
