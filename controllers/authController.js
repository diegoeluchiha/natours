const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');
const { Email } = require('../utils/email');
// const bcrypt = require('bcrypt');

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

//refactorizar el createSendToken sin cookie
const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id); //esto es para crear el token con el id del usuario

  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true, //esto es para que la cookie no sea accesible desde el cliente
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https' ? true : false,
  };
  // if (process.env.NODE_ENV === 'production') cookieOptions.secure = true; //esto es para que la cookie solo se envie por https

  res.cookie('jwt', token, cookieOptions); //aqui se envia la cookie al cliente y se guarda en el navegador
  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

const signup = catchAsync(async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  const url = `${req.protocol}://${req.get('host')}/me`;
  // console.log(url);
  await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, req, res);
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //1) check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  //2) check if user exists and password is correct
  const user = await User.findOne({
    email,
  }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  //3) if everything ok, send token to client
  createSendToken(user, 200, req, res);
});

const logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true, //esto es para que la cookie no sea accesible desde el cliente
  });
  res.status(200).json({
    status: 'success',
    message: 'Logged out',
  });
};

const protect = catchAsync(async (req, res, next) => {
  //1) get token and check if it is there
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt && req.cookies.jwt !== 'loggedout') {
    token = req.cookies.jwt;
  }
  if (!token) {
    //redirect to login page
    // res.redirect('/login');
    return next(new AppError('You are not logged in! Please log in to get access', 401));
  }

  //2) verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log(decoded);

  //3) check if user still exists
  const currentUser = await User.findById(decoded.id);
  // console.log(currentUser);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token does no longer exist', 401));
  }
  //4) check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    //enviamos el timestamp del token
    return next(new AppError('User recently changed password! Please log in again', 401));
  }

  // Grant access to protected route /traducido: dar acceso a la ruta protegida
  req.user = currentUser; //esto es para que el usuario pueda acceder a la ruta protegida
  res.locals.user = currentUser; //esto es para que el usuario pueda acceder a la ruta protegida
  next();
});

const isLoggedIn = async (req, res, next) => {
  //1) get token and check if it is there
  if (req.cookies.jwt) {
    try {
      //2) verify token
      const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
      //3) check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        //esto es para que si el usuario no existe no se le muestre la vista de usuario logueado
        return next();
      }
      //4) check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        //enviamos el timestamp del token
        //esto es para que si el usuario cambio la contraseña no se le muestre la vista de usuario logueado
        return next();
      }
      // There is a logged in user
      res.locals.user = currentUser; //esto es para que el usuario pueda acceder a la ruta protegida
      return next();
    } catch {
      return next();
      // console.log(err);
      // return next(new AppError('You are not logged in! Please log in to get access', 401));
    }
  }
  next();
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      //esto es para que solo los roles que esten en el array roles puedan acceder a la ruta
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

const forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('there is not user with email address', 404));
  }
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('There was an error sending the email. Try again later!', 500));
  }
});

const resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Usar la función modular para enviar el token
  createSendToken(user, 200, req, res);
});

const updatePassword = catchAsync(async (req, res, next) => {
  //coloca los comentarios enumerados de lo que hay que hacer
  //1) get user from collection.
  const user = await User.findById(req.user.id).select('+password');
  //2) check if posted current password is correct.

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong', 401));
  }

  //3) if so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  //!user.findByIdAndUpdate no funciona porque no funcionarian las validaciones y el middleware de save no lo hace
  //4) log user in, send JWT
  createSendToken(user, 200, req, res);
});

module.exports = {
  signup,
  login,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
  isLoggedIn,
  logout,
};

// * This is a highlighted comment
// ! This is an important comment
// ? This is a question comment
// TODO: This is a todo comment
// @param This is a parameter comment
