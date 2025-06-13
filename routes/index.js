const express = require("express");
const {
  notificationMiddleWare,
} = require("../middleware/notificationMiddleWare.js");
const { emailMiddleWare } = require("../middleware/emailMiddleWare.js");
const {
  pdfGenerationMiddleWare,
} = require("../middleware/pdfGenerationMiddleware.js");
const router = express.Router();

router.get("/", (req, res) => res.send("server running"));

// Auth Route
router.use(
  "/auth",
  [notificationMiddleWare, emailMiddleWare],
  require("../models/v1/auth/router/index")
);

// registration
router.use("/student", require("../models/v1/student/router/index.js"));

// dashboard
router.use("/dashboard", require("../models/v1/dashboard/router/index"));

// Location Route
router.use("/location", require("../models/v1/location/router/index.js"));

// Admin Route
router.use("/admin", require("../models/v1/admin/router/index"));

//lead Route
router.use("/lead", require("../models/v1/leads/router/index"));

//lead status
router.use("/lead", require("../models/v1/leadstatus/router/index"));

//company
router.use("/company", require("../models/v1/comapany/router/index.js"));

// roles
router.use("/roles", require("../models/v1/roles/router/index.js"));

// app

// Get Lead By Employee Id
router.use(
  "/lead",
  require("../models/v1/app/getleadbyemployeeid/router/index.js")
);

router.use(
  "/notification",
  require("../models/v1/notification/router/index.js")
);

router.use(
  "/cron",
  [pdfGenerationMiddleWare],
  require("../models/v1/cron/router/index.js")
);

// Leads

router.use("/leads", require("../models/v1/leads/router/index.js"));

// University

router.use("/university", require("../models/v1/university/router/index.js"));

//notification
router.use("/notification", require("../models/v1/get_notification/router.js"));

// Course

router.use("/course", require("../models/v1/course/router/index.js"));

// Department

router.use("/department", require("../models/v1/department/router/index.js"));

// Aws Upload Flies

router.use("/file", require("../models/v1/files/router/index.js"));

// document Route
router.use(
  "/document",
  require("../models/v1/settings/document/router/index.js")
);

// documenttype Route
router.use(
  "/documenttype",
  require("../models/v1/settings/documenttype/router/index.js")
);

// Referral Type

router.use(
  "/referraltype",
  require("../models/v1/referraltype/router/index.js")
);

// language Test

router.use(
  "/languagetest",
  require("../models/v1/languagetest/router/index.js")
);

// language Test

router.use("/academics", require("../models/v1/academics/router/index.js"));

// Check List

router.use("/checklist", require("../models/v1/checklist/router/index.js"));

// Website Mail

router.use("/email", require("../models/v1/email/router/index.js"));

// enrollment
router.use("/enrollments", require("../models/v1/enrollments/router/index.js"));

module.exports = router;
