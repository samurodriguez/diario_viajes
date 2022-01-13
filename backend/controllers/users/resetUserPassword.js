const getDB = require("../../db");

const resetUserPassword = async (req, res, next) => {
  let connection;
  try {
    connection = await getDB();

    const { recovercode, newpassword } = req.body;

    // comprobar si existe en la base de datos un usuario con este recover code
    const [user] = await connection.query(
      `
            SELECT id
            FROM users
            WHERE recoverCode=?
        `,
      [recovercode]
    );

    if (user.length === 0) {
      const error = new Error("Codigo de activación no correcto");
      error.httpStatus = 404;
      throw error;
    }

    // guardar la nueva contraseña
    await connection.query(
      `
        UPDATE users
        SET password=SHA2(?,512), lastAuthUpdate=?, recoverCode=NULL
        WHERE id=?
        `,
      [newpassword, new Date(), user[0].id]
    );

    res.send({
      status: "ok",
      message: "Password cambiada",
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

module.exports = resetUserPassword;
