const getDB = require("../../db");
const { formatDateToDB } = require("../../helpers");
const { differenceInHours } = require("date-fns");

const modEntry = async (req, res, next) => {
  let connection;
  try {
    // creo la conexion al DB
    connection = await getDB();

    const { id } = req.params;

    // controlar el usuario que creó la entry, si no es el mismo del token o admin --> error
    const [current] = await connection.query(
      `
      SELECT date
      FROM entries
      WHERE id=?
    `,
      [id]
    );

    // comprobamos si pasaron más de 2 horas
    const difference = differenceInHours(new Date(), new Date(current[0].date));

    console.log(difference);

    if (
      difference > Number(process.env.MAX_HOURS_EDIT) &&
      req.userAuth.role !== "admin"
    ) {
      const error = new Error(
        `Pasaron más de ${process.env.MAX_HOURS_EDIT}, no puedes modificar la entrada`
      );
      error.httpStatus = 403;
      throw error;
    }

    // voy a leer los datos en el body
    const { place, description } = req.body;

    // compruebo los datos minimos
    if (!place) {
      const error = new Error("Faltan campos");
      error.httpStatus = 400;
      throw error;
    }
    const dateMod = new Date();
    await connection.query(
      `
      UPDATE entries SET date=?, place=?, description=? WHERE id=?
    `,
      [formatDateToDB(dateMod), place, description, id]
    );

    res.send({
      status: "ok",
      data: {
        id,
        dateMod,
        place,
        description,
      },
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

module.exports = modEntry;
