const router = require("express").Router();
const controller = require("../controller/index");
const verifyToken = require("../../../../middleware/auth");

router.post("/createReferraltype", controller.createReferralType);
router.post("/getReferraltype", controller.getReferralTypes);
router.post("/Referraltype", controller.editReferralType);
router.post("/updateReferraltypestatus", controller.updateReferralTypeStatus);

module.exports = router;
