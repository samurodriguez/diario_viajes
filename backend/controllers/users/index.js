const loginUser = require("./loginUser");
const newUser = require("./newUser");
const validateUser = require("./validateUser");
const getUser = require("./getUser");
const deleteUser = require("./deleteUser");
const editUserPassword = require("./editUserPassword");
const editUser = require("./editUser");
const recoverUserPassword = require("./recoverUserPassword");
const resetUserPassword = require("./resetUserPassword");

module.exports = {
  loginUser,
  newUser,
  validateUser,
  getUser,
  deleteUser,
  editUserPassword,
  editUser,
  recoverUserPassword,
  resetUserPassword,
};
