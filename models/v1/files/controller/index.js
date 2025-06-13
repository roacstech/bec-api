const Joi = require("joi");
const s3 = require("../../../../config/s3");
const service = require("../service/index");

module.exports.uploadFile = async (req, res) => {
  try {
    const userid = req.headers["userid"];
    // const roleid = req.headers["roleid"];

    const result = {
      ...req.body,
      userid,
      // roleid,
    };

    const schema = Joi.object({
      userid: Joi.number().required().messages({
        "any.required": "User ID is required",
        "number.base": "User ID must be a number",
      }),
      fileurl: Joi.string().required().messages({
        "any.required": "File Url is required",
        "string.base": "File Url must be a string",
      }),
      filetype: Joi.string().required().messages({
        "any.required": "File type is required",
        "string.base": "File type must be a string",
      }),
      filename: Joi.string().required().messages({
        "any.required": "File name is required",
        "string.base": "File name must be a string",
      }),
    }).required();

    const { error } = schema.validate(result);
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0]?.message || "Validation error",
      });
    }

    const response = await service.uploadFile(result);
    return res.status(response.code).send({
      status: response.status,
      message: response.message,
    });
  } catch (error) {
    console.log("error", error);
  }
  return res.send({
    status: false,
    message: "Failed to add file url",
  });
};

module.exports.getFile = async (req, res) => {
  try {
    const userid = req.headers["userid"];
    // const roleid = req.headers["roleid"];

    const result = {
      ...req.body,
      userid,
      // roleid,
    };

    const schema = Joi.object({
      userid: Joi.number().required().messages({
        "any.required": "User ID is required",
        "number.base": "User ID must be a number",
      }),
    }).required();

    const { error } = schema.validate(result);
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0]?.message || "Validation error",
        response: [],
      });
    }

    const response = await service.getFile(result);
    return res.status(response.code).send({
      status: response.status,
      message: response.message,
      response: response.response,
    });
  } catch (error) {
    console.log("error", error);
  }
  return res.send({
    status: false,
    message: "Failed to get files",
  });
};
