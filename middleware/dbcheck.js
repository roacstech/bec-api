const knex = require("knex");
const config = require("../utils/knexfile");
const db = require("./dbconnection");

const establishConnection = async (dbConfig) => {
  try {
    const connection = knex(dbConfig);
    await connection.raw('SELECT 1');
    console.log('Database connection established successfully!');
    return connection;
  } catch (error) {
    console.error('Failed to establish database connection:', error);
    throw error;
  }
};

const dbCheck = async (req, res, next) => {
  
  if (req.originalUrl.includes('/api/ont/v1/dev')) {
    const connection = await establishConnection(config.OTDEV);
    await db.setDbConnection(connection);
    console.log('MySQL OT DEV connected');
  } else if (req.originalUrl.includes('/api/ont/v1/dev')) {
    const connection = await establishConnection(config.OTDEV);
    await db.setDbConnection(connection);
    console.log('MySQL OT DEV connected');
  } else if (req.originalUrl.includes('/api/ont/v1/live')) {
    const connection = await establishConnection(config.OTLIVE);
    await db.setDbConnection(connection);
    console.log('MySQL OT LIVE connected');
  }

  next();
};

module.exports = { dbCheck };


