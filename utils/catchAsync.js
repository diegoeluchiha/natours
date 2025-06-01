const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => {
      next(err);
    });
  };
};

module.exports = {
  catchAsync,
};

//para importar es asi
// const { catchAsync } = require('./utils/catchAsync');
