//🌟 Importar express🌟
const express = require('express');
const router = express.Router();
//🌟 Importar controladores de tours
const {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
  getDistances,
  uploadTourImages,
  resizeTourImages,
} = require('../controllers/tourController');

const { protect, restrictTo } = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

//no es necesario con express hacerlo asi manualmente la anidacion
// const { createReview } = require('../controllers/reviewController');

//🌟 Middleware para validar el id🌟
// router.param('id', checkID);

// POST /tour/234fad4/reviews
// GET /tour/234fad4/reviews
// GET /tour/234fad4/reviews/94887fda

// router
// .route('/:tourId/reviews')
// .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview
// );

router.use('/:tourId/reviews', reviewRouter);

//🌟 Rutas de estadísticas🌟
router.route('/tour-stats').get(getTourStats);

router
  .route('/monthly-plan/:year')
  .get(protect, restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan);

router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

//ruta para obtener tours dentro de una distancia
//asi se vera la ruta
// /tours-within/233/center/34.11111, -118.11321/unit/mi
//alternativa con query asi se veria la ruta
// /tours-within?distance=233&center=34.11111, -118.11321&unit=mi
router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(getToursWithin);

//ruta para obtener distancias
//asi se vera la ruta
// /distances/34.11111, -118.11321/unit/mi
//alternativa con query asi se veria la ruta
// /distances?latlng=34.11111, -118.11321&unit=mi
router.route('/distances/:latlng/unit/:unit').get(getDistances);

//🌟 Rutas tours🌟
router.route('/').get(getAllTours).post(protect, restrictTo('admin', 'lead-guide'), createTour);
router
  .route('/:id')
  .get(getTour)
  .patch(protect, restrictTo('admin', 'lead-guide'), uploadTourImages, resizeTourImages, updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

//rutas anidadas con express
// router.use('/:tourId/reviews', reviewRouter);

//rutas anidadas manualmente
// router.route('/:tourId/reviews').post(protect, restrictTo('user'), createReview);

module.exports = router;
