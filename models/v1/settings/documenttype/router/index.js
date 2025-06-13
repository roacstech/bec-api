const router = require("express").Router();
const controller = require('../controller/index');
const verifyToken = require("../../../../../middleware/auth");

//document type
router.post('/addDocumentType', verifyToken, controller.addDocumentType);
router.post('/editDocumentType', verifyToken, controller.editDocumentType);
router.post('/getDocumentType', verifyToken, controller.getDocumentType);
router.post('/updateDocumentTypeStatus', verifyToken, controller.updateDocumentTypeStatus);


module.exports = router;