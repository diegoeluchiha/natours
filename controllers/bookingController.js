// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { preference, payment } = require('../utils/mercadoPago');
// const { randomUUID } = require('crypto');
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const AppError = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');
const factory = require('./handlerFactory');
// const Booking = require('../models/bookingModel');

const getCheckoutSession = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);
  if (!tour) {
    return next(new AppError('Tour not found', 404));
  }
  // const url = `${req.protocol}://${req.get('host')}/payment-success`;
  // console.log(`Payment success URL: ${url}`);
  // Create a preference for Mercado Pago
  const baseURL =
    process.env.NODE_ENV === 'production'
      ? `${req.protocol}://${req.get('host')}` // Obtiene el host dinámico en prod
      : process.env.NGROK_URL || 'http://localhost:3000'; // Dev con ngrok o localhost

  const response = await preference.create({
    body: {
      items: [
        {
          id: tour._id.toString(), // Use the tour ID as the item ID
          title: tour.name,
          description: tour.description,
          quantity: 1,
          currency_id: 'CLP', // Currency ID for Chilean Peso
          unit_price: tour.price, // Price of the tour
        },
      ],
      back_urls: {
        // https://61bc-181-163-208-201.ngrok-free.app
        success: `${baseURL}/my-tours`,
        failure: `${baseURL}/payment-failure`,
        pending: `${baseURL}/payment-pending`,
      },
      notification_url: `${baseURL}/api/v1/bookings/webhook`, // URL for webhook notifications
      external_reference: `${req.user.id}_${tour._id}`,
      auto_return: 'approved', // Automatically return to the specified URL after payment
    },
  });

  // // Redirect to Mercado Pago checkout
  res.status(200).json({
    status: 'success',
    data: response,
  });
});

const handleWebhook = catchAsync(async (req, res, next) => {
  const data = req.body;

  if (data.type === 'payment') {
    const paymentId = data.data.id;

    const result = await payment.get({ id: paymentId });

    // Validar que el pago esté aprobado
    if (result.status === 'approved') {
      const [tourId, userId] = result.external_reference.split('_');
      const price = result.transaction_amount;

      // Evitar duplicados
      const exists = await Booking.findOne({ tour: tourId, user: userId });
      if (!exists) {
        await Booking.create({
          tour: tourId,
          user: userId,
          price,
          paid: true,
        });
      }
    }
  }

  res.status(200).json({ received: true });
});

const getAllBookings = factory.getAll(Booking);
const getBooking = factory.getOne(Booking);
const createBooking = factory.createOne(Booking);
const updateBooking = factory.updateOne(Booking);
const deleteBooking = factory.deleteOne(Booking);

module.exports = {
  getCheckoutSession,
  handleWebhook,
  getAllBookings,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking,
};
