const router = require("express").Router();
const controller = require("../controller/index");
const verifyToken = require("../../../../middleware/auth");
//University
router.post("/createUniversity", controller.createUniversity);
router.post("/getUniversity", controller.getUniversity);
router.post("/editUniversity", controller.editUniversity);
// router.post("/deleteUniversity", controller.deleteUniversity);
router.post("/updateUniversityStatus", controller.updateUniversityStatus);

module.exports = router;
