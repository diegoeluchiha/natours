const mongoose = require('mongoose');
const dotenv = require('dotenv'); //importamos dotenv

//excepciones no manejadas sincrona
process.on('uncaughtException', (err) => {
  console.log('Unhandled Exception! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' }); //configuramos dotenv para que lea el archivo config.env
const app = require('./app'); //importamos el archivo app.js

// console.log(app.get('env')); //para saber en que entorno estamos
// console.log(process.env);
// console.log(process.env);
// const DB = process.env.DATABASE_URL_ATLAS.replace('<db_password>', process.env.DATABASE_PASSWORD);
// const DB = process.env.DATABASE_URL_LOCAL;

const DB =
  process.env.NODE_ENV === 'production'
    ? process.env.DATABASE_URL_ATLAS
    : process.env.DATABASE_URL_LOCAL;

mongoose.connect(DB).then(() => {
  console.log('conexion exitosa');
  // console.log('debugger si');
});
// .catch((err) => {
//   console.log(err);
// });

const port = process.env.PORT || 3000; //definimos el puerto

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

//para manejar errores de promesas no manejadas
process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection! Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

//cerrar el servidor cuando se cierra el proceso
process.on('SIGTERM', () => {
  console.log('SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated!');
  });
});
