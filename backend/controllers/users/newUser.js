const getDB = require("../../db");
const { generateRandomString, sendMail, validate } = require("../../helpers");
const { newUserSchema } = require("../../schemas");

const newUser = async (req, res, next) => {
  let connection;
  try {
    connection = await getDB();

    const { email, password } = req.body;
    //console.log(email, password);

    // valido los datos del body
    await validate(newUserSchema, req.body);

    // compruebo que no exista en la base de datos un usuario con esta email
    const [existingUser] = await connection.query(
      `
      SELECT id
      FROM users
      WHERE email=?
    `,
      [email]
    );

    if (existingUser.length > 0) {
      const error = new Error("Ya existe un usuario con este mail");
      error.httpStatus = 409;
      throw error;
    }

    // genero un registrationCode (ej: sbdhfbud809urut9304)
    const registrationCode = generateRandomString();
    //console.log("registrationCode:", registrationCode);

    // añado el usuario a la base de datos (con registrationCode=sbdhfbud809urut9304)
    await connection.query(
      `
      INSERT INTO users(date,email,password,registrationCode)
      VALUES (?,?,SHA2(?, 512),?)
    `,
      [new Date(), email, password, registrationCode]
    );

    // envio un correo con link de activacion:
    // http://127.0.0.1:3000/users/validate/sbdhfbud809urut9304
    const emailBody = `
      Te acabas de registrar en diario de viajes.
      Pulsa aqui para validar tu usuario: ${process.env.PUBLIC_HOST}/users/validate/${registrationCode}
    `;

    sendMail({
      to: email,
      subject: "Activa tu usuario de diario de viajes",
      body: emailBody,
    });

    // mando una respuesta
    res.send({
      status: "ok",
      message: "Nuevo usuario creado. Comprueba tu correo para activarlo.",
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

module.exports = newUser;
