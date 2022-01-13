const getDB = require("../../db");

const example = async (req, res, next) => {
  let connection;
  try {
    connection = await getDB();

    // codigo ...

    res.send({
      status: "ok",
      message: "message",
      data: "data",
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

module.exports = example;
