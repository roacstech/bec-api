const router = require("express").Router();
const controller = require("../controller/index");
const verifyToken = require("../../../../middleware/auth");

//University
router.post("/createDepartment", controller.createDepartment);
router.post("/getDepartment", controller.getDepartment);
router.post("/editDepartment", controller.editDepartment);
// router.post("/deleteDepartment", controller.deleteDepartment);
router.post("/updateDepartmentStatus", controller.updateDepartmentStatus);

module.exports = router;
