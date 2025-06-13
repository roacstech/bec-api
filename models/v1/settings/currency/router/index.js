const router = require("express").Router();
const controller = require('../controller/index');
const verifyToken = require("../../../../../middleware/auth");

router.post('/getCurrency', verifyToken, controller.getCurrency);

module.exports = router;
