const getDB = require("../../db");

const editUserPassword = async (req, res, next) => {
  let connection;
  try {
    connection = await getDB();

    const { id } = req.params;

    const { oldPassword, newPassword } = req.body;

    // comprobar que el usuario que quiero modificar es lo que hace login
    if (req.userAuth.id !== Number(id)) {
      const error = new Error("No puedes cambiar la password de otro usuario");
      error.httpStatus = 403;
      throw error;
    }

    // controlar que la antigua password sea correcta
    const [current] = await connection.query(
      `
      SELECT id
      FROM users
      WHERE id=? AND password=SHA2(?,512)
    `,
      [id, oldPassword]
    );

    if (current.length === 0) {
      const error = new Error("La contraseña antigua no es correcta");
      error.httpStatus = 401;
      throw error;
    }

    // guardamos en el DB la nueva password
    await connection.query(
      `
      UPDATE users
      SET password=SHA2(?,512), lastAuthUpdate=?
      WHERE id=?
    `,
      [newPassword, new Date(), id]
    );

    res.send({
      status: "ok",
      message: "Contraseña cambiada",
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

module.exports = editUserPassword;
