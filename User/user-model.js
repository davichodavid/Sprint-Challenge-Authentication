const database = require("../database/dbConfig");

module.exports = {
  add,
  findById,
  find,
  findBy
};

function find() {
  return database("users").select("id", "username", "password");
}

function findBy(filter) {
  return database("users").where(filter);
}

function add(user) {
  return database("users")
    .insert(user, "id")
    .then(ids => {
      const [id] = ids;
      return findById(id);
    });
}

function findById(id) {
  return database("users")
    .where({ id })
    .first();
}
