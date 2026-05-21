module.exports = (sequelize, DataTypes) => {
  const Room = sequelize.define('Room', {
    roomNumber: { type: DataTypes.STRING, allowNull: false },
    capacity: { type: DataTypes.INTEGER, defaultValue: 4 },
    gender: { type: DataTypes.ENUM('male', 'female'), defaultValue: 'male' },
    notes: DataTypes.TEXT,
  });

  Room.associate = (models) => {
    Room.belongsTo(models.Dormitory, { foreignKey: 'dormitoryId' });
    Room.hasMany(models.RoomAssignment, { foreignKey: 'roomId' });
  };

  return Room;
};
