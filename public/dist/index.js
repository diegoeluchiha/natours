// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

(function (
  modules,
  entry,
  mainEntry,
  parcelRequireName,
  externals,
  distDir,
  publicUrl,
  devServer
) {
  /* eslint-disable no-undef */
  var globalObject =
    typeof globalThis !== 'undefined'
      ? globalThis
      : typeof self !== 'undefined'
      ? self
      : typeof window !== 'undefined'
      ? window
      : typeof global !== 'undefined'
      ? global
      : {};
  /* eslint-enable no-undef */

  // Save the require from previous bundle to this closure if any
  var previousRequire =
    typeof globalObject[parcelRequireName] === 'function' &&
    globalObject[parcelRequireName];

  var importMap = previousRequire.i || {};
  var cache = previousRequire.cache || {};
  // Do not use `require` to prevent Webpack from trying to bundle this call
  var nodeRequire =
    typeof module !== 'undefined' &&
    typeof module.require === 'function' &&
    module.require.bind(module);

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        if (externals[name]) {
          return externals[name];
        }
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire =
          typeof globalObject[parcelRequireName] === 'function' &&
          globalObject[parcelRequireName];
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error("Cannot find module '" + name + "'");
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = (cache[name] = new newRequire.Module(name));

      modules[name][0].call(
        module.exports,
        localRequire,
        module,
        module.exports,
        globalObject
      );
    }

    return cache[name].exports;

    function localRequire(x) {
      var res = localRequire.resolve(x);
      return res === false ? {} : newRequire(res);
    }

    function resolve(x) {
      var id = modules[name][1][x];
      return id != null ? id : x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.require = nodeRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.distDir = distDir;
  newRequire.publicUrl = publicUrl;
  newRequire.devServer = devServer;
  newRequire.i = importMap;
  newRequire.register = function (id, exports) {
    modules[id] = [
      function (require, module) {
        module.exports = exports;
      },
      {},
    ];
  };

  // Only insert newRequire.load when it is actually used.
  // The code in this file is linted against ES5, so dynamic import is not allowed.
  // INSERT_LOAD_HERE

  Object.defineProperty(newRequire, 'root', {
    get: function () {
      return globalObject[parcelRequireName];
    },
  });

  globalObject[parcelRequireName] = newRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (mainEntry) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(mainEntry);

    // CommonJS
    if (typeof exports === 'object' && typeof module !== 'undefined') {
      module.exports = mainExports;

      // RequireJS
    } else if (typeof define === 'function' && define.amd) {
      define(function () {
        return mainExports;
      });
    }
  }
})({"f2QDv":[function(require,module,exports,__globalThis) {
/*eslint-disable*/ // console.log('Hello from index.js parcel');
var _mapbox = require("./mapbox");
var _login = require("./login");
var _logout = require("./logout");
var _updateSettings = require("./updateSettings");
var _mercadopago = require("./mercadopago");
/**
 * ===========================
 * 1. MAP DISPLAY
 * ===========================
 */ const mapBox = document.getElementById('map');
if (mapBox) {
    // Parse locations from data attribute and display map
    const locations = JSON.parse(mapBox.dataset.locations);
    (0, _mapbox.displayMap)(locations);
}
/**
 * ===========================
 * 2. LOGIN FORM HANDLING
 * ===========================
 */ const loginForm = document.querySelector('.form--login');
if (loginForm) loginForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    // Get email and password values
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    // Call login function
    (0, _login.login)(email, password);
});
/**
 * ===========================
 * 3. LOGOUT BUTTON HANDLING
 * ===========================
 */ const logoutBtn = document.querySelector('.nav__el--logout');
if (logoutBtn) logoutBtn.addEventListener('click', (0, _logout.logout));
/**
 * ===========================
 * 4. UPDATE USER DATA FORM
 * ===========================
 */ const userDataForm = document.querySelector('.form-user-data');
if (userDataForm) userDataForm.addEventListener('submit', async (e)=>{
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
    const res = await (0, _updateSettings.updateSettings)(form, 'data');
    // Update user name in navigation bar
    const userName = document.querySelector('.nav__user-name');
    if (userName && res.data.user) {
        const firstName = res.data.user.name.split(' ')[0];
        userName.textContent = firstName;
    }
});
/**
 * ===========================
 * 5. UPDATE USER PASSWORD FORM
 * ===========================
 */ const userPasswordForm = document.querySelector('.form-user-password');
if (userPasswordForm) userPasswordForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    // Indicate updating state
    document.querySelector('.btn--save-password').textContent = 'Updating...';
    // Get password fields
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    // Update password
    await (0, _updateSettings.updateSettings)({
        passwordCurrent,
        password,
        passwordConfirm
    }, 'password');
    // Reset button and fields
    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
});
/**
 * ===========================
 * 6. BOOKING A TOUR
 * ===========================
 */ const bookBtn = document.getElementById('book-tour');
