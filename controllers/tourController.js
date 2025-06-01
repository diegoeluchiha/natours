// const fs = require('fs'); //modulo para leer archivos
// const mongoose = require('mongoose');
const multer = require('multer');
const sharp = require('sharp');
// import { randomUUID } from 'crypto';
const { randomUUID } = require('crypto');
const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');
const factory = require('./handlerFactory');
// const { errorController } = require('./errorController');

const multerStorage = multer.memoryStorage(); //guardamos la foto en memoria

const multerFilter = (req, file, cb) => {
  //si el archivo no es una imagen
  if (file.mimetype.startsWith('image')) {
    cb(null, true); //si es una imagen
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false); //si no es una imagen
  }
};

// const uploadsUserPhoto = upload.single('photo'); //middleware para subir fotos de usuarios
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

//si fuera un archivo seria asi con single
// const uploadTourPhoto = upload.single('image'); //middleware para subir fotos de tours
//multiples archivos para un solo campo
// const uploadTourPhoto = upload.array('images', 3); //middleware para subir fotos de tours

const uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 }, //maxCount es para limitar el número de fotos
  { name: 'images', maxCount: 3 }, //maxCount es para limitar el número de fotos
]);

const resizeTourImages = catchAsync(async (req, res, next) => {
  const promises = [];

  // 1) Procesar imagen de portada
  if (req.files.imageCover) {
    req.body.imageCover = `tour-${req.params.id}-${randomUUID()}-cover.jpeg`;
    promises.push(
      sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${req.body.imageCover}`),
    );
  }

  // 2) Procesar imágenes adicionales
  if (req.files.images) {
    req.body.images = req.files.images.map((file, i) => {
      const filename = `tour-${req.params.id}-${randomUUID()}-${i + 1}.jpeg`;

      // Agregamos la promesa de procesamiento de imagen
      promises.push(
        sharp(file.buffer)
          .resize(2000, 1333)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(`public/img/tours/${filename}`),
      );

      // Retornamos el nombre del archivo para llenar req.body.images
      return filename;
    });
  }

  // 3) Esperamos que todas las imágenes terminen de procesarse
  await Promise.all(promises);

  next();
});

//*otras dos opciones disponibles serian: single y array
// const uploadTourImages = upload.single('imageCover'); //middleware para subir fotos de tours
// const uploadTourImages = upload.array('images', 3); //middleware para subir fotos de tours

// const toursData = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)); //lee el archivo tours-simple.json
const aliasTopTours = (req, res, next) => {
  req.query.sort = '-ratingsAverage,price';
  req.query.limit = '5';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

//🌟 Importar controladores de tours🌟
const getAllTours = factory.getAll(Tour); //el path es para que me traiga los reviews de la consulta

const getTour = factory.getOne(Tour, { path: 'reviews' }); //el path es para que me traiga los reviews de la consulta

const createTour = factory.createOne(Tour);

const updateTour = factory.updateOne(Tour);

const deleteTour = factory.deleteOne(Tour);

const getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    // {
    //   $match: { ratingsAverage: { $gte: 4.5 } }, // filtrar por rating
    // },
    {
      $group: {
        _id: '$difficulty', // agrupar por dificultad
        numTours: { $sum: 1 }, // contar el número de tours
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { maxPrice: 1 }, // ordenar por precio promedio
    },
    //podemos repetir el mach
    // {
    //   $match: { _id: { $ne: 'easy' } }, // filtrar por dificultad diciendo que no sea easy
    // },
  ]);

  if (!stats || stats.length === 0) {
    return next(new AppError('No statistics available', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

const getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; //2023
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates', //esto lo que hace es descomponer el array en varios documentos
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' }, // agrupar por mes
        numTourStarts: { $sum: 1 }, // contar el número de tours
        tours: { $push: '$name' }, // crear un array con los nombres de los tours
      },
    },
    {
      $addFields: { month: '$_id' }, // agregar el campo mes
    },
    {
      $project: {
        _id: 0, // eliminar el campo _id
      },
    },
    {
      $sort: { numTourStarts: -1 }, // ordenar por número de tours
    },
    {
      $limit: 2, // limitar a 12 resultados
    },
  ]);

  if (!plan || plan.length === 0) {
    return next(new AppError('No plan available for this year', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});

// router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(getToursWithin);
// /tours-within/233/center/34.11111, -118.11321/unit/mi
const getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(','); //destructuring para obtener la latitud y longitud

  if (!lat || !lng) {
    return next(new AppError('Please provide lat and lng in the format lat,lng', 400));
  }

  // console.log(distance, lat, lng, unit);

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1; //convertir a radianes
  // 3963.2 es el radio de la tierra en millas

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }, //esto es para buscar dentro de un radio
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

const getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(','); //destructuring para obtener la latitud y longitud

  if (!lat || !lng) {
    return next(new AppError('Please provide lat and lng in the format lat,lng', 400));
  }

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001; //convertir a millas o kilometros

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        //esto es para buscar dentro de un radio
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1], //convertir a numero
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier, //esto es para convertir a millas o kilometros
      },
    },
    {
      $project: {
        //esto es para mostrar solo los campos que queremos
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});

module.exports = {
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
};

//tipos de comentarios con better comments
//todo: esto es un comentario de tarea
//? esto es un comentario de pregunta
//! esto es un comentario de error
//* esto es un comentario de información
