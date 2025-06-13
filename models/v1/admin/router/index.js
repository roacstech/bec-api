const router = require("express").Router();
const controller = require("../controller/index");
const verifyToken = require("../../../../middleware/auth");

router.post("/createAdmin", controller.createAdmin);
router.post("/editAdmin", controller.editAdmin);
router.post("/getAdmin", controller.getAdmin);
router.post("/updateAdminStatus", controller.updateAdminStatus);

module.exports = router;
