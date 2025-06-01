import { showAlert } from './alerts.js';
export const logout = async () => {
  try {
    const res = await fetch('/api/v1/users/logout', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Lanzamos un error si la respuesta es >= 400
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Ocurrió un error al cerrar sesión.');
    }

    // Mostrar mensaje de éxito
    showAlert('success', 'Cierre de sesión exitoso. Redirigiendo...');

    // Si todo salió bien
    window.setTimeout(() => {
      location.assign('/');
    }, 1500);
  } catch (err) {
    // Captura errores de red y errores manuales
    console.error('Error en logout:', err);
    // Mostrar mensaje de error
    showAlert(
      'error',
      err.message || 'Error al cerrar sesión. Por favor, inténtelo de nuevo más tarde.',
    );
  }
};
