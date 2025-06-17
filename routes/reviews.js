const express = require('express');
const catchAsync = require('../utils/errorWrapper');

const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware.js')

const router = express.Router({ mergeParams: true });
const reviews = require('../controllers/reviews.js')

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

module.exports = router;