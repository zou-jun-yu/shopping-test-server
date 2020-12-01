var axios = require("axios");
var express = require("express");
var router = express.Router();

const CategoryModel = require("../models/categories");
const { downloadImageToServer } = require("./downloadImageToServer");
const GoodsModel = require("../models/goods");

var router = express.Router();

//向唯品会网站请求少量数据以便测试本电商网站的功能
router.post("/", function generateData(req, res) {
  const { start, end } = req.body;
  let lv1Categories = [],
    cate_lv1 = null,
    lv3CategoriesUnhandle = [],
    offset = -1,
    goodsNowPrice = {},
    //保存所有将要下载的图片
    imagesWillDownload = {
      categoryImageCount: 0,
      goodsImageCount: 0,
      imagesGoodsCategory: [],
    };
  axios({
    url:
      "https://h5.vip.com/api/category/category/getSellingCategorys/?app_name=&app_version=&mobile_channel=&hierarchy_id=107&category_id=&warehouse=&mars_cid=&category_filter=&sale_for=&area_id=&from_url_go_api_switch=&preview_go_admin=&src=app&channel_id=&wap_id=mst_100013210&channel_name=&time=0&is_front=1&fdc_area_id=104104119&mobile_platform=2",
    method: "get",
    headers: {
      "user-agent":
        "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1",
    },
  })
    .then((response) => {
      //如果数据太多，可以截取某几个一级分类下的所有分类和商品
      cate_lv1 = response.data.data.cate_lv1.slice(start, end);
      return CategoryModel.insertMany(
        cate_lv1.map((lv1Element) => ({
          parentId: "0",
          categoryName: lv1Element.name,
        }))
      );
    })
    .then((lv1CategoriesFromdb) => {
      console.log(
        "已插入一级分类列表，个数为：" + lv1CategoriesFromdb.length
      );
      lv1Categories = lv1CategoriesFromdb;
      const reqPromises = cate_lv1.map((cate_lv1Element) =>
        axios({
          url: `https://h5.vip.com/api/category/category/getSellingCategorysChildren/?app_name=&app_version=&mobile_channel=&hierarchy_id=107&category_id=${cate_lv1Element.categoryId}&warehouse=&mars_cid=&category_filter=&sale_for=&area_id=&from_url_go_api_switch=&preview_go_admin=&src=app&channel_id=&wap_id=mst_100013210&channel_name=&time=0&is_front=1&fdc_area_id=104104119&mobile_platform=2`,
          method: "get",
          headers: {
            "user-agent":
              "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1",
          },
        })
      );
      return Promise.all(reqPromises);
    })
    //得到这些一级分类下的所有二级分类
    .then((lv2CategoriesResponse) => {
      let lv2CategoriesWillInsert = [];
      lv2CategoriesResponse.forEach(
        (lv2CategoryResponse, index1) => {
          const current_node =
            lv2CategoryResponse.data.data.current_node;
          current_node.children.forEach((lv2Element, index2) => {
            // if (index2 > 1) {
            //   //限制二级分类列表的元素个数
            //   return;
            // }
            offset++;
            lv2CategoriesWillInsert.push({
              parentId: lv1Categories[index1]._id,
              categoryName: lv2Element.name,
            });
            //lv2Element是一个二级分类对象，lv3Element是一个三级分类对象
            lv2Element.children.forEach((lv3Element, index3) => {
              const imageName = lv3Element.image.substring(
                lv3Element.image.lastIndexOf("/") + 1
              );
              // if (index3 > 1) {
              //   //限制三级分类列表的数量
              //   return;
              // }

              //三级分类数组中间状态，需要转换成最终的三级分类数组
              lv3CategoriesUnhandle.push({
                categoryName: lv3Element.name,
                categoryImage: imageName,
                categoryId: lv3Element.categoryId,
                offset,
              });
              imagesWillDownload.categoryImageCount++;
              imagesWillDownload.imagesGoodsCategory.push({
                imageUrl: lv3Element.image,
                imageName,
              });
            });
          });
        }
      );
      return CategoryModel.insertMany(lv2CategoriesWillInsert);
    })
    .then(async (lv2CategoriesFromdb) => {
      console.log(
        "已插入二级分类列表，个数为：" + lv2CategoriesFromdb.length
      );
      const lv3CategoriesWillInsert = [];
      const reqGoodsListPromises = [];
      for (let index = 0; index < lv3CategoriesUnhandle.length; index++) {
        const item = lv3CategoriesUnhandle[index];
        //最终要插入数据库的三级分类列表
        lv3CategoriesWillInsert.push({
          categoryName: item.categoryName,
          categoryImage: item.categoryImage,
          parentId: lv2CategoriesFromdb[item.offset]._id,
        });
        // if(index>5){return;} //访问频率控制
        let goodsListResponse;
        // const startTime = Date.now();
        // let randomInterval = Math.random() * 2000 + 1200;
        // if ((index + 1) % 21 === 0) {
        //   randomInterval = randomInterval + 110000;
        // }
        // while (Date.now() - startTime < randomInterval) {}
        // console.log(
        //   "此次请求间隔是" + ((Date.now() - startTime) / 1000).toFixed(2) + "秒"
        // );
        if (item.categoryId[0] !== "5") continue;
        console.log("发出个" + (index + 1) + "商品列表请求");
        //获取某个三级分类下的所有商品列表
        try {
          goodsListResponse = await axios({
            url:
              "https://mst.vip.com/dp/getData?pageId=10000287&componentId=2970&pageSize=30&abtId=2554&app_name=shop_wap&app_version=1.0&warehouse=VIP_NH&fdc_area_id=104104119&area_id=104104&api_key=8cec5243ade04ed3a02c5972bcda0d3f&mars_cid=1593158605734_5d7a44aa608375f02e66e9717f7231a2&total=300&ruleId=" +
              item.categoryId +
              "&dataSourceScene=MST_RULE_PRODUCT_RANK&serviceType=1&goodsQueryFields=goodsCorner,goodsSellTag,goodsStockTag,query4GoodsFav,query4Comment,goodsFallingTag&goodsFilterParamsJson=%7B%7D&topSalesList=&isWhiteListStyleId=true&time=0&is_front=1&mobile_platform=2",
            method: "get",
            headers: {
              "user-agent":
                "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1",
            },
          });
        } catch (err) {
          console.log(err);
          throw {
            message: "请求商品列表出错,此时的categoryId为：" + item.categoryId,
          };
        }
        if (goodsListResponse.data.data === undefined) continue;
        console.log("已收到第" + (index + 1) + "个商品列表响应");
        // 本来打算将各个axios返回的promise对象放到这个数组中然后用Promise.all()并发去请求的，但是为了限制请求速率，才使用了async和await。另外数组的forEach和map方法与async、await结合时有点问题，所以改用为for循环或者for-of循环。
        reqGoodsListPromises.push(goodsListResponse);
      }
      return Promise.all([
        CategoryModel.insertMany(lv3CategoriesWillInsert),
        ...reqGoodsListPromises,
      ]);
    })
    .then(
      async ([
        lv3CategoriesFromdb,
        ...goodsListResponseArray
      ]) => {
        console.log(
          "已插入三级分类列表，个数为：" + lv3CategoriesFromdb.length
        );
        // throw { message: "三级分类图片以及商品详情列表暂时不请求和下载" };
        let goodsDetailCount = 0;
        let reqGoodsDetailPromiseArrayArray = [];
        for (let goodsListResponse of goodsListResponseArray) {
          const randomStart = Math.floor(Math.random() * 20);
          const weightArray = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 3, 4, 5];
          const randomCount =
            weightArray[Math.floor(Math.random() * weightArray.length)];
          //限制每个三级分类列表下的商品个数。每个分类下的商品有300个，每次请求一个分类下的商品列表都返回默认30个商品简略信息的一个分页，这里默认从前30个随机抽取几个。
          let reqGoodsDetailPromiseArray = [];
          for (let goodsInfo of goodsListResponse.data.data.items.slice(
            randomStart,
            randomStart + randomCount
          )) {
            goodsDetailCount++;
            // return;
            goodsNowPrice[goodsInfo.goodsId] =
              goodsInfo.goodsPriceTag.salePrice;
            // const startTime = Date.now();
            // let randomInterval = Math.random() * 2000 + 1200;
            // if (goodsDetailCount % 21 === 0) {
            //   randomInterval = randomInterval + 110000;
            // }
            // while (Date.now() - startTime < randomInterval) {}
            // console.log(
            //   "此次请求间隔是" +
            //     ((Date.now() - startTime) / 1000).toFixed(2) +
            //     "秒"
            // );
            console.log("即将请求第" + goodsDetailCount + "个商品详情");
            let goodsDetailResponse;
            try {
              goodsDetailResponse = await axios({
                url:
                  "https://mapi.vip.com/vips-mobile/rest/shopping/wap/product/detail/v5?app_name=shop_wap&app_version=4.0&api_key=8cec5243ade04ed3a02c5972bcda0d3f&mobile_platform=2&source_app=yd_wap&warehouse=VIP_NH&fdc_area_id=104104119&province_id=104104&mars_cid=1593158605734_5d7a44aa608375f02e66e9717f7231a2&mobile_channel=mobiles-adp%3AC01V4m7ck2e4k6t0%3A%40_%401596258105569%3Amig_code%3A1025162%7C007025fda779d995e835%3Aac01qk9kx60cuhe6ecqc3fgjgro2eunr%7C%7C&standby_id=nature&brandId=0&productId=" +
                  goodsInfo.goodsId +
                  "&act=intro&price_fields=vipshopPrice%2CsaleSavePrice%2CspecialPrice%2CsalePriceTips%2CvipDiscount%2CpriceIconURL%2CpriceIconMsg%2Cmin_vipshop_price%2C%20max_vipshop_price%2Cmax_market_price%2C%20min_market_price%20%2Cpromotion_price_type%2Cpromotion_price%2Cpromotion_price_suff%2Cpromotion_price_tips&haitao_description_fields=descri_image%2Cbeauty_descri_image%2Ctext%2Cmobile_descri_image%2Cmobile_prompt_image&is_multicolor=1&is_get_TUV=1&kfVersion=1&device=3&priceScene=normal&functions=panelView%2Cproduct_comment%2Csku_price%2Cactive_price%2Cbrand_store_info%2Cluxury_info%2CnewBrandLogo%2Creduced_point_desc%2Cwh_transfer%2ChideOnlySize%2CshowReputation%2CatmospherePicture%2ChaitaoFinanceVip%2CbanInfo%2CextraDetailImages%2CvendorQa&is_get_pms_tips=1&highlightBgImgVer=1&commitmentVer=2&propsVer=1&supportSquare=1&longTitleVer=2&_=15962" +
                  Math.floor(Math.random() * 2000),
                method: "get",
                headers: {
                  "user-agent":
                    "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1",
                },
              });
            } catch (err) {
              throw { message: "请求商品详情出错" };
            }
            console.log("已收到第" + goodsDetailCount + "个商品详情响应");
            reqGoodsDetailPromiseArray.push(goodsDetailResponse);
          }
          reqGoodsDetailPromiseArrayArray.push(
            Promise.all(reqGoodsDetailPromiseArray)
          );
        }
        return Promise.all([
          lv3CategoriesFromdb,
          ...reqGoodsDetailPromiseArrayArray,
        ]);
      }
    )
    .then(([lv3CategoriesFromdb, ...goodsDetailResponseArrayArray]) => {
      console.log("请求商品详情成功");
      //得到所有商品详情并将它们转换成期望的格式然后，保存到数据库中
      let goodsDetailList = [];
      goodsDetailResponseArrayArray.forEach(
        (goodsDetailResponseArray, index) => {
          goodsDetailResponseArray.forEach((goodsDetailResponse) => {
            const goodsDetailOrigin = goodsDetailResponse.data.data.product;
            let previewImages = goodsDetailOrigin.previewImages;
            if (previewImages.length > 3) {
              previewImages.sort(function (a, b) {
                return Math.random() - 1;
              });
              previewImages = previewImages.slice(0, 3);
            }
            const goodsImages = previewImages.map((previewImage) => {
              const previewImageUrlSplits = previewImage.imageUrl.split("/");
              return previewImageUrlSplits[previewImageUrlSplits.length - 1];
            });
            goodsDetailList.push({
              goodsImages,
              goodsDescription:
                goodsDetailOrigin.pointDescribe || goodsDetailOrigin.title,
              categoryId: lv3CategoriesFromdb[index]._id,
              goodsName: goodsDetailOrigin.title,
              goodsAmount: Math.ceil(Math.random() * 60 + 30),
              marketPrice: goodsDetailOrigin.marketPrice,
              nowPrice: goodsNowPrice[goodsDetailOrigin.productIdStr],
              salesNumber: Math.floor(Math.random() * 161),
            });
            previewImages.forEach((previewImage, index) => {
              imagesWillDownload.goodsImageCount++;
              imagesWillDownload.imagesGoodsCategory.push({
                imageUrl:
                  "http://h2a.appsimg.com/a.appsimg.com" +
                  previewImage.imageUrl,
                imageName: goodsImages[index],
              });
            });
          });
        }
      );
      console.log("商品详情总数量是: " + goodsDetailList.length);
      // throw {message:"此处停下来查看商品数量，还没有开始下载图片"};
      return GoodsModel.insertMany(goodsDetailList);
    })
    .then(async (goodsDetailListFromdb) => {
      //开始下载所有三级分类图片和商品详情图片
      console.log("一共插入" + goodsDetailListFromdb.length + "种商品");
      console.log(
        "分类图片一共" + imagesWillDownload.categoryImageCount + "张"
      );
      console.log("商品图片一共" + imagesWillDownload.goodsImageCount + "张");
      const totalImagesCount = imagesWillDownload.imagesGoodsCategory.length;
      console.log("即将开始下载所有图片。。。。。。。。。。。");
      try {
        for (var i = 0; i < totalImagesCount; i++) {
          const imageUrl = imagesWillDownload.imagesGoodsCategory[i].imageUrl;
          if (!imageUrl) continue;
          const msg = await downloadImageToServer({
            imageUrl,
            imageName: imagesWillDownload.imagesGoodsCategory[i].imageName,
          });
          console.log(
            msg +
              "，这是第" +
              (i + 1) +
              "张图片。" +
              "一共有" +
              totalImagesCount +
              "张图片，其中分类图片" +
              imagesWillDownload.categoryImageCount +
              "张，商品图片" +
              imagesWillDownload.goodsImageCount +
              "张。"
          );
          // const startTime = Date.now();
          // let randomInterval = Math.random() * 2000 + 1200;
          // if ((i + 1) % 20 === 0) {
          //   randomInterval = randomInterval + 110000;
          // }
          // while (Date.now() - startTime < randomInterval) {}
          // console.log(
          //   "此次请求间隔是" +
          //     ((Date.now() - startTime) / 1000).toFixed(2) +
          //     "秒"
          // );
        }
        res.send("商品详情总数为：" + goodsDetailListFromdb.length);
      } catch (err) {
        console.log(err);
        throw err;
      }
    })
    .catch((err) => {
      res.send(err.message);
    });
});

module.exports = router;
