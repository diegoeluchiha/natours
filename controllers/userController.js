// const mongoose = require('mongoose');
const multer = require('multer');
// const fs = require('fs'); //modulo para leer archivos
const { randomUUID } = require('crypto');
const sharp = require('sharp');
const User = require('../models/userModel');
// const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');
const factory = require('./handlerFactory');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users'); //donde se guardan las fotos
//   },
//   filename: (req, file, cb) => {
//     //cb(null, `user-${req.user.id}-${Date.now()}.jpeg`); //nombre de la foto
//     const ext = file.mimetype.split('/')[1]; //obtenemos la extension de la foto
//     cb(null, `user-${req.user.id}-${randomUUID()}.${ext}`); //nombre de la foto
//   },
// });

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

const uploadsUserPhoto = upload.single('photo'); //middleware para subir fotos de usuarios

const resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next(); //si no hay foto, no hacemos nada
  req.file.filename = `user-${req.user.id}-${randomUUID()}.jpeg`; //nombre de la foto

  await sharp(req.file.buffer)
    .resize(500, 500, {
      fit: sharp.fit.cover, //fit es para ajustar la imagen
      withoutEnlargement: true, //sin aumentar la imagen
      position: 'centre', //centro de la imagen
    })
    .toFormat('jpeg')
    .jpeg({ quality: 90 }) //convertimos la imagen a jpeg a 90% de calidad
    .toFile(`public/img/users/${req.file.filename}`); //guardamos la imagen en el servidor

  next(); //llamamos al siguiente middleware
});

// const fs = require('fs'); //modulo para leer archivosk
// 🌟 Callbacks de la rutad 🌟
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    // recorremos el objeto
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

const getMe = (req, res, next) => {
  req.params.id = req.user.id; //sobreescribimos el id del usuario
  next();
};

const updateMe = catchAsync(async (req, res, next) => {
  // console.log(req.file);
  // console.log(req.body);
  //1) create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError('This route is not for password updates. Please use /updateMyPassword', 400),
    );
  }

  //2 update user document
  //forma que no funcionaria por las valdiaciones
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename; //si hay foto, la guardamos en el objeto

  //eliminar la foto anterior
  // const user = await User.findById(req.user.id);
  // const photo = user.photo;
  // if (photo !== 'default.jpg') {
  //   fs.unlink(`public/img/users/${photo}`, (err) => {
  //     if (err) {
  //       console.error(err);
  //       return;
  //     }
  //     console.log('File deleted successfully');
  //   });
  // }
  const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updateUser,
    },
  });
});

const deleteMe = catchAsync(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: 'hola',
  });
});

const createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined. Please use /signup instead',
  });
};

const getAllUsers = factory.getAll(User); //el path es para que me traiga los reviews de la consulta
const getUser = factory.getOne(User); //getOne es un factory que me devuelve un usuario por id
//do not update password with this
const updateUser = factory.updateOne(User); //actualiza un usuario
const deleteUser = factory.deleteOne(User);

module.exports = {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
  uploadsUserPhoto,
  resizeUserPhoto,
};
