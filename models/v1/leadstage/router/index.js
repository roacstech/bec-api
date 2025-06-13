const router = require("express").Router();
const controller = require('../controller/index');
const verifyToken = require("../../../../middleware/auth");

//lead stage
router.post('/addLeadStage', verifyToken, controller.addLeadStage);
router.post('/editLeadStage', verifyToken, controller.editLeadStage);
router.post('/getLeadStage', verifyToken, controller.getLeadStage);
router.post('/updateLeadStageStatus', verifyToken, controller.updateLeadStageStatus);


module.exports = router;