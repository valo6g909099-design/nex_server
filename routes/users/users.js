const express = require("express");
const { login } = require("./login");
const { userCreate } = require("./create");
const { checkAuth } = require("./checkauth");
const router = express.Router();
const { logout } = require("./logout");
const {getApiKey} = require('./getApiKey')
router.get("/checkauth", checkAuth);
router.post("/login", login);
router.get("/logout", logout);
router.post("/create", userCreate);
router.get("/getApiKey", getApiKey);

module.exports = router;
