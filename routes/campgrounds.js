const express = require('express');
const catchAsync = require('../utils/errorWrapper');
const { isLoggedIn, isAuthor, validateCampground, storeReturnTo } = require('../middleware.js')
const campgrounds = require('../controllers/campgrounds.js')
const multer = require('multer')
const { storage } = require('../cloudinary')
const upload = multer({ storage })

const router = express.Router();

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))

router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .patch(storeReturnTo, isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))

module.exports = router;