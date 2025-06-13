const router = require("express").Router();
const controller = require("../controller/index");
const verifyToken = require("../../../../../middleware/auth");

//document
router.post("/addDocument", verifyToken, controller.addDocument);
router.post("/editDocument", verifyToken, controller.editDocument);
router.post("/getDocument", controller.getDocument);
router.post(
  "/updateDocumentStatus",
  verifyToken,
  controller.updateDocumentStatus
);

module.exports = router;
