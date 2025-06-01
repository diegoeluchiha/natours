const express = require('express');

const router = express.Router();
// 🌟 Importar controladores de usuarios
const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
  uploadsUserPhoto,
  resizeUserPhoto,
} = require('../controllers/userController');

const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
  restrictTo,
  logout,
} = require('../controllers/authController');

//🌟 Middleware para validar el id🌟
// router.param('id', (req, res, next, val) => {
//   console.log(`user id is: ${val}`);
//   next();
// });

// 🌟 rutas sin proteccion 🌟
//rutas para signup
router.route('/signup').post(signup);
router.route('/login').post(login);
router.route('/logout').get(logout);
//rutas pra recuperar contraseña
router.route('/forgotPassword').post(forgotPassword);
router.route('/resetPassword/:token').patch(resetPassword);

// 🌟 Rutas para usuarios autenticados 🌟
// Middleware para proteger las rutas después de la autenticación
router.use(protect);
router.route('/updatePassword').patch(updatePassword);
router.route('/me').get(getMe, getUser);
router.route('/updateMe').patch(uploadsUserPhoto, resizeUserPhoto, updateMe);
router.route('/deleteMe').delete(deleteMe);

// 🌟 Rutas para administradores 🌟
// Middleware para proteger las rutas de administradores
router.use(protect, restrictTo('admin'));
// 🌟 Rutas users 🌟
router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
