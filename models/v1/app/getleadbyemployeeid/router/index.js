const router = require("express").Router();
const controller = require('../controller/index');
const verifyToken = require("../../../../../middleware/auth");


router.post("/getleadbyemployeeid",verifyToken, controller.getleadbyemployeeid);

router.post("/employeeSiteVisit", verifyToken, controller.employeeSiteVisit);

router.post("/getLeadSiteVisitDetails",verifyToken, controller.getLeadSiteVisitDetails)


module.exports = router;