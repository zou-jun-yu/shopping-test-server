var http = require("http");
var fs = require("fs");
var path = require("path");

var imageDirPath = path.join(__dirname, "..", "public/images/uploads");

module.exports.downloadImageToServer = function ({ imageUrl, imageName }) {
  return new Promise(function (resolve, reject) {
    imageUrl = imageUrl.replace("https","http");
    console.log("开始请求1张图片" + imageUrl);
    var req = http.get(imageUrl, function (res) {
      console.log("开始接收图片响应");
      var imgData = "";
      res.setEncoding("binary"); //一定要设置response的编码为binary,否则会导致下载下来的图片打不开。
      res.on("data", function (chunk) {        
        imgData += chunk;
        // console.log("收到图片部分数据");
      });
      res.on("end", function () {
        console.log("已收到1张完整图片");
        fs.writeFile(
          path.join(imageDirPath, imageName),
          imgData,
          "binary",
          function (err) {
            if (err) {
              console.log(err)
              reject("服务器端保存1张图片文件已失败");
            } else {
              resolve("服务器端保存1张图片文件已成功");
            }
          }
        );
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
