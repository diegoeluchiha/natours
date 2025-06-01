/*eslint-disable*/
// console.log('Hello from index.js parcel');
import { displayMap } from './mapbox';
import { login } from './login';
import { logout } from './logout';
import { updateSettings } from './updateSettings';
import { bookTour } from './mercadopago';

/**
 * ===========================
 * 1. MAP DISPLAY
 * ===========================
 */
const mapBox = document.getElementById('map');
if (mapBox) {
  // Parse locations from data attribute and display map
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

/**
 * ===========================
 * 2. LOGIN FORM HANDLING
 * ===========================
 */
const loginForm = document.querySelector('.form--login');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // Get email and password values
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    // Call login function
    login(email, password);
  });
}

/**
 * ===========================
 * 3. LOGOUT BUTTON HANDLING
 * ===========================
 */
const logoutBtn = document.querySelector('.nav__el--logout');
if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}

/**
 * ===========================
 * 4. UPDATE USER DATA FORM
 * ===========================
 */
const userDataForm = document.querySelector('.form-user-data');
if (userDataForm) {
  userDataForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    // Create FormData object for multipart/form-data
    const form = new FormData();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const photo = document.getElementById('photo').files[0];

    form.append('name', name);
    form.append('email', email);
    form.append('photo', photo);

    // Update user settings
    const res = await updateSettings(form, 'data');

    // Update user name in navigation bar
    const userName = document.querySelector('.nav__user-name');
    if (userName && res.data.user) {
      const firstName = res.data.user.name.split(' ')[0];
      userName.textContent = firstName;
    }
  });
}

/**
 * ===========================
 * 5. UPDATE USER PASSWORD FORM
 * ===========================
 */
const userPasswordForm = document.querySelector('.form-user-password');
if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    // Indicate updating state
    document.querySelector('.btn--save-password').textContent = 'Updating...';
    // Get password fields
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    // Update password
    await updateSettings({ passwordCurrent, password, passwordConfirm }, 'password');
    // Reset button and fields
    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

/**
 * ===========================
 * 6. BOOKING A TOUR
 * ===========================
 */
const bookBtn = document.getElementById('book-tour');

if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    console.log(`Booking tour with ID: ${tourId}`);
    bookTour(tourId);
  });
}
