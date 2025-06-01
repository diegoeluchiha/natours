const Review = require('../models/reviewModel');
// const { catchAsync } = require('../utils/catchAsync');
// const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

const setUserAndTourIds = (req, res, next) => {
  //rutas anidadas inseguras porque el id de user podrian modificarlo
  // if (!req.body.tour) req.body.tour = req.params.tourId;
  // if (!req.body.user) req.body.user = req.user.id;

  //forma segura
  req.body.tour = req.params.tourId || req.body.tour;
  req.body.user = req.user.id;
  next();
};

const getAllReviews = factory.getAll(Review);
const getReview = factory.getOne(Review);
const createReview = factory.createOne(Review);
const updateReview = factory.updateOne(Review);
const deleteReview = factory.deleteOne(Review);

module.exports = {
  getAllReviews,
  createReview,
  deleteReview,
  updateReview,
  setUserAndTourIds,
  getReview,
};

//para insertar un review es asi en json
// {
//   "review": "This is a test review",
//   "rating": 4.5,
//   "tour": "64f0215626c75539a861473a",
//   "user": "64f0215626c75539a8614739"
// }
