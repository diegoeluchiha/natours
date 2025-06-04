const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const { catchAsync } = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const getOverview = catchAsync(async (req, res) => {
  // 1) Get tour data from collection
  const tours = await Tour.find();
  //2) Build template
  //3) Render that template using tour data from 1
  res.status(200).render('overview', {
    title: 'Overview',
    tours,
  });
});

const getTour = catchAsync(async (req, res, next) => {
  // 1) Get the data for the requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  //manejar error si no existe el tour
  if (!tour) {
    return next(new AppError('There is no tour with that name', 404));
  }

  // console.log(tour);
  // 2) Build template
  // 3) Render template using data from 1
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

const getLogin = (req, res) => {
  res.status(200).render('login', {
    title: 'Login',
  });
};

const getRegister = (req, res) => {
  res.status(200).render('register', {
    title: 'Register',
  });
};

const getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
};

const getMyTours = catchAsync(async (req, res, next) => {
  // 1) Find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  // 2) Find tours with the booked IDs
  const tourIds = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIds } });

  // 3) Render the my-tours template
  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});

const updateUserData = catchAsync(async (req, res, next) => {
  // console.log(req.body);
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  //renderizar la vista de la cuenta con los datos actualizados
  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser,
  });
});

const alerts = (req, res, next) => {
  // Middleware to handle alerts
  const { alert } = req.query;
  if (alert === 'booking') {
    res.locals.alert = 'Your booking was successful! Please check your email for confirmation.';
  }

  next();
};

module.exports = {
  getOverview,
  getTour,
  getLogin,
  getRegister,
  getAccount,
  updateUserData,
  getMyTours,
  alerts,
};
