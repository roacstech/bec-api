const router = require("express").Router();
const controller = require("../controller/index");

router.post("/uploadFile", controller.uploadFile);
router.post("/getFile", controller.getFile);

module.exports = router;
