var md5 = require("blueimp-md5");
var { Email, createToken } = require("../untils/config");
var UserModel = require("../models/users");

//登录
var login = async (req, res, next) => {
  var { username, password } = req.body;
  UserModel.find({ username, password: md5(password) })
    .then((data) => {
      if (data.length > 0) {
        if (username === "admin") {
          //登录的是管理员
          var token = createToken({ login: true, username });
          res.send({ msg: "登录成功", status: 0, data: { token } });
          return;
        }
        //登录的是客户
        req.session.username = username;
        res.send({ msg: "登录成功", status: 0, data: { username } });
      } else {
        res.send({ msg: "用户名或密码不正确", status: -1 });
      }
    })
    .catch((err) => {
      res.send({ msg: "内部错误", status: -2, err });
    });
};

//登出
var logout = async (req, res, next) => {
  req.session.username = "";
  req.session.cookie.expires = new Date(0);
  res.send({
    msg: "退出成功",
    status: 0,
  });
};

//注册
var register = async (req, res, next) => {
  var { username, password, email, verify } = req.body;
  if (email != req.session.email || verify != req.session.verify) {
    res.send({
      msg: "验证码错误",
      status: -1,
    });
  } else {
    UserModel.insertMany({
      username,
      password: md5(password),
      email,
    })
      .then(() => {
        req.session.verify = "";
        req.session.cookie.expires = new Date(0);
        res.send({
          msg: "注册成功",
          status: 0,
        });
      })
      .catch((err) => {
        res.send({
          msg: "注册失败,用户名或邮箱名已被注册",
          status: -2,
        });
      });
  }
};

//获取验证码
var verify = async (req, res, next) => {
  var email = req.query.email;
  var verify = Email.verify;
  req.session.verify = verify;
  req.session.email = email;
  var mailOptions = {
    from: "'来自opeadd的发送'<opeadd@163.com>",
    to: email,
    subject: "验证码 ",
    text: "您的验证码是：" + verify,
  };
  Email.transporter.sendMail(mailOptions, (err) => {
    if (!err) {
      res.send({
        msg: "验证码发送成功",
        status: 0,
      });
    } else {
      res.send({
        msg: "验证码发送失败",
        status: -1,
      });
    }
  });
};

//获取用户信息
var getUser = async (req, res, next) => {
  if (req.session.username) {
    res.send({
      msg: "获取用户信息成功",
      status: 0,
      data: {
        username: req.session.username,
      },
    });
  } else {
    res.send({
      msg: "获取用户信息失败",
      status: -1,
    });
  }
};

//忘记密码
var findPassword = async (req, res, next) => {
  var { email, verify, password } = req.body;
  if (email === req.session.email && verify === req.session.verify) {
    UserModel.update({ email }, { $set: { password: md5(password) } })
      .then(() => {
        res.send({
          msg: "修改密码成功",
          status: 0,
        });
      })
      .catch((err) => {
        res.send({
          msg: "修改密码失败",
          status: -1,
        });
      });
  } else {
    res.send({
      msg: "邮箱或者验证码不正确",
      status: -2,
    });
  }
};

module.exports = {
  login,
  register,
  logout,
  verify,
  getUser,
  findPassword,
};
