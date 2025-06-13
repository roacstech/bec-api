const router = require("express").Router();
const controller = require("../controller/index");
const verifyToken = require("../../../../middleware/auth");

router.post("/createchecklist", controller.createCheckList);
router.post("/getchecklist", controller.getchecklist);
router.post("/checklist", controller.editCheckList);
router.post("/updatecheckliststatus", controller.updateCheckListStatus);

module.exports = router;
