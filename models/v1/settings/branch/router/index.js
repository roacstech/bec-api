const router = require("express").Router();
const controller = require('../controller/index');
const verifyToken = require("../../../../../middleware/auth");

//branch
router.post('/addBranch', verifyToken, controller.addBranch);
router.post('/editBranch', verifyToken, controller.editBranch);
router.post('/getBranch', verifyToken, controller.getBranch);
router.post('/updateBranchStatus', verifyToken, controller.updateBranchStatus)


module.exports = router;