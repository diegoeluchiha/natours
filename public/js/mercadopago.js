//public/js/stripe.js
/* eslint-disable */

const bookTour = async (tourId) => {
  try {
    // 1) Solicitar la URL de pago de Mercado Pago desde la API
    const response = await fetch(`/api/v1/bookings/create-preference/${tourId}`, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const { data, status } = await response.json();
    console.log(data.init_point);
    if (status === 'success') {
      // 2) Redirigir al usuario a la URL de pago de Mercado Pago
      window.location.href = data.init_point; // esta es la URL de Mercado Pago para el pago
    } else {
      alert('Error al crear la preferencia de pago');
    }
  } catch (err) {
    console.log(err);
    alert('Error al procesar el pago');
  }
};

module.exports = { bookTour };
