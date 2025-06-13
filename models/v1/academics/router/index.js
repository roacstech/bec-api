const router = require("express").Router();
const controller = require("../controller/index");
const verifyToken = require("../../../../middleware/auth");

router.post("/createAcademic", controller.createAcademic);
router.post("/getAcademic", controller.getAcademics);
router.post("/editAcademic", controller.editAcademic);
router.post("/updateAcademicStatus", controller.updateAcademicStatus);

module.exports = router;
