const router = require("express").Router();
const controller = require("../controller/index");
const verifyToken = require("../../../../middleware/auth");

router.post("/studentregistration", controller.studentregistration);

module.exports = router;
