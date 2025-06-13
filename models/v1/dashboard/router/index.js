const router = require("express").Router();
const controller = require('../controller/index');
const verifyToken = require("../../../../middleware/auth")


router.post("/getCounts", controller.counts)

// customer card
router.post("/customercard", controller.customercard)

router.post("/getServiceRequestInsights", controller.getServiceRequestInsights)



module.exports = router;