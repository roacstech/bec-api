const express = require("express");
const router = express.Router();
const controller = require("../controller/index");

router.post("/sendWebsiteEmail", controller.sendWebsiteMail);
router.post("/sendWebsiteConsultingEmail", controller.sendConsultingFormMail);

module.exports = router;
