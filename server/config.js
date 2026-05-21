module.exports = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || 'dar-al-hadith-secret-key-2026',
  jwtExpiresIn: '7d',
  db: process.env.DATABASE_URL ? {
    dialect: 'postgres',
    url: process.env.DATABASE_URL,
    logging: false,
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false },
    },
  } : {
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false,
  },
  uploadDir: './uploads',
};
