const getDB = require("../../db");
const { deletePhoto } = require("../../helpers");

const deleteEntry = async (req, res, next) => {
  let connection;
  try {
    connection = await getDB();

    const { id } = req.params;

    // Seleciono las fotos relacionadas con este ID
    const [photos] = await connection.query(
      `
      SELECT photo FROM entries_photos WHERE entry_id=?
    `,
      [id]
    );

    // borro las tuplas en la tabla entries_photos
    await connection.query(
      `
      DELETE FROM entries_photos WHERE entry_id=?
    `,
      [id]
    );

    // borro las immagenes desde el disco
    for (const photo of photos) {
      console.log(photo.photo);
      await deletePhoto(photo.photo);
    }

    // borro los votos
    await connection.query(
      `
      DELETE FROM entries_votes WHERE entry_id=?
    `,
      [id]
    );

    // borro la entry!!!!!
    await connection.query(
      `
      DELETE FROM entries WHERE id=?
    `,
      [id]
    );

    res.send({
      status: "ok",
      message: `La entrada con id=${id} y todos sus elementos relacionados fueron borrados`,
    });
  } catch (error) {
    // voy al middleware de los errores
    next(error);
  } finally {
    // libero la connexion
    if (connection) connection.release();
  }
};

module.exports = deleteEntry;
