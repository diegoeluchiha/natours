//review //rating //createdAt //ref to tour //ref to user
const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const Tour = require('./tourModel');
// const slugify = require('slugify');

const reviewSchema = new Schema(
  {
    review: {
      type: String,
      required: [true, 'El review es requerido'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'El review debe estar asociado a un tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'El review debe estar asociado a un usuario'],
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }, //esto es para hbailitar propiedades virtuales
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true }); //un usuario solo puede dejar un review por tour

// reviewSchema.pre(/^find/, function (next) {
//   this.populate([
//     { path: 'tour', select: 'name' },
//     { path: 'user', select: 'name photo' },
//   ]);
//   next();
// });

reviewSchema.pre(/^find/, function (next) {
  this.populate([{ path: 'user', select: 'name photo' }]);
  next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }, //filtra por el tour
    },
    {
      $group: {
        // agrupa por el tour
        _id: '$tour',
        nRating: { $sum: 1 }, // cuenta el numero de reviews
        avgRating: { $avg: '$rating' }, // calcula el promedio de los ratings
      },
    },
    {
      $project: {
        _id: 0,
        tour: '$_id',
        nRating: 1,
        avgRating: { $round: ['$avgRating', 2] }, // redondea el promedio a 2 decimales
      },
    },
  ]);
  // console.log(stats);

  if (stats.length > 0) {
    //si hay stats significa que hay reviews
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating, //es el numero de reviews
      ratingsAverage: stats[0].avgRating, //es el promedio de los ratings
    });
  } else {
    //si no hay stats significa que no hay reviews
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5, // valor por defecto
    });
  }
};

// reviewSchema.pre('save', function (next) {
//   // this.constructor es el modelo Review
//   this.constructor.calcAverageRatings(this.tour);
//   next();
// });
reviewSchema.post('save', async function () {
  // this.constructor es el modelo Review
  await this.constructor.calcAverageRatings(this.tour);
});
//forma actulizada de mongoose
reviewSchema.post(/^findOneAnd/, async function (doc) {
  // `doc` points to the current review document
  if (doc) await doc.constructor.calcAverageRatings(doc.tour);
});

//updateOne y deleteOne forma de jonas de resolver el problema de la referencia circular
// reviewSchema.pre(/^findOneAnd/, async function (next) {
//   this.r = await this.clone().findOne(); // Clonamos para evitar error
//   next();
// });

// reviewSchema.post(/^findOneAnd/, async function () {
//   if (this.r) {
//     await this.r.constructor.calcAverageRatings(this.r.tour);
//   }
// });
const Review = model('Review', reviewSchema);

module.exports = Review;

//para importarlo en el controller es
// const Review = require('../models/reviewModel');
