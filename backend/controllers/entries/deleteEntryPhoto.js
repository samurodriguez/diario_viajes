const getDB = require("../../db");
const { deletePhoto } = require("../../helpers");

const deleteEntryPhoto = async (req, res, next) => {
  let connection;
  try {
    connection = await getDB();

    const { id, photoID } = req.params;

    // seleciona la foto en la BD
    const [current] = await connection.query(
      `
        SELECT photo FROM entries_photos
        WHERE id=? AND entry_id=?
    `,
      [photoID, id]
    );

    // si no existe la foto devuelvo un error
    if (current.length === 0) {
      const error = new Error("La foto no existe");
      error.httpStatus = 404;
      throw error;
    }

    // borrar la foto del disco
    //console.log(current[0].photo);
    await deletePhoto(current[0].photo);

    // borrar la foto de la BD
    await connection.query(
      `
          DELETE FROM entries_photos
          WHERE id=? AND entry_id=?
      `,
      [photoID, id]
    );

    res.send({
      status: "ok",
      message: "Foto borrada",
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

module.exports = deleteEntryPhoto;
