const router = require("express").Router();
const controller = require('../controller/index');
const verifyToken = require("../../../../middleware/auth")

//lead status
router.post('/addLeadStatus', verifyToken, controller.addLeadStatus);
router.post('/editLeadStatus', verifyToken, controller.editLeadStatus);
router.post('/getLeadstatus', verifyToken, controller.getLeadstatus);
router.post('/updateLeadStatus', verifyToken, controller.updateLeadStatus);

module.exports = router;