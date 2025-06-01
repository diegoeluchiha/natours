const express = require('express');
const {
  getAllReviews,
  createReview,
  deleteReview,
  updateReview,
  setUserAndTourIds,
  getReview,
} = require('../controllers/reviewController');
const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router({ mergeParams: true }); //activar merge para pasar parametros del padre router

//proteger reviews
router.use(protect);

router.route('/').get(getAllReviews).post(restrictTo('user'), setUserAndTourIds, createReview);

router
  .route('/:id')
  .get(getReview)
  .patch(restrictTo('user', 'admin'), updateReview)
  .delete(restrictTo('admin'), deleteReview);

module.exports = router;
