const service = require("../service/index");
const _ = require("lodash");
const Joi = require("joi");


//priority
module.exports.addPriority = async (req, res) => {
    try {
      const tenantid = req.headers["tenantid"];
      const userid = req.headers["userid"];
      const result = {
        ...req.body,
        tenantid,
        userid,
      };
  
      const schema = Joi.object({
        priorityname: Joi.string().required().messages({
          "any.required": "Priority name is required",
          "string.base": "Priority name must be a string",
        }),
        priorityimage: Joi.string().allow("").uri().messages({
          "string.base": "Priority image must be a string",
          "string.uri": "Priority image must be a valid URL",
        }),
        tenantid: Joi.number().required().messages({
          "any.required": "Tenant ID is required",
          "number.base": "Tenant ID must be a number",
        }),
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
        });
      }
  
      const response = await service.addPriority(result);
  
      if (
        !response ||
        typeof response.code !== "number" ||
        typeof response.status !== "boolean"
      ) {
        return res.status(500).send({
          status: false,
          message: "Unexpected error occurred while add priority",
        });
      }
  
      return res.status(response.code).send({
        status: response.status,
        message: response.message,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).send({
        status: false,
        message: "Failed to add priority",
      });
    }
  };
  
  module.exports.editPriority = async (req, res) => {
    try {
      const tenantid = req.headers["tenantid"];
      const userid = req.headers["userid"];
      const result = {
        ...req.body,
        tenantid,
        userid,
      };
  
      const schema = Joi.object({
        priorityid: Joi.number().required().messages({
          "any.required": "Priority ID is required",
          "number.base": "Priority ID must be a number",
        }),
        priorityname: Joi.string().required().messages({
          "any.required": "Priority name is required",
          "string.base": "Priority name must be a string",
        }),
        priorityimage: Joi.string().allow("").uri().messages({
          "string.base": "Priority image must be a string",
          "string.uri": "Priority image must be a valid URL",
        }),
        tenantid: Joi.number().required().messages({
          "any.required": "Tenant ID is required",
          "number.base": "Tenant ID must be a number",
        }),
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
        });
      }
  
      const response = await service.editPriority(result);
  
      if (
        !response ||
        typeof response.code !== "number" ||
        typeof response.status !== "boolean"
      ) {
        return res.status(200).send({
          status: false,
          message: "Unexpected error occurred while editing priority",
        });
      }
  
      return res.status(response.code).send({
        status: response.status,
        message: response.message,
      });
    } catch (err) {
      console.log(err);
      return res.status(200).send({
        status: false,
        message: "Failed to edit priority",
      });
    }
  };
  
  module.exports.getPriority = async (req, res) => {
    try {
      const tenantid = req.headers["tenantid"];
      const userid = req.headers["userid"];
      const result = {
        ...req.body,
        tenantid,
        userid,
      };
  
      const schema = Joi.object({
        key: Joi.number().required().messages({
          "any.required": "Key ID is required",
          "number.base": "Key ID must be a number",
        }),
        tenantid: Joi.number().required().messages({
          "any.required": "Tenant ID is required",
          "number.base": "Tenant ID must be a number",
        }),
        userid: Joi.number().required().messages({
          "any.required": "User ID is required",
          "number.base": "User ID must be a number",
        }),
        priorityid: Joi.alternatives(
          Joi.number().allow(""),
          Joi.number()
        ).messages({
          "number.base": "Priority ID must be a number or empty",
        }),
      }).required();
  
      const { error } = schema.validate(result);
      if (error) {
        return res.status(400).send({
          status: false,
          message: error.details[0]?.message || "Validation error",
        });
      }
  
      const response = await service.getPriority(result);
  
      if (
        !response ||
        typeof response.code !== "number" ||
        typeof response.status !== "boolean"
      ) {
        return res.status(200).send({
          status: false,
          message: "Unexpected error occurred while fetch priority",
        });
      }
  
      return res.status(response.code).send({
        status: response.status,
        message: response.message,
        response: response.response,
      });
    } catch (err) {
      console.log(err);
      return res.status(200).send({
        status: false,
        message: "Failed to retrieved priority data",
      });
    }
  };
  
  module.exports.updatePriorityStatus = async (req, res) => {
    try {
      const tenantid = req.headers["tenantid"];
      const userid = req.headers["userid"];
      const result = {
        ...req.body,
        tenantid,
        userid,
      };
  
      const schema = Joi.object({
        key: Joi.number().required().messages({
          "any.required": "Key ID is required",
          "number.base": "Key ID must be a number",
        }),
        tenantid: Joi.number().required().messages({
          "any.required": "Tenant ID is required",
          "number.base": "Tenant ID must be a number",
        }),
        userid: Joi.number().required().messages({
          "any.required": "User ID is required",
          "number.base": "User ID must be a number",
        }),
        priorityid: Joi.number().required().messages({
          "any.required": "Priority type ID is required",
          "number.base": "Priority ID must be a number",
        }),
      }).required();
  
      const { error } = schema.validate(result);
      if (error) {
        return res.status(400).send({
          status: false,
          message: error.details[0]?.message || "Validation error",
        });
      }
  
      const response = await service.updatePriorityStatus(result);
  
      if (
        !response ||
        typeof response.code !== "number" ||
        typeof response.status !== "boolean"
      ) {
        return res.status(200).send({
          status: false,
          message: "Unexpected error occurred while updating priority status",
        });
      }
  
      return res.status(response.code).send({
        status: response.status,
        message: response.message,
      });
    } catch (err) {
      console.log(err);
      return res.status(200).send({
        status: false,
        message: "Failed to update priority status",
      });
    }
  };
  