 const router = require("express").Router();
const controller = require("../controller/index");
const verifyToken = require("../../../../middleware/auth");

router.post("/getEnrollments", controller.getEnrollments);
router.post("/getCompletedEnrollment", controller.getCompletedEnrollment);
router.post("/assignAdmin", controller.assignAdmin);
router.post("/assignUniversity", controller.selectUniversity);
router.post("/sendCheckList", controller.sendCheckList);
router.post("/getCheckListData", controller.getCheckListData);
router.post("/sendofferletter", controller.sendOfferLetter);
router.post("/requestReceipt", controller.requestReceipt);
router.post("/uploadCoe", controller.uploadCoeDocument);
router.post("/uploadVisa", controller.uploadVisaDocument);


router.post("/viewCheckListStatus", controller.viewCheckListStatus);

module.exports = router;
