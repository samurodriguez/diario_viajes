const getDB = require("../../db");

const deleteUser = async (req, res, next) => {
  let connection;
  try {
    connection = await getDB();

    // sacar el id usuario que queremos eliminar
    const { id } = req.params;

    console.log("ID usuario", id);

    // se el usuario que quiero borrar el el id=1 (admin) salgo con error
    if (Number(id) === 1) {
      const error = new Error("El administrador no se pude eliminar");
      error.httpStatus = 403;
      throw error;
    }

    // si no es admin o el usuario que quiero borrar no coincide con el usuario de login salgo con un error
    if (req.userAuth.role !== "admin" && req.userAuth.id !== Number(id)) {
      const error = new Error(
        "No tienes los permisos para eliminar este usuario"
      );
      error.httpStatus = 403;
      throw error;
    }

    // hacemos el borrado logico del usuario:
    // UPDATE: deleted = 1, password="[BORRADO]", name="[BORRADO]", avatar=NULL, active=0, lastAuthUpdate=new Date()
    await connection.query(
      `
        UPDATE users
        SET password="[BORRADO]", name="[BORRADO]", avatar=NULL, active=0, deleted=1, lastAuthUpdate=?
        WHERE id=?
    `,
      [new Date(), id]
    );

    res.send({
      status: "ok",
      message: `Usuario con id=${id} eliminado`,
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

module.exports = deleteUser;
