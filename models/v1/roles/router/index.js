const router = require("express").Router();
const controller = require('../controller/index');
const verifyToken = require("../../../../middleware/auth");


// router.post("/addModuleWithSubModuleSection", verifyToken , controller.addModuleWithSubModuleSection);
// router.post("/addModule", verifyToken , controller.addModule);
// router.post("/editModule", verifyToken , controller.editModule);
router.post('/getModule', verifyToken, controller.getModule);
router.post('/getModuleWithSubmodule',  controller.getModuleWithSubmodule);
// router.post('/addSubModule', verifyToken, controller.addSubModule);
// router.post('/getAllModulesandSubmoduleSection', verifyToken, controller.getAllModulesandSubmoduleSection);
router.post('/addRolePermission',  controller.addRolePermission);
router.post('/editRolePermssion',  controller.editRolePermssion);
router.post('/getRolePermission',  controller.getRolePermission);


module.exports = router;  