const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv'); //importamos dotenv
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

dotenv.config({ path: './config.env' }); //configuramos dotenv para que lea el archivo config.env
// console.log(app.get('env')); //para saber en que entorno estamos
// console.log(process.env);
// console.log(process.env);
// const DB = process.env.DATABASE_URL_ATLAS.replace('<db_password>', process.env.DATABASE_PASSWORD);
const DB = process.env.DATABASE_URL_LOCAL;

mongoose.connect(DB).then(() => {
  console.log('conexion exitosa para insercion de datos');
});

//READ FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

// 👉 Función para cerrar la conexión y salir del proceso
const closeDatabaseAndExit = async () => {
  await mongoose.connection.close();
  // console.log('Conexión a la base de datos cerrada.');
  process.exit(0);
};

const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log('Data successfully loaded!');
    // console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  await closeDatabaseAndExit();
};

//delete all data
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }

  await closeDatabaseAndExit();
};

// console.log(process.argv);
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
