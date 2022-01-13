const getDB = require("../db");

const entryExists = async (req, res, next) => {
  let connection;
  try {
    connection = await getDB();

    const { id } = req.params;

    // comprobar si existe la entry
    const [current] = await connection.query(
      `
     SELECT id FROM entries WHERE id=?
     `,
      [id]
    );

    if (current.length === 0) {
      const error = new Error("No existe ninguna entrada con este id");
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

module.exports = entryExists;
