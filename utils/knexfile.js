module.exports = {
  OTDEV: {
    client: "mysql2",
    connection: {
      host: "147.93.30.32",
      // host: "localhost",
      port: 3306,
      user: "root",
      password: "c7d415fd5addf27b5c48",
      database: "becdb",
    },
    pool: {
      min: 2, // Minimum number of connections in the pool
      max: 10, // Maximum number of connections in the pool
    },
    debug: false,
  },
  OTLIVE: {
    client: "mysql2",
    connection: {
      host: "147.93.30.32",
      // host: "localhost",
      port: 3306,
      user: "root",
      password: "c7d415fd5addf27b5c48",
      database: "becdb",
    },
    pool: {
      min: 2,
      max: 10,
    },
    debug: false,
  },
};
