const { dbCheck } = require("../middleware/dbcheck");
const routes = require("../routes/index");

module.exports = (app) => {
  app.use("/api/ont/v1/dev", dbCheck, routes);

  app.use("/api/ont/v1/live", dbCheck, routes);

  app.get("/", (req, res) => res.send("Server Running Successfully!"));
};
