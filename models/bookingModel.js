const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const bookingSchema = new Schema({
  tour: {
    type: Schema.Types.ObjectId,
    ref: 'Tour',
    required: [true, 'Tour is required'],
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
  },
  price: {
    type: Number,
    required: true,
  },
  paid: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Populate the tour and user fields when querying bookings
// Este middleware hace que, al consultar los documentos de Booking, se llenen automáticamente los campos 'tour' y 'user' con los datos referenciados.
bookingSchema.pre(/^find/, function (next) {
  this.populate('tour').populate('user');
  next();
});

const Booking = model('Booking', bookingSchema);
module.exports = Booking;
