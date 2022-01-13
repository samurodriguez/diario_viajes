const getDB = require("../../db");
const { savePhoto, generateRandomString, sendMail } = require("../../helpers");

// dditar un usuario (name, email, avatar) | Solo el propio usuario
const editUser = async (req, res, next) => {
  let connection;
  try {
    connection = await getDB();

    // sacar el id del usuario que quiero editar (req.params)
    const { id } = req.params;

    // saco name, email desde el body
    const { name, email } = req.body;

    // comprobar que el usuario que quiero modificar es lo que hace login
    if (req.userAuth.id !== Number(id)) {
      const error = new Error("No puedes editar los datos de otro usuario");
      error.httpStatus = 403;
      throw error;
    }

    // saco el avatar
    if (req.files && req.files.avatar) {
      // guardo la imagen del avatar en static/upload
      const userAvatar = await savePhoto(req.files.avatar);
      // hago el update de la base de datos
      await connection.query("UPDATE users SET avatar=? WHERE id=?", [
        userAvatar,
        id,
      ]);
    }

    // leer los datos actuales del usuario
    const [currentUser] = await connection.query(
      `
        SELECT email
        FROM users
        WHERE id=?
    `,
      [id]
    );

    // si la email es distinta de la anterior
    if (email && email !== currentUser[0].email) {
      // comprobar si la nueva email ya existe en la tabla usuarios
      const [existingEmail] = await connection.query(
        `
        SELECT id
        FROM users
        WHERE email=?
      `,
        [email]
      );
      if (existingEmail.length > 0) {
        const error = new Error(
          "El correo electronico ya existe en la base de datos"
        );
        error.httpStatus = 409;
        throw error;
      }

      //   generar registration code
      const registrationCode = generateRandomString();

      // envio un correo con link de activacion:
      // http://127.0.0.1:3000/users/validate/sbdhfbud809urut9304
      const emailBody = `
         Cambiaste el correo electronico en diario de viajes.
         Pulsa aqui para validar tu usuario: ${process.env.PUBLIC_HOST}/users/validate/${registrationCode}
        `;

      sendMail({
        to: email,
        subject: "Activa tu usuario de diario de viajes",
        body: emailBody,
      });

      // actualizar los datos en el DB (active=0)
      await connection.query(
        `
                UPDATE users
                SET name=?, email=?, lastAuthUpdate=?, active=0, registrationCode=?
                WHERE id=?
            `,
        [name, email, new Date(), registrationCode, id]
      );

      res.send({
        status: "ok",
        message:
          "Usuario actualizado. Valida la nueva email desde el correo que hemos enviado",
      });
    } else {
      await connection.query(
        `
                UPDATE users
                SET name=?
                WHERE id=?
            `,
        [name, id]
      );

      res.send({
        status: "ok",
        message: "Usuario actualizado",
      });
    }
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

module.exports = editUser;
