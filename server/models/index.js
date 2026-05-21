const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config');

const dbConfig = config.db;
const sequelize = dbConfig.url
  ? new Sequelize(dbConfig.url, {
      dialect: dbConfig.dialect,
      logging: dbConfig.logging,
      dialectOptions: dbConfig.dialectOptions,
      define: { freezeTableName: true },
    })
  : new Sequelize({
      dialect: dbConfig.dialect,
      storage: dbConfig.storage,
      logging: dbConfig.logging,
      define: { freezeTableName: true },
    });

const models = {};

models.User = require('./User')(sequelize, DataTypes);
models.Student = require('./Student')(sequelize, DataTypes);
models.Teacher = require('./Teacher')(sequelize, DataTypes);
models.Class = require('./Class')(sequelize, DataTypes);
models.Subject = require('./Subject')(sequelize, DataTypes);
models.AcademicYear = require('./AcademicYear')(sequelize, DataTypes);
models.Attendance = require('./Attendance')(sequelize, DataTypes);
models.Grade = require('./Grade')(sequelize, DataTypes);
models.Dormitory = require('./Dormitory')(sequelize, DataTypes);
models.Room = require('./Room')(sequelize, DataTypes);
models.RoomAssignment = require('./RoomAssignment')(sequelize, DataTypes);
models.Exam = require('./Exam')(sequelize, DataTypes);
models.ExamResult = require('./ExamResult')(sequelize, DataTypes);

Object.values(models).forEach((model) => {
  if (model.associate) model.associate(models);
});

models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = models;
