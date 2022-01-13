const getDB = require("../../db");

const validateUser = async (req, res, next) => {
  let connection;
  try {
    connection = await getDB();

    const { registrationCode } = req.params;

    // comprobar que en la base de datos hay un usuario con este registrationCode
    const [user] = await connection.query(
      `
      SELECT id
      FROM users
      WHERE registrationCode=?
      `,
      [registrationCode]
    );

    if (user.length === 0) {
      const error = new Error(
        "No hay usuarios que tengan este registration code"
      );
      error.httpStatus = 404;
      throw error;
    }

    // activar el usuario y a quitarle el registration code
    await connection.query(
      `
      UPDATE users
      SET active=true, registrationCode=NULL
      WHERE registrationCode=?
    `,
      [registrationCode]
    );

    res.send({
      status: "ok",
      message: "Usuario validado",
      data: "data",
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

module.exports = validateUser;
