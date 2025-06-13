
const router = require("express").Router();
const controller = require('../controller/index');
const verifyToken = require("../../../../middleware/auth");


//customers
router.post('/convertCustomer', verifyToken, controller.convertCustomer);
router.post("/createCustomer", verifyToken, controller.createCustomer);
router.post('/editCustomer', verifyToken, controller.editCustomer);
router.post('/getCustomer', verifyToken, controller.getCustomer);

router.post('/getRegistrationCustomer', verifyToken, controller.getRegistrationCustomer);

router.post('/updateCustomerStatus', verifyToken, controller.updateCustomerStatus);
router.post('/getCustomerById', verifyToken, controller.getCustomerById);

router.post('/getCustomerByIdApp', verifyToken, controller.getCustomerByIdApp);
router.post('/getRegistrationCustomerById', verifyToken, controller.getRegistrationCustomerById);
router.post('/getCustomerProject', verifyToken, controller.getCustomerProject);
router.post('/getCustomerBuildings', verifyToken, controller.getCustomerBuildings);

// approval
router.post('/loginApproval', verifyToken, controller.loginApproval);

//customer app
router.post('/editCustomerProfile', verifyToken, controller.editCustomerProfile);

router.post('/getCustomerProfileById', verifyToken, controller.getCustomerProfileById);

router.post('/getCustomerCompany', verifyToken, controller.getCustomerCompany);





module.exports = router;
