const nodemailer = require('nodemailer');
const pug = require('pug');
const { htmlToText } = require('html-to-text');

// Definimos la clase Email
class Email {
  /**
   * El constructor se ejecuta al crear una nueva instancia de la clase Email.
   * @param {Object} user - El usuario al que se le enviará el correo.
   * @param {String} url - La URL que se incluirá en el contenido del correo.
   */
  constructor(user, url) {
    this.to = user.email; // Email del destinatario
    this.firstName = user.name.split(' ')[0]; // Extraemos el primer nombre del usuario
    this.url = url; // Guardamos la URL proporcionada (usualmente para enlaces en el correo)
    this.from = `Diego Ubilla <${process.env.EMAIL_FROM}>`;
  }

  /**
   * Crea y retorna un "transporter" de Nodemailer.
   * Este transporter es responsable de enviar el correo.
   */
  newTransport() {
    // Si estamos en producción, se debería usar SendGrid (o algún otro servicio profesional)
    if (process.env.NODE_ENV === 'production') {
      // Aquí debes configurar el transporte con SendGrid o similar
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST_PROD,
        port: process.env.EMAIL_PORT_PROD,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USERNAME_PROD, // generated ethereal user
          pass: process.env.EMAIL_PASSWORD_PROD, // generated ethereal password
        },
      });
    }

    // Transporte para desarrollo, usando las variables de entorno
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST_DEV, // Servidor SMTP
      port: process.env.EMAIL_PORT_DEV, // Puerto SMTP
      auth: {
        user: process.env.EMAIL_USERNAME_DEV, // Usuario de autenticación SMTP
        pass: process.env.EMAIL_PASSWORD_DEV, // Contraseña de autenticación SMTP
      },
    });
  }

  /**
   * Envía un correo utilizando una plantilla Pug.
   * **/

  async send(template, subject) {
    // 1. Renderizar el HTML basado en la plantilla Pug
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName, // Se pasa a la plantilla
      url: this.url, // Se pasa a la plantilla
      subject, // También se pasa a la plantilla
    });

    // 2. Definir las opciones del correo
    const mailOptions = {
      from: this.from, // Quien envía el email
      to: this.to, // Destinatario
      subject: subject, // Asunto del correo
      html: html, // Contenido HTML generado por Pug
      text: htmlToText(html), // Versión en texto plano (para clientes que no soportan HTML)
    };

    // 3. Crear el transporte y enviar el correo
    await this.newTransport().sendMail(mailOptions);
  }

  /**
   * Método específico para enviar un email de bienvenida.
   * Usa la plantilla 'welcome' y un asunto predefinido.
   */
  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }

  async sendPasswordReset() {
    await this.send('passwordReset', 'Your password reset token (valid for only 10 minutes)');
  }
}

// Exportamos la clase para poder usarla en otros archivos
module.exports = {
  Email,
};
