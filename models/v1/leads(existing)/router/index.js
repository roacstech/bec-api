const router = require("express").Router();
const controller = require('../controller/index');
const verifyToken = require("../../../../middleware/auth");

//lead api

router.post("/createLead", verifyToken, controller.createLead);

router.post("/editLead", verifyToken, controller.editLead);

router.post("/getAllLeads", verifyToken, controller.getAllLeads);

router.post("/getLeadsById", verifyToken, controller.getLeadsById)

router.post("/leadReAssignToStaff", verifyToken, controller.leadReAssignToStaff);

router.post("/assignLeadToEmployee", verifyToken, controller.assignLeadToEmployee)

module.exports = router;