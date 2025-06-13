const router = require('express').Router();
const controller = require('./controller');

//University

router.post('/getNotification', controller.getNotification);
router.patch('/updateNotification/:id', controller.updateNotification);

module.exports = router;
