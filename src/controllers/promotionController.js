require("dotenv").config();
const responseHandler = require("../helpers/responseHandler");
const Promotion = require("../models/promotions");
const { EditPromotionSchema } = require("../validation");
const handleFileUpload = require("../utils/fileHandler");
const deleteFile = require("../helpers/deleteFiles");
const path = require("path");

/****************************************************************************************************/
/*                                    Function to create promotion                                  */
/****************************************************************************************************/

exports.createPromotion = async (req, res) => {
  const data = req.body;

  // Validate the input data
  // const { error } = EditPromotionSchema.validate(data, {
  //   abortEarly: true,
  // });
  // if (error)
  //   return responseHandler(res, 400, `Invalid input: ${error.message}`);

  if (data.type !== "banner") {
    const query = {
      type: data.type,
      startDate: data.startDate,
      endDate: data.endDate,
    };

    if (data.type === "video") {
      query.yt_link = data.yt_link;
      query.video_title = data.video_title;
    } else if (data.type === "notice") {
      query.notice_title = data.notice_title;
      query.notice_description = data.notice_description;
      query.notice_link = data.notice_link;
    }

    const promotionExist = await Promotion.findOne(query);

    // Check if a promotion with the same data already exists
    // const promotionExist = await Promotion.findOne({
    //     type: data.type,
    //     startDate: data.startDate,
    //     endDate: data.endDate,

    //     ...data.type === 'video' && {
    //         yt_link: data.yt_link,
    //         video_title: data.video_title,
    //     },
    //     ...data.type === 'notice' && {
    //         notice_title: data.notice_title,
    //         notice_description: data.notice_description,
    //         notice_link: data.notice_link
    //     }
    // });

    if (promotionExist)
      return responseHandler(res, 400, "Promotion already exists");
  }

  let banner_image_url = "";
  let upload_video = "";
  let poster_image_url = "";

  if (data.type === "banner") {
    banner_image_url = req.body.file_url;
  } else if (data.type === "video") {
    upload_video = await req.body.file_url;
  } else if (data.type === "poster") {
    poster_image_url = await req.body.file_url;
  }

  // Create a new promotion
  const newPromotion = new Promotion({
    ...data,
    banner_image_url,
    upload_video,
    poster_image_url,
  });

  try {
    await newPromotion.save();
  } catch (err) {
    return responseHandler(res, 500, `Error adding promotion: ${err.message}`);
  }

  return responseHandler(
    res,
    201,
    "New promotion created successfully!",
    newPromotion
  );
};

/****************************************************************************************************/
/*                                    Function to edit promotion                                   */
/****************************************************************************************************/

exports.editPromotion = async (req, res) => {
  const { promotionId } = req.params;
  const data = req.body;

  if (!promotionId) return responseHandler(res, 400, "Invalid request");

  // Validate the input data
  const { error } = EditPromotionSchema.validate(data, {
    abortEarly: true,
  });
  if (error)
    return responseHandler(res, 400, `Invalid input: ${error.message}`);

  const promotion = await Promotion.findById(promotionId);

  if (!promotion) return responseHandler(res, 404, "Promotion not found");

  try {
    // Handle new file upload
    if (data.type === "banner") {
      req.body.banner_image_url = req.body.file_url;
    } else if (data.type === "video") {
      req.body.upload_video = req.body.file_url;
    } else if (data.type === "poster") {
      req.body.poster_image_url = req.body.file_url;
    }
  } catch (err) {
    return responseHandler(res, 500, `Error updating file: ${err.message}`);
  }

  try {
    const updatedPromotion = await Promotion.findByIdAndUpdate(
      promotionId,
      req.body,
      { new: true }
    );
    return responseHandler(
        res,
        200,
        "Promotion updated successfully!",
        updatedPromotion
      );
  } catch (err) {
    return responseHandler(
      res,
      500,
      `Error updating promotion: ${err.message}`
    );
  }
};

/****************************************************************************************************/
/*                                  Function to get all promotions                                  */
/****************************************************************************************************/

