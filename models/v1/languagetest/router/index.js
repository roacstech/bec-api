const router = require("express").Router();
const controller = require("../controller/index");
const verifyToken = require("../../../../middleware/auth");

router.post("/createLanguageTest", controller.createLanguageTest);
router.post("/getLanguageTest", controller.getLanguageTests);
router.post("/editLanguageTest", controller.editLanguageTest);
router.post("/updateLanguageTestStatus", controller.updateLanguageTestStatus);

module.exports = router;
