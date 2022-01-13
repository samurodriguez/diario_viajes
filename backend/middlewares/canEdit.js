const getDB = require("../db");

const canEdit = async (req, res, next) => {
  let connection;
  try {
    connection = await getDB();

    const { id } = req.params;

    // controlo si el usuario logeado puede modificar la entry
    // controlar el usuario que creó la entry, si no es el mismo del token o admin --> error
    const [current] = await connection.query(
      `
        SELECT user_id
        FROM entries
        WHERE id=?
      `,
      [id]
    );

    if (
      current[0].user_id !== req.userAuth.id &&
      req.userAuth.role !== "admin"
    ) {
      // ERROR
      const error = new Error(
        "No tienes los permisos para editar esta entrada"
      );
      error.httpStatus = 401;
      throw error;
    }

    // Continuo en el siguiente middleware
    next();
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

module.exports = canEdit;