exports.getAllPromotions = async (req, res) => {
  const { pageNo = 1, limit = 10 } = req.query;
  const skipCount = limit * (pageNo - 1);

  const totalCount = await Promotion.countDocuments();
  const promotions = await Promotion.find()
    .skip(skipCount)
    .limit(limit)
    .sort({ createdAt: -1 })
    .lean();
  return responseHandler(
    res,
    200,
    "Promotions retrieved successfully",
    promotions,
    totalCount
  );
};

/****************************************************************************************************/
/*                              Function to get all promotions by type                              */
/****************************************************************************************************/

exports.getPromotionsByType = async (req, res) => {
  const { type } = req.params;
  const { pageNo = 1, limit = 10 } = req.query;
  const skipCount = limit * (pageNo - 1);
  const types = ["banner", "video", "poster", "notice"];

  // Validate the `type` parameter
  if (!type || !types.includes(type)) {
    return responseHandler(res, 400, "Invalid request");
  }

  try {
    // Retrieve promotions by type
    const totalCount = await Promotion.countDocuments({ type: type });
    const promotions = await Promotion.find({ type: type })
      .skip(skipCount)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();
    return responseHandler(
      res,
      200,
      "Promotions retrieved successfully",
      promotions,
      totalCount
    );
  } catch (err) {
    return responseHandler(res, 500, `Server error: ${err.message}`);
  }
};

/****************************************************************************************************/
/*                                Function to get promotion by id                                  */
/****************************************************************************************************/

exports.getPromotionById = async (req, res) => {
  const { promotionId } = req.params;

  if (!promotionId) return responseHandler(res, 400, "Invalid request");

  const promotion = await Promotion.findById(promotionId);

  if (!promotion) return responseHandler(res, 404, "Promotion not found");

  return responseHandler(
    res,
    200,
    "Promotion retrieved successfully",
    promotion
  );
};
/****************************************************************************************************/
/*                Function to get promotions by type and/or get promotion by id                     */
/****************************************************************************************************/

exports.getPromotionsByTypeAndId = async (req, res) => {
  const { type, promotionId } = req.params;
  const types = ["banner", "video", "poster", "notice"];

  // Validate the `type` parameter
  if (!type || !types.includes(type)) {
    return responseHandler(res, 400, "Invalid request: Invalid type parameter");
  }

  try {
    if (promotionId) {
      // If promotionId is provided, retrieve the promotion by ID and type
      const promotion = await Promotion.findOne({
        _id: promotionId,
        type: type,
      });
      if (!promotion) return responseHandler(res, 404, "Promotion not found");

      return responseHandler(
        res,
        200,
        "Promotion retrieved successfully",
        promotion
      );
    } else {
      // If promotionId is not provided, retrieve all promotions by type
      const promotions = await Promotion.find({ type: type });
      return responseHandler(
        res,
        200,
        "Promotions retrieved successfully",
        promotions
      );
    }
  } catch (err) {
    return responseHandler(res, 500, `Server error: ${err.message}`);
  }
};

/****************************************************************************************************/
/*                                  Function to delete promotion                                    */
/****************************************************************************************************/

exports.deletePromotion = async (req, res) => {
  const { promotionId } = req.params;

  if (!promotionId) return responseHandler(res, 400, "Invalid request");

  const promotion = await Promotion.findById(promotionId);

  if (!promotion) return responseHandler(res, 404, "Promotion not found");

  try {
    // Delete the associated file if it exists
    const bucketName = process.env.AWS_S3_BUCKET;
    if (promotion.type === "banner" && promotion.banner_image_url) {
      let oldImageKey = path.basename(promotion.banner_image_url);
      await deleteFile(bucketName, oldImageKey);
    } else if (promotion.type === "video" && promotion.upload_video) {
      let oldImageKey = path.basename(promotion.upload_video);
      await deleteFile(bucketName, oldImageKey);
    } else if (promotion.type === "poster" && promotion.poster_image_url) {
      let oldImageKey = path.basename(promotion.poster_image_url);
      await deleteFile(bucketName, oldImageKey);
    }
  } catch (err) {
    return responseHandler(res, 500, `Error deleting file: ${err.message}`);
  }

  try {
    await Promotion.findByIdAndDelete(promotionId);
  } catch (err) {
    return responseHandler(
      res,
      500,
      `Error deleting promotion: ${err.message}`
    );
  }

  return responseHandler(res, 200, "Promotion deleted successfully");
};
