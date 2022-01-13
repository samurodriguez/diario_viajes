const getDB = require("../db");

const userExists = async (req, res, next) => {
  let connection;
  try {
    connection = await getDB();

    // saco el usuario desde la url
    const { id } = req.params;

    // saco la info del usuario
    const [user] = await connection.query(
      `
     SELECT id
     FROM users
     WHERE id=?
    `,
      [id]
    );

    if (!user[0]) {
      const error = new Error("El usuario no existe");
      error.httpStatus = 404;
      throw error;
    }

    next();
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

module.exports = userExists;
