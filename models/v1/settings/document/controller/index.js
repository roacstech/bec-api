const service = require("../service/index");
const Joi = require("joi");
const _ = require("lodash");

//document
module.exports.addDocument = async (req, res) => {
  try {
    const tenantid = req.headers["tenantid"];
    const userid = req.headers["userid"];
    const result = {
      ...req.body,
      tenantid,
      userid,
    };

    const schema = Joi.object({
      documentname: Joi.string().required().messages({
        "any.required": "Document name is required",
        "string.base": "Document name must be a string",
      }),
      documenttypeid: Joi.number().required().messages({
        "any.required": "Document Type ID is required",
        "string.base": "Document Type Id must be a number",
      }),
      documentimage: Joi.string().uri().optional().allow("").messages({
        "any.required": "Document image is required",
        "string.base": "Document image must be a string",
        "string.uri": "Document image must be a valid URL",
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

    const response = await service.addDocument(result);

    if (
      !response ||
      typeof response.code !== "number" ||
      typeof response.status !== "boolean"
    ) {
      return res.status(500).send({
        status: false,
        message: "Unexpected error occurred while adding document",
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
      message: "Failed to add document",
    });
  }
};

module.exports.editDocument = async (req, res) => {
  try {
    const tenantid = req.headers["tenantid"];
    const userid = req.headers["userid"];
    const result = {
      ...req.body,
      tenantid,
      userid,
    };

    const schema = Joi.object({
      documentid: Joi.number().required().messages({
        "any.required": "Document ID is required",
        "number.base": "Document ID must be a number",
      }),
      documenttypeid: Joi.number().required().messages({
        "any.required": "Document Type ID is required",
        "number.base": "Document Type ID must be a number",
      }),
      documentname: Joi.string().required().messages({
        "any.required": "Document name is required",
        "string.base": "Document name must be a string",
      }),
      documentimage: Joi.string().uri().optional().allow("").messages({
        "any.required": "Document image is required",
        "string.base": "Document image must be a string",
        "string.uri": "Document image must be a valid URL",
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

    const response = await service.editDocument(result);

    if (
      !response ||
      typeof response.code !== "number" ||
      typeof response.status !== "boolean"
    ) {
      return res.status(200).send({
        status: false,
        message: "Unexpected error occurred while editing document",
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
      message: "Failed to edit document",
    });
  }
};

module.exports.getDocument = async (req, res) => {
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
      documenttypeid: Joi.alternatives(
        Joi.number().allow(""),
        Joi.number()
      ).messages({
        "number.base": "Document Type ID must be a number or empty",
      }),
      documentid: Joi.alternatives(
        Joi.number().allow(""),
        Joi.number()
      ).messages({
        "number.base": "Document ID must be a number or empty",
      }),
    }).required();

    const { error } = schema.validate(result);
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0]?.message || "Validation error",
      });
    }

    const response = await service.getDocument(result);

    if (
      !response ||
      typeof response.code !== "number" ||
      typeof response.status !== "boolean"
    ) {
      return res.status(200).send({
        status: false,
        message: "Unexpected error occurred while fetching document",
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
      message: "Failed to retrieved fetching document data",
    });
  }
};

module.exports.updateDocumentStatus = async (req, res) => {
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
      documentid: Joi.number().required().messages({
        "any.required": "Document ID is required",
        "number.base": "Document ID must be a number",
      }),
    }).required();

    const { error } = schema.validate(result);
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0]?.message || "Validation error",
      });
    }

    const response = await service.updateDocumentStatus(result);

    if (
      !response ||
      typeof response.code !== "number" ||
      typeof response.status !== "boolean"
    ) {
      return res.status(200).send({
        status: false,
        message: "Unexpected error occurred while updating document status",
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
      message: "Failed to update status document",
    });
  }
};
