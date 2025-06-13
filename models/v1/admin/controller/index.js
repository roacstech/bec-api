const _ = require("lodash");
const Joi = require("joi");
const service = require("../service/index");
const { status } = require("express/lib/response");

module.exports.createAdmin = async (req, res) => {
  try {
    const tenantid = req.headers.tenantid;

    const result = {
      tenantid: tenantid,
      ...req.body,
    };
    const response = await service.createAdmin(result);

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
    });
  } catch (error) {
    console.log("error", error);

    return res.send({
      status: false,
      message: "Internal server error!",
    });
  }
};

module.exports.editAdmin = async (req, res) => {
  try {
    const response = await service.editAdmin(req.body);

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
    });
  } catch (error) {
    console.log("error", error);

    return res.send({
      status: false,
      message: "Internal server error!",
    });
  }
};

module.exports.getAdmin = async (req, res) => {
  try {
    // Joi validation schema
    const schema = Joi.object({
      adminid: Joi.number().optional(),
    });

    // Validate input
    const { error, value } = schema.validate(req.body);

    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0].message,
      });
    }

    const { adminid } = value;

    const response = await service.getAdmin(adminid);

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
      response: response.response,
    });
  } catch (error) {
    console.error("Controller error:", error);
    return res.status(500).send({
      status: false,
      message: "Internal server error!",
    });
  }
};

module.exports.updateAdminStatus = async (req, res) => {
  try {
    const response = await service.updateAdminStatus(req.body);

    return res.status(response.code || 500).json({
      status: response.status || false,
      message: response.message || "Something went wrong!",
      data: response.data || null,
    });
  } catch (error) {
    console.error("Error in updateAdminStatus controller:", error);

    return res.status(500).json({
      status: false,
      message: "Internal server error!",
    });
  }
};
