var SERVER_BASE_URL = "http://localhost:5000";
var mongoose = require("mongoose");
var nodemailer = require("nodemailer");
var jwt = require("jsonwebtoken");

mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);

//连接数据库
var Mongoose = {
  url: "mongodb://localhost:27017/shoppingServer",
  connect() {
    mongoose.connect(this.url, (err) => {
      if (err) {
        console.log("数据库连接失败" + err);
        return;
      }
      console.log("数据库连接成功");
    });
  },
};

//邮箱验证码
var Email = {
  config: {
    host: "smtp.163.com",
    port: 465,
    secure: true,
    auth: {
      user: "opeadd@163.com",
      pass: "JUBMSUDZGUVSHKYF",
    },
  },
  get transporter() {
    return nodemailer.createTransport(this.config);
  },
  get verify() {
    return Math.random().toString().substring(2, 6);
  },
};

var secret = "ncadh32uhov128xgyzvuBUAIau3nvansfopwjihinv938DIOH";
//产生token
function createToken(payload) {
  payload.ctime = Date.now();
  payload.expired = 1000 * 60 * 60 * 24 * 7;
  return jwt.sign(payload, secret);
}

//验证token
function checkToken(token) {
  return new Promise(function (resolve, reject) {
    jwt.verify(token, secret, function (err, data) {
      if (err) {
        reject("token验证失败");
      } else {
        resolve(data);
      }
    });
  });
}

module.exports = {
  Mongoose,
  Email,
  createToken,
  checkToken,
  SERVER_BASE_URL,
};
