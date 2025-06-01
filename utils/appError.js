class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; //para saber si el error es de la app o no
    Error.captureStackTrace(this, this.constructor); //para que no muestre el error de la clase AppError
  }
}
module.exports = AppError;
