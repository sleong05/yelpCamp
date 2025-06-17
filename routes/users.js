const express = require('express');
const { storeReturnTo } = require('../middleware');
const router = express.Router();
const catchAsync = require('../utils/errorWrapper')
const passport = require('passport')
const users = require('../controllers/users')

router.route('/register')
    .get(users.renderRegisterForm)
    .post(catchAsync(users.registerUser))

router.route('/login')
    .get(users.renderLogin)
    .post(storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)

router.get('/logout', users.logout);

module.exports = router;