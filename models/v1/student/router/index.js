const router = require("express").Router();
const controller = require("../controller/index");
const verifyToken = require("../../../../middleware/auth");

router.post("/registration", controller.registration);
router.post("/getStudent", controller.getStudent);
router.post("/editStudent", controller.editStudent);
router.post("/updateApprovalStatus", controller.updateApprovalStatus);
router.post("/updateOfferLetterStatus", controller.updateOfferLetterStatus);
router.post("/updateStudentStatus", controller.updateStudentStatus);

router.post("/selectUniversity", controller.selectUniversity);
router.post("/assignAdmin", controller.assignAdmin);
router.post(
  "/uploadStudentChecklistFile",
  controller.uploadStudentChecklistFile
);
router.post(
  "/uploadOfferLetterChecklistFile",
  controller.uploadOfferLetterChecklistFile
);
router.post(
  "/uploadPaymentReceiptChecklistFile",
  controller.uploadPaymentReceiptFile
);
router.post("/uploadCoeFile", controller.uploadCoEFile);
router.post("/uploadVisaChecklistFile", controller.uploadVisaChecklistFile);

module.exports = router;
