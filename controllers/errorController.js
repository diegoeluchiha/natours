// Error handling middleware
const AppError = require('../utils/appError');

const sendErrorDev = (err, req, res) => {
  // console.log('ERROR 💥', err);
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }
};

const sendErrorProd = (err, req, res) => {
  // API route
  // console.log(req.originalUrl);
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // Log the error (solo en consola del backend)
    console.error('ERROR 💥', err);

    // Unknown error
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }

  // Rendered website
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }

  // Log the error
  console.error('ERROR 💥', err);

  // Unknown error (mostrar mensaje genérico al usuario)
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.',
  });
};

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = Object.keys(err.keyValue)[0];
  console.log(value);
  const message = `Duplicate field value: "${value}". Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  // console.log(errors);
  // const message = `Invalid input data. ${errors.join('. ')}`;
  //para mejor manipualcion en el frontend devolver mensajes
  const message = errors;
  return new AppError(message, 400);
};

const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401);
const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

const errorController = (err, req, res, next) => {
  // console.log(err.stack);
  err.statusCode = err.statusCode || 500; //por defecto 500
  err.status = err.status || 'error desde el controlador de errores';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    // console.log(err);
    let error = { ...err }; //para evitar modificar el objeto original
    error.message = err.message; //para que no se modifique el mensaje original
    // console.log(error);

    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};

module.exports = {
  errorController,
};

// para importar es asi
// const { errorController } = require('./controllers/errorController');
