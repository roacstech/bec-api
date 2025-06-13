const router = require("express").Router();
const controller = require('../controller/index');
const verifyToken = require("../../../../middleware/auth");


router.post('/getAllNotification', verifyToken, controller.getAllNotification);

router.post('/readNotification', verifyToken, controller.readNotification);

router.post('/getAllUnReadNotification', verifyToken, controller.getAllUnReadNotification);




module.exports = router;    