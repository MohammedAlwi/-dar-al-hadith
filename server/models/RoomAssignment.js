module.exports = (sequelize, DataTypes) => {
  const RoomAssignment = sequelize.define('RoomAssignment', {
    startDate: { type: DataTypes.DATEONLY, allowNull: false },
    endDate: DataTypes.DATEONLY,
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    notes: DataTypes.TEXT,
  });

  RoomAssignment.associate = (models) => {
    RoomAssignment.belongsTo(models.Student, { foreignKey: 'studentId' });
    RoomAssignment.belongsTo(models.Room, { foreignKey: 'roomId' });
  };

  return RoomAssignment;
};
