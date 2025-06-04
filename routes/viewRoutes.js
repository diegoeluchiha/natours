const express = require('express');
const {
  getOverview,
  getTour,
  getLogin,
  getRegister,
  getAccount,
  updateUserData,
  getMyTours,
  alerts,
} = require('../controllers/viewsController');
const { protect, isLoggedIn } = require('../controllers/authController');

const router = express.Router();

router.use(alerts); //middleware para las alertas de la app de lado del servidor
//rutas de la app de lado del servidor

// router.use(isLoggedIn); //middleware para saber si el usuario esta logueado o no
router.get('/', isLoggedIn, getOverview); //ruta para la app de lado del servidor
router.get('/tour/:slug', isLoggedIn, getTour); //ruta para la app de lado del servidor

router.get('/login', isLoggedIn, getLogin); //ruta para la app de lado del servidor
router.get('/register', isLoggedIn, getRegister); //ruta para la app de lado del servidor
router.get('/my-tours', protect, getMyTours); //ruta para la app de lado del servidor especificamente de los tours

// /submit-user-data
router.post('/submit-user-data', protect, updateUserData); //ruta para la app de lado del servidor

//proteger la ruta de la cuenta de la cache del navegador
router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});
router.get('/me', protect, getAccount); //ruta para la app de lado del servidor

//exportar el router
module.exports = router;
