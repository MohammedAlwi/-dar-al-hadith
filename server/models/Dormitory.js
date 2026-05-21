module.exports = (sequelize, DataTypes) => {
  const Dormitory = sequelize.define('Dormitory', {
    name: { type: DataTypes.STRING, allowNull: false },
    location: DataTypes.STRING,
    capacity: DataTypes.INTEGER,
    supervisor: DataTypes.STRING,
    notes: DataTypes.TEXT,
  });

  Dormitory.associate = (models) => {
    Dormitory.hasMany(models.Room, { foreignKey: 'dormitoryId' });
  };

  return Dormitory;
};
