const fs = require("fs");
const path = require("path");

const { imageDirPath } = require("../untils/config");

//上传一张图片
async function uploadImage(req, res) {
  res.send({
    code: 0,
    msg: "图片上传成功",
    data: {
      src: imageDirPath + "/" + req.file.filename,
    },
  });
}

//删除一张图片
async function deleteUploadImage(req, res) {
  const { imageName } = req.body;
  fs.unlink(path.join(imageDirPath, imageName), (error) => {
    if (error) {
      res.send({ code: -1, msg: "删除商品图片失败", data: { error } });
    } else {
      res.send({ code: 0, msg: "删除商品图片成功", data: { imageName } });
    }
  });
}

module.exports = {
  uploadImage,
  deleteUploadImage,
};
