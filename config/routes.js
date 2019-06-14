const axios = require("axios");
const bcrypt = require("bcryptjs");
const Users = require("../User/user-model");
const jwt = require("jsonwebtoken");
const secrets = require("../secrets");
const { authenticate } = require("../auth/authenticate");

module.exports = server => {
  server.post("/api/register", register);
  server.post("/api/login", login);
  server.get("/api/jokes", authenticate, getJokes);
};

function register(req, res) {
  // implement user registration
  let user = req.body;
  const hash = bcrypt.hashSync(user.password, 12);
  user.password = hash;

  Users.add(user)
    .then(creds => res.status(201).json(creds))
    .catch(err => {
      res.status(500).json(err);
      console.log(err);
    });
}

function login(req, res) {
  // implement user login

  let { username, password } = req.body;

  Users.findBy({ username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        const token = generateToken(user);

        res
          .status(200)
          .json({ messge: `Welcome ${user.username}, have a cookie`, token });
      } else {
        res.status(401).json({ message: "Invalid Creds Bro" });
      }
    })
    .catch(err => {
      res.status(500).json(err);
      console.log(err);
    });
}

function getJokes(req, res) {
  const requestOptions = {
    headers: { accept: "application/json" }
  };

  axios
    .get("https://icanhazdadjoke.com/search", requestOptions)
    .then(response => {
      res.status(200).json(response.data.results);
    })
    .catch(err => {
      res.status(500).json({ message: "Error Fetching Jokes", error: err });
    });
}

function generateToken(user) {
  const payload = {
    subject: user.id,
    username: user.username
  };

  const options = {
    expiresIn: "4h"
  };

  return jwt.sign(payload, secrets.jwtSecret, options);
}
