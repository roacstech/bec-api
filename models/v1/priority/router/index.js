const router = require("express").Router();
const controller = require('../controller/index');
const verifyToken = require("../../../../middleware/auth");


//priority
router.post('/addPriority', verifyToken, controller.addPriority);
router.post('/editPriority', verifyToken, controller.editPriority);
router.post('/getPriority', verifyToken, controller.getPriority);
router.post('/updatePriorityStatus', verifyToken, controller.updatePriorityStatus);

module.exports = router;