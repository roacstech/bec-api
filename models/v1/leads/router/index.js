const router = require("express").Router();
const controller = require("../controller/index");
const verifyToken = require("../../../../middleware/auth");

router.post("/createleads", controller.createLeads);
// router.post("/getleads/:id", controller.getLeadsById);
router.post("/getleads", controller.getAllLeads);
router.post("/leads", controller.editLead);
// router.delete("/leads", controller.deleteLead);

router.post("/updateLeadsStatus", controller.updateLeadStatus);

module.exports = router;
