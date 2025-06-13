const router = require("express").Router();
const controller = require("../controller/index");
const verifyToken = require("../../../../middleware/auth");

//locations
router.post("/getCountries", controller.getCountries);
router.post("/getAllCountries", controller.getAllCountries);
router.post("/getStates", controller.getStates);
router.post("/getCities", controller.getCities);

module.exports = router;
