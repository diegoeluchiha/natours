/*eslint-disable*/
import { showAlert } from './alerts';
export const login = async (email, password) => {
  console.log(email, password);
  try {
    const res = await fetch('/api/v1/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    // Lanzamos un error si la respuesta es >= 400
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Ocurrió un error al iniciar sesión.');
    }

    // Mostrar mensaje de éxito
    showAlert('success', 'Inicio de sesión exitoso. Redirigiendo...');

    // Si todo salió bien
    window.setTimeout(() => {
      location.assign('/');
    }, 1500);
  } catch (err) {
    // Captura errores de red y errores manuales
    // alert(`Error: ${err.message}`);
    console.error('Error en login:', err);
    // Mostrar mensaje de error
    showAlert(
      'error',
      err.message || 'Error al iniciar sesión. Por favor, inténtelo de nuevo más tarde.',
    );
  }
};
