const router = require("express").Router();
const controller = require("../controller/index");
const verifyToken = require("../../../../middleware/auth");

//University
router.post("/createCourse", controller.createCourse);
router.post("/getCourse", controller.getCourse);
router.post("/editCourse", controller.editCourse);
// router.post("/deleteCourse", controller.deleteCourse);
router.post("/updateCourseStatus", controller.updateCourseStatus);

module.exports = router;
