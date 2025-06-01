const crypto = require('crypto');
const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const bcrypt = require('bcrypt');
// const slugify = require('slugify');

//name email photo password passwordConfirm

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre es requerido'],
      trim: true, //esto es para quitar los espacios al principio y al final
      maxlength: [40, 'El nombre no puede tener mas de 40 caracteres'],
      minlength: [3, 'El nombre no puede tener menos de 3 caracteres'],
      //validar que no sea en blanco
      validate: {
        validator: function (val) {
          return val.trim().length > 0;
        },
        message: 'El nombre no puede estar vacío o solo con espacios.',
      },
    },
    email: {
      type: String,
      required: [true, 'El email es requerido'],
      unique: true,
      lowercase: true, //
      validate: {
        validator: function (val) {
          return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val);
        },
        message: 'Por favor ingrese un email valido',
      },
    },
    photo: {
      type: String,
      default: 'default.jpg',
    },
    role: {
      type: String,
      enum: ['user', 'guide', 'lead-guide', 'admin'],
      default: 'user',
    },
    password: {
      type: String,
      required: [true, 'La contraseña es requerida'],
      minlength: [8, 'La contraseña debe tener al menos 8 caracteres'],
      select: false, //esto es para que no se muestre la contraseña al hacer un find
    },
    passwordConfirm: {
      type: String,
      required: [true, 'La confirmacion de la contraseña es requerida'],
      validate: {
        //this only works on CREATE and SAVE!!! //solo funciona en CREATE y SAVE
        validator: function (val) {
          return val === this.password; //esto es para que la contraseña y la confirmacion sean iguales
        },
        message: 'Las contraseñas no son iguales',
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false, //esto es para que no se muestre el campo active al hacer un find
    },
  },
  { timestamps: true }, // //esto agrega los campos createdAt y updatedAt
); //esto agrega los campos createdAt y updatedAt

//hashear cotraseña
userSchema.pre('save', async function (next) {
  //solo si la contraseña fue modificada
  if (!this.isModified('password')) return next(); //si no fue modificada no hace nada

  // Evitar hashear una contraseña que ya está hasheada para el archivo de importación de usuarios
  const isAlreadyHashed = /^\$2[aby]\$\d{2}\$.{53}$/.test(this.password);
  if (isAlreadyHashed) {
    this.passwordConfirm = undefined;
    return next();
  }

  //esto es para hashear la contraseña
  this.password = await bcrypt.hash(this.password, 12); //esto hashea la contraseña
  this.passwordConfirm = undefined; //esto es para que no se guarde la contraseña confirmada
  next(); //esto es para que pase al siguiente middleware
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});
//metodo para comparar contraseñas
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  // if (!candidatePassword || !userPassword) return false;
  return await bcrypt.compare(candidatePassword, userPassword); //esto compara la contraseña ingresada con la contraseña guardada
};

//metodo para cambiar la contraseña
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  //si no existe la contraseña no se ha cambiado
  if (this.passwordChangedAt) {
    // console.log(this.passwordChangedAt, JWTTimestamp);
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10); //esto convierte la fecha a segundos
    // console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp; //esto compara la fecha de la contraseña con el token
  }
  //si no existe la contraseña no se ha cambiado
  return false; //esto es para que no se cambie la contraseña
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // Token expires in 10 minutes

  // console.log('Password reset token:', resetToken);
  // console.log('Password reset token (hashed):', this.passwordResetToken);
  // console.log('Password reset token expires at:', new Date(this.passwordResetExpires));

  return resetToken;
};

userSchema.pre(/^find/, function (next) {
  //this points to the current query
  this.find({ active: { $ne: false } }); //esto es para que no se muestren los usuarios eliminados
  next();
});

const User = model('User', userSchema); //esto crea el modelo de mongoose

module.exports = User; //esto exporta el modelo de mongoose
