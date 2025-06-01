const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const slugify = require('slugify');
// const User = require('./userModel'); //para importar el modelo de usuario

//middleware de mongoose para proteger un campo createdAt

const tourSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre es requerido'],
      unique: true,
      trim: true, //
      maxlength: [40, 'El nombre no puede tener mas de 40 caracteres'],
      minlength: [10, 'El nombre no puede tener menos de 10 caracteres'],
      //mach con expression regular para permitir solo letras y espacios
      match: [/^[a-zA-Z ]+$/, 'El nombre solo puede contener letras y espacios'],
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Dificultad debe ser: easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'El rating debe ser mayor a 1.0'],
      max: [5, 'El rating debe ser menor a 5.0'],
      set: (val) => Math.round(val * 10) / 10, //esto es para redondear el rating a un decimal
    },
    ratingsQuantity: {
      //esto es para contar el numero de ratings
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'El precio es requerido'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        //this only works on CREATE and SAVE!!!
        validator: function (val) {
          return val < this.price; //esto es para que el descuento sea menor al precio
        },
        message: 'El descuento ({VALUE}) debe ser menor al precio',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'El precio es requerido'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'La imagen es requerida'],
    },
    images: {
      type: [String],
    },
    createdAt: {
      type: Date,
      default: Date.now,
      select: false,
    },
    startDates: {
      type: [Date], // Un array de fechas
    },
    slug: String,
    secretTour: {
      type: Boolean,
      default: undefined,
    },
    startLocation: {
      //Nested object
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true }, //para que muestre las propiedades virtuales
    toObject: { virtuals: true }, //para que muestre las propiedades virtuales
  },
);

tourSchema.index({ price: 1, ratingsAverage: -1 }); //esto es para crear un indice en la base de datos
tourSchema.index({ slug: 1 }); //esto es para crear un indice en la base de datos
tourSchema.index({ startLocation: '2dsphere' }); //esto es para crear un indice en la base de datos

//virtual property
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7; //esto es un getter
});

//virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour', // esto es para que se llame igual que el campo en el modelo de review
  localField: '_id', //esto bascimanete es el id del tour del campo de review
});

//middleware pre
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true }); //para que el slug sea en minusculas
  next();
});

//usando reference para guardar el id del guia
// tourSchema.pre('save', async function (next) {
//   const guidesProms = this.guides.map(async (id) => await User.findById(id)); //esto es para que guarde el id del guia
//   this.guides = await Promise.all(guidesProms); //esto es para que guarde el id del guia
//   next();
// });

//query middleware
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } }); //esto es para que no muestre los tours secretos
  this.start = Date.now(); //esto es para medir el tiempo de la consulta
  next();
});

// tourSchema.post(/^find/, function (docs, next) {
//   // console.log(docs);
//   // console.log(`Query took ${Date.now() - this.start} milliseconds!`);
//   next();
// });

//middleware para populate
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

//middleware para reviews
// tourSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: 'reviews',
//     select: 'review rating user',
//   });
//   next();
// });

//aggregation middleware
tourSchema.pre('aggregate', function (next) {
  // Si el pipeline empieza con $geoNear, no agregues el $match
  if (this.pipeline()[0] && this.pipeline()[0].$geoNear) {
    return next();
  }
  // Si no, agrega el filtro para tours secretos
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } }); //esto es para que no muestre los tours secretos
//   console.log(this.pipeline());
//   next();
// });

const Tour = model('Tour', tourSchema);

module.exports = Tour;

//para importarlo en el controller es
// const Tour = require('../models/tourModel');
