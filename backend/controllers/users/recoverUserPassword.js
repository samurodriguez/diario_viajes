const getDB = require("../../db");
const { generateRandomString, sendMail } = require("../../helpers");

const recoverUserPassword = async (req, res, next) => {
  let connection;
  try {
    connection = await getDB();

    // sacamos el correo desde el body
    const { email } = req.body;

    // si no llega en el body el email salgo con error
    if (!email) {
      const error = new Error("Faltan campos");
      error.httpStatus = 400;
      throw error;
    }

    // comprobar que la email exista (usuario exista) en el DB
    const [currentEmail] = await connection.query(
      `
        SELECT id
        FROM users
        WHERE email=?
    `,
      [email]
    );

    if (currentEmail.length === 0) {
      const error = new Error("Ningun usuario registrado con esta email");
      error.httpStatus = 400;
      throw error;
    }

    // generamos un codigo de recuperación
    const recoverCode = generateRandomString();

    //guardarlo en la base de datos
    await connection.query(
      `
        UPDATE users
        SET recoverCode=?
        WHERE email=?
    `,
      [recoverCode, email]
    );

    // enviar el email
    const emailBody = `
      Se solicitó el cambio de contraseña en diario de viaje.
      El codigo de recuperación es: ${recoverCode}
      Si no fuiste tu a solicitar el cambio de la contraseña, por favor ignora este email.
      Gracias!
    `;

    sendMail({
      to: email,
      subject: "Cambio de contraseña de diario de viajes",
      body: emailBody,
    });

    // dar una respuesta al front
    res.send({
      status: "ok",
      message: "Email enviado",
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

module.exports = recoverUserPassword;
