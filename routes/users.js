var express = require("express");
var router = express.Router();

var usersController = require("../controllers/users");

//用户相关的路由
router.post("/login", usersController.login);
router.get("/logout", usersController.logout);
router.post("/register", usersController.register);
router.get("/verify", usersController.verify);
router.get("/getUser", usersController.getUser);
router.post("/findPassword", usersController.findPassword);

module.exports = router;
