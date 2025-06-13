const router = require("express").Router();
const controller = require('../controller/index');
const verifyToken = require("../../../../../middleware/auth");

//quantity type
router.post('/addQuantityType', verifyToken, controller.addQuantityType);
router.post('/editQuantityType', verifyToken, controller.editQuantityType);
router.post('/getQuantityType', verifyToken, controller.getQuantityType);
router.post('/updateQuantityTypeStatus', verifyToken, controller.updateQuantityTypeStatus);


module.exports = router;