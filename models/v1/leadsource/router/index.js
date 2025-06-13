const router = require("express").Router();
const controller = require('../controller/index');
const verifyToken = require("../../../../middleware/auth");


router.post('/createLeadSource', verifyToken, controller.createLeadSource);
router.post('/editLeadSource', verifyToken, controller.editLeadSource);
router.post('/getLeadSource', verifyToken, controller.getLeadSource);
router.post('/updateLeadSourceStatus', verifyToken, controller.updateLeadSourceStatus);

module.exports = router;
