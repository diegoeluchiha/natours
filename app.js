const path = require('path'); //modulo para manejar rutas
const express = require('express');
const morgan = require('morgan'); //middleware para loggear las peticiones
const rateLimit = require('express-rate-limit');
const helmet = require('helmet'); //middleware para proteger la app de ataques
const mongoSanitize = require('express-mongo-sanitize');
const sanitizeHtml = require('sanitize-html');
const hpp = require('hpp'); //middleware para proteger la app de ataques de HTTP param pollution
const cookieParser = require('cookie-parser'); //middleware para parsear las cookies
const compression = require('compression');

const AppError = require('./utils/appError');
const { errorController } = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');
//cookie parser

const app = express(); // create an express app
app.use(compression()); //middleware para comprimir las respuestas, mejora el rendimiento de la app
//proxy para ngrok
app.set('trust proxy', 1); //esto es para que express sepa que esta corriendo detrás de un proxy, como ngrok

app.set('view engine', 'pug'); //set the view engine to pug
app.set('views', path.join(__dirname, 'views'));

// app.set('views', `${__dirname}/views`); //set the views folder

// 🌟MIDDLEWARES 🌟
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '10kb' })); //middleware para parsear el body de las peticiones a json
app.use(express.urlencoded({ extended: true, limit: '10kb' })); //middleware para parsear el body de las peticiones a json
app.use(cookieParser()); //middleware para parsear las cookies

//Data sanitization against NoSQL query injection
app.use(mongoSanitize()); //middleware para proteger la app de ataques de inyeccion de NoSQL

// Data Sanitization Against XSS (Cross-Site-Scripting)
app.use((req, res, next) => {
  if (req.body) {
    // Sanitize each field in req.body
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeHtml(req.body[key], {
          allowedTags: [],
          allowedAttributes: {},
        });
      }
    }
  }
  if (req.query) {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeHtml(req.query[key], { allowedTags: [], allowedAttributes: {} });
      }
    }
  }
  if (req.params) {
    for (const key in req.params) {
      if (typeof req.params[key] === 'string') {
        req.params[key] = sanitizeHtml(req.params[key], { allowedTags: [], allowedAttributes: {} });
      }
    }
  }
  next();
});

//Prevent parameter pollution
app.use(
  hpp({
    whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty'], //parametros permitidos para la app
    // whitelist: [], //si no se pone nada se permite todo
    // whitelist: ['price'], //parametros permitidos para la app
    // whitelist: ['price', 'duration'], //parametros permitidos para la app
  }),
); //middleware para proteger la app de ataques de HTTP param pollution

//middleware para proteger la app de ataques
// app.use(helmet()); //middleware para proteger la app de ataques de tipo cross-site scripting
// // Configure the Content-Security-Policy header.
//
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        fontSrc: ["'self'", 'https:', 'data:'],
        scriptSrc: [
          "'self'",
          'https://api.mapbox.com',
          'https://cdnjs.cloudflare.com',
          'https://js.stripe.com',
        ],
        styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
        workerSrc: ["'self'", 'blob:'],
        objectSrc: ["'none'"],
        imgSrc: ["'self'", 'data:', 'blob:'],
        connectSrc: ["'self'", 'https://api.mapbox.com', 'https://events.mapbox.com'],
        frameSrc: ["'self'", 'https://js.stripe.com'],
      },
    },
  }),
);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
//middleware para limitar el número de peticiones por ip
const limiter = rateLimit({
  max: 100, //máximo de peticiones por ip
  windowMs: 60 * 60 * 1000, //1 hora
  message: 'Demasiadas peticiones desde esta IP, prueba más tarde',
});
app.use('/api', limiter); //aplicamos el middleware a todas las rutas que empiecen con /api

// Middleware para servir archivos estáticos
// app.use(express.static(`${__dirname}/public`)); //dirname para que no haya problemas con la ruta de los archivos estaticos en diferentes sistemas operativos//dirname para que no haya problemas con la ruta de los archivos estaticos en diferentes sistemas operativos
//son funciones que pueden modificar el objeto request y response
// app.use((req, res, next) => {
//   console.log('Hello from the middleware ❤❤❤❤❤❤');
//   next(); //next es para que pase al siguiente middleware
// });

app.use((req, res, next) => {
  // console.log(req.headers);
  req.requestTime = new Date().toLocaleString('es-ES', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',

    second: '2-digit',
  });
  // console.log(req.cookies);
  next();
});

//🌟forma normal de usar rutas🌟
// app.get('/api/v1/tours', getAllTours);

// app.get('/api/v1/tours/:id', getTour);

// app.post('/api/v1/tours', createTour);

// app.patch('/api/v1/tours/:id', updateTour);

// app.delete('/api/v1/tours/:id', deleteTour);

//rutas de la app
app.get('/payment-success', (req, res) => {
  res.send('Pago exitoso, gracias por tu compra!');
});

app.get('/payment-failure', (req, res) => {
  res.send('Pago fallido, intenta de nuevo.');
});

app.get('/payment-pending', (req, res) => {
  res.send('Pago pendiente, espera confirmación.');
});
app.use('/', viewRouter); //ruta para la app de lado del servidor
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

//🌟MIDDLEWARES DE MANEJO DE ERRORES 🌟
//middleware para manejar rutas no encontradas(404)
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `No se encontró la ruta: ${req.originalUrl}`,
  // });
  // const err = new Error(`No se encontró la ruta: ${req.originalUrl}`);
  // err.statusCode = 404;
  // err.status = 'fail';
  // next(err);

  next(new AppError(`No se encontró la ruta: ${req.originalUrl}`, 404));
});

//middleware para manejar errores globales
app.use(errorController);

module.exports = app;
