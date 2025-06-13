const router = require("express").Router();
const controller = require("../controller/index");
const verifyToken = require("../../../../middleware/auth");

router.post("/createCompany", verifyToken, controller.createCompany);
router.post("/editCompany", verifyToken, controller.editCompany);
router.post("/getAllCompany", verifyToken, controller.getAllCompany);
router.post(
  "/updateCompanyStatus",
  verifyToken,
  controller.updateCompanyStatus
);

module.exports = router;
