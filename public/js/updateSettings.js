/*eslint-disable*/
import { showAlert } from './alerts';

//type is password or data
export const updateSettings = async (data, type) => {
  // console.log(email, password);
  try {
    const url = type === 'password' ? '/api/v1/users/updatePassword' : '/api/v1/users/updateMe';
    const options = {
      method: 'PATCH',
    };

    if (type === 'password') {
      // Enviamos JSON
      options.headers = {
        'Content-Type': 'application/json',
      };
      options.body = JSON.stringify(data); // Convertimos a JSON
    } else {
      // Enviamos FormData (por ejemplo, con imagen)
      options.body = data;
    }

    const res = await fetch(url, options);

    // Lanzamos un error si la respuesta es >= 400
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Ocurrió un error al actualizar los datos.');
    }

    // Mostrar mensaje de éxito
    const msgAlert =
      type === 'password'
        ? 'Contraseña actualizada correctamente.'
        : 'Datos actualizados correctamente.';
    showAlert('success', msgAlert);

    //devolver con return para que se pueda usar en el index.js
    return res.json();
  } catch (err) {
    // Captura errores de red y errores manuales
    // alert(`Error: ${err.message}`);
    console.error('Error en updateMe:', err);
    // Mostrar mensaje de error
    showAlert(
      'error',
      err.message || 'Error al actualizar los datos. Por favor, inténtelo de nuevo más tarde.',
    );
  }
};
