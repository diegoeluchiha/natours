const express = require('express');
const {
  getCheckoutSession,
  handleWebhook,
  getAllBookings,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking,
} = require('../controllers/bookingController');

const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router(); //activar merge para pasar parametros del padre router

//ruta para crear una reserva
router.get('/create-preference/:tourId', protect, getCheckoutSession);

router.post('/webhook', handleWebhook);

// Rutas protegidas para bookings
router.use(protect);
// Rutas para obtener todas las reservas
router
  .route('/')
  .get(protect, restrictTo('admin', 'lead-guide'), getAllBookings)
  .post(restrictTo('user'), createBooking);
// Rutas para obtener, actualizar y eliminar una reserva específica
router
  .route('/:id')
  .get(restrictTo('admin', 'lead-guide'), getBooking)
  .patch(restrictTo('admin', 'lead-guide'), updateBooking)
  .delete(restrictTo('admin', 'lead-guide'), deleteBooking);

module.exports = router;
