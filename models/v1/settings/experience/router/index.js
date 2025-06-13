const router = require("express").Router();
const controller = require('../controller/index');
const verifyToken = require("../../../../../middleware/auth");

//locations
router.post('/addExperience', verifyToken, controller.addExperience);
router.post('/editExperience', verifyToken, controller.editExperience);
router.post('/getExperience', verifyToken, controller.getExperience);
router.post('/updateExperienceStatus', verifyToken, controller.updateExperienceStatus);


module.exports = router;