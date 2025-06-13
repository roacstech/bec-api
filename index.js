const dotenv = require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const { dbCheck } = require("./middleware/dbcheck");
const cookieParser = require("cookie-parser");
const path = require("path");
const knex = require("knex");
const app = express();
const knexConfig = require("./utils/knexfile");
const passport = require("./config/passport");
const session = require("express-session");
const fileUpload = require("express-fileupload");
const routes = require("./routes/index");

// Middleware
app.use(fileUpload({ debug: true }));
app.use(cors({ credentials: true, origin: true }));
app.use(bodyParser.json({ limit: "20mb" }));
app.use(bodyParser.urlencoded({ limit: "20mb", extended: true }));
app.use(helmet());
app.use(cookieParser());
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "mysecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // set to true in production with HTTPS
  })
);

// DB Connection
const dbConnection = knex(knexConfig.OTDEV);
global.dbConnection = dbConnection;

// Test root route
app.get("/", (req, res) => {
  res.send("API is live and running!");
});

// Mount main routes
app.use("/api/ont/v1/dev", routes);

// Start the server
const server = http.createServer(app);
const PORT = process.env.PORT || 9672;
server.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`);
});




// // index.js
// const dotenv = require("dotenv").config();
// const express = require("express");
// const http = require("http");
// const cors = require("cors");
// const bodyParser = require("body-parser");
// const helmet = require("helmet");
// const { dbCheck } = require("./middleware/dbcheck");
// const cookieParser = require("cookie-parser");
// const path = require("path");
// const knex = require("knex");
// const app = express();
// const knexConfig = require("./utils/knexfile"); // Import the knex configuration
// const passport = require("./config/passport");
// const session = require("express-session"); // Import express-session
// const fileUpload = require("express-fileupload");
// const routes = require("./routes/index");


// // Middleware for file uploads (apply globally)
// app.use(fileUpload({ debug: true }));

// app.use(cors({ credentials: true, origin: true }));
// app.use(bodyParser.json({ limit: "20mb" }));
// app.use(bodyParser.urlencoded({ limit: "20mb", extended: true }));
// app.use(helmet());
// // app.use(dbCheck);

// app.use(
//   session({
//     secret: process.env.SESSION_SECRET || "mysecretkey", // Use a secure secret
//     resave: false,
//     saveUninitialized: false,
//     cookie: { secure: false }, // Set true if using HTTPS
//   })
// );

// // Initialize knex with the configuration (You can use either OTDEV or OTLIVE based on the environment)
// const dbConnection = knex(knexConfig.OTDEV); // You can replace OTDEV with OTLIVE if needed

// // Make the dbConnection available globally
// global.dbConnection = dbConnection;

// app.use(cookieParser());
// app.use("/assets", express.static(path.join(__dirname, "assets")));
// app.use(express.json());
// // index.js
// // app.use(passport.initialize());
// // app.use(passport.session());

// const server = http.createServer(app);
// const PORT = process.env.PORT || 9672;

// server.listen(PORT, () => {
//   console.log(`Server is listening on port: ${PORT}`);
// });

// // Set up routes
// app.use("/api/ont/v1/dev", routes);