if (bookBtn) bookBtn.addEventListener('click', (e)=>{
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    console.log(`Booking tour with ID: ${tourId}`);
    (0, _mercadopago.bookTour)(tourId);
});

},{"./login":"7yHem","./mapbox":"3zDlz","./logout":"1ftRF","./updateSettings":"l3cGY","./mercadopago":"g4W5l"}],"7yHem":[function(require,module,exports,__globalThis) {
/*eslint-disable*/ var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "login", ()=>login);
var _alerts = require("./alerts");
const login = async (email, password)=>{
    console.log(email, password);
    try {
        const res = await fetch('/api/v1/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password
            })
        });
        // Lanzamos un error si la respuesta es >= 400
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Ocurri\xf3 un error al iniciar sesi\xf3n.");
        }
        // Mostrar mensaje de éxito
        (0, _alerts.showAlert)('success', "Inicio de sesi\xf3n exitoso. Redirigiendo...");
        // Si todo salió bien
        window.setTimeout(()=>{
            location.assign('/');
        }, 1500);
    } catch (err) {
        // Captura errores de red y errores manuales
        // alert(`Error: ${err.message}`);
        console.error('Error en login:', err);
        // Mostrar mensaje de error
        (0, _alerts.showAlert)('error', err.message || "Error al iniciar sesi\xf3n. Por favor, int\xe9ntelo de nuevo m\xe1s tarde.");
    }
};

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3","./alerts":"6Mcnf"}],"gkKU3":[function(require,module,exports,__globalThis) {
exports.interopDefault = function(a) {
    return a && a.__esModule ? a : {
        default: a
    };
};
exports.defineInteropFlag = function(a) {
    Object.defineProperty(a, '__esModule', {
        value: true
    });
};
exports.exportAll = function(source, dest) {
    Object.keys(source).forEach(function(key) {
        if (key === 'default' || key === '__esModule' || Object.prototype.hasOwnProperty.call(dest, key)) return;
        Object.defineProperty(dest, key, {
            enumerable: true,
            get: function() {
                return source[key];
            }
        });
    });
    return dest;
};
exports.export = function(dest, destName, get) {
    Object.defineProperty(dest, destName, {
        enumerable: true,
        get: get
    });
};

},{}],"6Mcnf":[function(require,module,exports,__globalThis) {
//type is success or error
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "hideAlert", ()=>hideAlert);
parcelHelpers.export(exports, "showAlert", ()=>showAlert);
const hideAlert = ()=>{
    const el = document.querySelector('.alert');
    if (el) el.parentElement.removeChild(el);
};
const showAlert = (type, msg)=>{
    hideAlert(); // Remove existing alert if any
    const markup = `<div class="alert alert--${type}">${msg}</div>`;
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
    window.setTimeout(hideAlert, 5000); // Remove alert after 5 seconds
};

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"3zDlz":[function(require,module,exports,__globalThis) {
/*eslint-disable*/ var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "displayMap", ()=>displayMap);
console.log('Mapbox script loaded');
const displayMap = (locations)=>{
    mapboxgl.accessToken = 'pk.eyJ1IjoiZGllZ28tbXAtYm94IiwiYSI6ImNtYTZ4aXlsMDB3bjIya3BvOHZla3I1MjAifQ.b6616SGWco2YPQ-a5FUb0A';
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/diego-mp-box/cma7ji7xl006o01sbaxyrh1vy',
        // center: [-74.5, 40], // starting position [lng, lat]
        // zoom: 10, // starting zoom
        // interactive: false,
        scrollZoom: false,
        // dragPan: false, // disable drag pan
        // dragRotate: false, // disable drag rotate
        // pitchWithRotate: false, // disable pitch with rotate
        // boxZoom: false, // disable box zoom
        //desactivar zoom al hacer doble click
        doubleClickZoom: false
    });
    //esto linea lo que hace es que el mapa se ajuste a los limites de los marcadores
    const bounds = new mapboxgl.LngLatBounds();
    locations.forEach((loc)=>{
        // Create marker
        const el = document.createElement('div');
        el.className = 'marker';
        // Add marker to map
        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
        }).setLngLat(loc.coordinates).addTo(map);
        // Add popup
        new mapboxgl.Popup({
            offset: 30
        }).setLngLat(loc.coordinates) // this is the location of the popup
        .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`) // this is the content of the popup
        .addTo(map); // this adds the popup to the map
        // Extend map bounds to include current location
        bounds.extend(loc.coordinates);
    });
    // Fit map to bounds
    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100
        }
    });
};

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"1ftRF":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "logout", ()=>logout);
var _alertsJs = require("./alerts.js");
const logout = async ()=>{
    try {
        const res = await fetch('/api/v1/users/logout', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        // Lanzamos un error si la respuesta es >= 400
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Ocurri\xf3 un error al cerrar sesi\xf3n.");
        }
        // Mostrar mensaje de éxito
        (0, _alertsJs.showAlert)('success', "Cierre de sesi\xf3n exitoso. Redirigiendo...");
        // Si todo salió bien
        window.setTimeout(()=>{
            location.assign('/');
        }, 1500);
    } catch (err) {
        // Captura errores de red y errores manuales
        console.error('Error en logout:', err);
        // Mostrar mensaje de error
        (0, _alertsJs.showAlert)('error', err.message || "Error al cerrar sesi\xf3n. Por favor, int\xe9ntelo de nuevo m\xe1s tarde.");
    }
};

},{"./alerts.js":"6Mcnf","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"l3cGY":[function(require,module,exports,__globalThis) {
/*eslint-disable*/ var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "updateSettings", ()=>updateSettings);
var _alerts = require("./alerts");
const updateSettings = async (data, type)=>{
    // console.log(email, password);
    try {
        const url = type === 'password' ? '/api/v1/users/updatePassword' : '/api/v1/users/updateMe';
        const options = {
            method: 'PATCH'
        };
        if (type === 'password') {
            // Enviamos JSON
            options.headers = {
                'Content-Type': 'application/json'
            };
            options.body = JSON.stringify(data); // Convertimos a JSON
        } else // Enviamos FormData (por ejemplo, con imagen)
        options.body = data;
        const res = await fetch(url, options);
        // Lanzamos un error si la respuesta es >= 400
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Ocurri\xf3 un error al actualizar los datos.");
        }
        // Mostrar mensaje de éxito
        const msgAlert = type === 'password' ? "Contrase\xf1a actualizada correctamente." : 'Datos actualizados correctamente.';
        (0, _alerts.showAlert)('success', msgAlert);
        //devolver con return para que se pueda usar en el index.js
        return res.json();
    } catch (err) {
        // Captura errores de red y errores manuales
        // alert(`Error: ${err.message}`);
        console.error('Error en updateMe:', err);
        // Mostrar mensaje de error
        (0, _alerts.showAlert)('error', err.message || "Error al actualizar los datos. Por favor, int\xe9ntelo de nuevo m\xe1s tarde.");
    }
};

},{"./alerts":"6Mcnf","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"g4W5l":[function(require,module,exports,__globalThis) {
//public/js/stripe.js
/* eslint-disable */ const bookTour = async (tourId)=>{
    try {
        // 1) Solicitar la URL de pago de Mercado Pago desde la API
        const response = await fetch(`/api/v1/bookings/create-preference/${tourId}`, {
            method: 'get',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const { data, status } = await response.json();
        console.log(data.init_point);
        if (status === 'success') // 2) Redirigir al usuario a la URL de pago de Mercado Pago
        window.location.href = data.init_point; // esta es la URL de Mercado Pago para el pago
        else alert('Error al crear la preferencia de pago');
    } catch (err) {
        console.log(err);
        alert('Error al procesar el pago');
    }
};
module.exports = {
    bookTour
};

},{}]},["f2QDv"], "f2QDv", "parcelRequire11c7", {})

//# sourceMappingURL=index.js.map
