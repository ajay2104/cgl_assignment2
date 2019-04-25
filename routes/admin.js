const express = require('express');
const router = express.Router();

const adminController = require('../controllers/user');

router.post('/signup',adminController.signup);
router.post('/signin',adminController.signin);
// router.post('/logout',adminController.logout);

module.exports = router;