const router = require("express").Router();
const controller = require('../controller/index');
const verifyToken = require("../../../../middleware/auth");

router.post('/emirateExpNotification', verifyToken, controller.emirateExpNotification);

module.exports = router;