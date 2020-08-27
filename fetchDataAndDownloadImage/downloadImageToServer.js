var http = require("http");
var fs = require("fs");
var path = require("path");

var imageDirPath = path.join(__dirname, "..", "public/images/uploads");

//向别的网站请求一张图片并保存到本服务器
module.exports.downloadImageToServer = function ({ imageUrl, imageName }) {
  return new Promise(function (resolve, reject) {
    imageUrl = imageUrl.replace("https", "http");
    console.log("开始请求1张图片" + imageUrl);
    var req = http.get(imageUrl, function (res) {
      console.log("开始接收图片响应");
      var imgData = "";
      res.setEncoding("binary");
      res.on("data", function (chunk) {
        imgData += chunk;
      });
      res.on("end", function () {
        console.log("已收到1张完整图片");
        if (!fs.existsSync(imageDirPath)) {
          fs.mkdir(imageDirPath, function (err) {
            if (err) {
              console.log(err);
              reject("创建图片文件夹失败");
            } else {
              fs.writeFile(
                path.join(imageDirPath, imageName),
                imgData,
                "binary",
                function (err) {
                  if (err) {
                    console.log(err);
                    reject("服务器端保存1张图片文件已失败");
                  } else {
                    resolve("服务器端保存1张图片文件已成功");
                  }
                }
              );
            }
          });
        } else {
          fs.writeFile(
            path.join(imageDirPath, imageName),
            imgData,
            "binary",
            function (err) {
              if (err) {
                console.log(err);
                reject("服务器端保存1张图片文件已失败");
              } else {
                resolve("服务器端保存1张图片文件已成功");
              }
            }
          );
        }
      });
      res.on("error", function (err) {
        reject("服务器端收到图片响应时发生错误");
      });
    });
    req.on("error", function (err) {
      reject("服务器请求图片失败" + err.message);
    });
  });
};
