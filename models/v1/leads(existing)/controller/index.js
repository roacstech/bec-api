const service = require("../service/index");
const moment = require("moment");
const Joi = require("joi");
const _ = require("lodash");

module.exports.createLead = async (req, res) => {
  try {
    const tenantid = req.headers["tenantid"];
    const userid = req.headers["userid"];
    const result = {
      ...req.body,
      tenantid,
      userid,
    };

    const schema = Joi.object({
      leadname: Joi.string().required().messages({
        "any.required": "Lead name is required",
        "string.base": "Lead name must be a string",
      }),
      leadimage: Joi.string().allow("").uri().messages({
        "string.base": "Lead image must be a string",
        "string.uri": "Lead image must be a valid URL",
      }),
      configid: Joi.number().required().messages({
        "any.required": "Config ID is required",
        "number.base": "Config ID must be a number",
      }),
      companyid: Joi.number().required().messages({
        "any.required": "Company ID is required",
        "number.base": "Company ID must be a number",
      }),
      leadcompanyname: Joi.string().required().messages({
        "any.required": "Lead company name is required",
        "string.base": "Lead company name must be a string",
      }),
      primaryemail: Joi.string().email().required().messages({
        "any.required": "Primary Email is required",
        "string.email": "Primary Email must be a valid email address",
        "string.valid": "Primary Email can be empty or a valid email address",
      }),
      alteremail: Joi.alternatives()
        .try(Joi.string().email(), Joi.string().valid(""))
        .required()
        .messages({
          "any.required": "Primary Email is required",
          "string.email": " PrimaryEmail must be a valid email address",
          "string.valid":
            " Primary Email can be empty or a valid email address",
        }),
      primarycontact: Joi.string().required().messages({
        "any.required": "Primary Contact number is required",
        "string.base": "Primary Contact number must be a string",
      }),
      altercontact: Joi.alternatives()
        .try(Joi.string().allow(""), Joi.string())
        .messages({
          "string.base": "Alternative date must be a string or empty",
        }),
      // leadstageid: Joi.alternatives(
      //   Joi.number().allow(""),
      //   Joi.number()
      // ).messages({
      //   "number.base": "Lead Stage ID must be a number or empty",
      // }),
      productid: Joi.array().required().messages({
        "any.required": "At least one product ID is required",
        "array.base": "Product ID must be an array",
      }),
      // priorityid: Joi.alternatives()
      //   .try(Joi.number().allow(""), Joi.number())
      //   .messages({
      //     "number.base": "Priority ID must be a number or empty",
      //   }),
      address: Joi.alternatives(Joi.string().allow(""), Joi.string()).messages({
        "string.base": "Address must be a string or empty",
      }),
      // leadsourceid: Joi.number().required().messages({
      //   "any.required": "Lead source id is required",
      //   "number.base": "Lead source id must be a number",
      // }),
      companyemail: Joi.alternatives()
        .try(Joi.string().email(), Joi.string().valid(""))
        .required()
        .messages({
          "any.required": "Company email is required",
          "string.email": "Company email must be a valid email address",
          "string.valid": "Company email can be empty or a valid email address",
        }),
        description: Joi.string().required().messages({
          "any.required": "Description is required",
          "string.base": "Description must be a string",
        }),
      companyaddress: Joi.alternatives(
        Joi.string().allow(""),
        Joi.string()
      ).messages({
        "number.base": "Address must be a string or empty",
      }),
      leadstatusid: Joi.number().required().messages({
        "any.required": "Lead status ID is required",
        "number.base": "Lead status ID must be a number",
      }),
      // followupdate: Joi.alternatives()
      //   .try(Joi.string().allow(""), Joi.date())
      //   .messages({
      //     "string.base": "Followup date must be a string or empty",
      //   }),
      countryid: Joi.alternatives(
        Joi.number().allow(""),
        Joi.number()
      ).messages({
        "number.base": "Country ID must be a number or empty",
      }),
      stateid: Joi.alternatives(Joi.number().allow(""), Joi.number()).messages({
        "number.base": "State ID must be a number or empty",
      }),
      cityid: Joi.alternatives(Joi.number().allow(""), Joi.number()).messages({
        "number.base": "City ID must be a number or empty",
      }),
      tenantid: Joi.number().required().messages({
        "any.required": "Tenant ID is required",
        "number.base": "Tenant ID must be a number",
      }),
      userid: Joi.number().required().messages({
        "any.required": "User ID is required",
        "number.base": "User ID must be a number",
      })
    }).required();

    const { error } = schema.validate(result);
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0]?.message || "Validation error",
      });
    }

    const response = await service.createLead(result);
    console.log("res", response);

    if (
      !response ||
      typeof response.code !== "number" ||
      typeof response.status !== "boolean"
    ) {
      return res.status(500).send({
        status: false,
        message: "Unexpected error occurred while creating lead",
      });
    }

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
    });
  } catch (error) {
    console.error("Error in createLead:", error);
    return res.status(500).send({
      status: false,
      message: "Internal server error: failed to create lead",
    });
  }
};

module.exports.editLead = async (req, res) => {
  try {
    const tenantid = req.headers["tenantid"];
    const userid = req.headers["userid"];
    const result = {
      ...req.body,
      tenantid,
      userid,
    };

    const schema = Joi.object({
      key: Joi.alternatives(Joi.number().allow(""), Joi.number()).messages({
        "number.base": "Key ID must be a number or empty",
      }),
      leadid: Joi.number().required().messages({
        "any.required": "Lead ID is required",
        "number.base": "Lead ID must be a number",
      }),
      tenantleadid: Joi.number().required().messages({
        "any.required": "Tenant Lead ID is required",
        "number.base": "Tenant Lead ID must be a number",
      }),
      leadname: Joi.string().required().messages({
        "any.required": "Lead name is required",
        "string.base": "Lead name must be a string",
      }),
      leadimage: Joi.string().allow("").uri().messages({
        "string.base": "Lead image must be a string",
        "string.uri": "Lead image must be a valid URL",
      }),

      configid: Joi.number().required().messages({
        "any.required": "Config ID is required",
        "number.base": "Config ID must be a number",
      }),
      leadcompanyname: Joi.string().required().messages({
        "any.required": "Lead Company name is required",
        "string.base": "Lead Company name must be a string",
      }),
      primaryemail: Joi.string().email().required().messages({
        "any.required": "Primary Email is required",
        "string.email": "Primary Email must be a valid email address",
        "string.valid": "Primary Email can be empty or a valid email address",
      }),
      alteremail: Joi.alternatives()
        .try(Joi.string().email(), Joi.string().valid(""))
        .required()
        .messages({
          "any.required": "Primary Email is required",
          "string.email": " PrimaryEmail must be a valid email address",
          "string.valid":
            " Primary Email can be empty or a valid email address",
        }),
      primarycontact: Joi.string().required().messages({
        "any.required": "Primary Contact number is required",
        "string.base": "Primary Contact number must be a string",
      }),
      altercontact: Joi.alternatives()
        .try(Joi.string().allow(""), Joi.string())
        .messages({
          "string.base": "Alternative date must be a string or empty",
        }),
      productid: Joi.array().required().messages({
        "any.required": "At least one product ID is required",
        "array.base": "Product ID must be an array",
      }),
      // priorityid: Joi.alternatives()
      //   .try(Joi.number().allow(""), Joi.number())
      //   .messages({
      //     "number.base": "Priority ID must be a number or empty",
      //   }),
      // leadstageid: Joi.alternatives(
      //   Joi.number().allow(""),
      //   Joi.number()
      // ).messages({
      //   "number.base": "Lead Stage ID must be a number or empty",
      // }),
      description: Joi.alternatives(Joi.string().allow(""), Joi.string()).messages({
        "number.base": "Description must be a string or empty",
      }),
      address: Joi.alternatives(Joi.string().allow(""), Joi.string()).messages({
        "number.base": "Address must be a string or empty",
      }),
      // leadsourceid: Joi.number().required().messages({
      //   "any.required": "Lead source id is required",
      //   "number.base": "Lead source id must be a number",
      // }),
      companyemail: Joi.alternatives()
        .try(Joi.string().email(), Joi.string().valid(""))
        .required()
        .messages({
          "any.required": "Company email is required",
          "string.email": "Company email must be a valid email address",
          "string.valid": "Company email can be empty or a valid email address",
        }),
      companyaddress: Joi.alternatives(
        Joi.string().allow(""),
        Joi.string()
      ).messages({
        "number.base": "Address must be a string or empty",
      }),
      leadstatusid: Joi.number().required().messages({
        "any.required": "Lead status ID is required",
        "number.base": "Lead status ID must be a number",
      }),
      // followupdate: Joi.alternatives()
      //   .try(Joi.string().allow(""), Joi.date())
      //   .messages({
      //     "string.base": "Followup date must be a string or empty",
      //   }),
      from: Joi.alternatives()
        .try(Joi.string().allow(""), Joi.date())
        .messages({
          "string.base": "From date must be a string or empty",
        }),
      to: Joi.alternatives().try(Joi.string().allow(""), Joi.date()).messages({
        "string.base": "To date must be a string or empty",
      }),
      tenantstaffid: Joi.alternatives()
        .try(Joi.array().allow(""), Joi.array())
        .messages({
          "array.base": "Tenant staff ID must be an array or empty",
        }),
      countryid: Joi.alternatives(
        Joi.number().allow(""),
        Joi.number()
      ).messages({
        "number.base": "Country ID must be a number or empty",
      }),
      stateid: Joi.alternatives(Joi.number().allow(""), Joi.number()).messages({
        "number.base": "State ID must be a number or empty",
      }),
      cityid: Joi.alternatives(Joi.number().allow(""), Joi.number()).messages({
        "number.base": "City ID must be a number or empty",
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

    const response = await service.editLead(result);

    if (
      !response ||
      typeof response.code !== "number" ||
      typeof response.status !== "boolean"
    ) {
      return res.status(500).send({
        status: false,
        message: "Unexpected error occurred while editing lead",
      });
    }

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
    });
  } catch (error) {
    console.error("Error in createLead:", error);
    return res.status(500).send({
      status: false,
      message: "Failed to editing lead",
    });
  }
};

module.exports.getAllLeads = async (req, res) => {
  try {
    const tenantid = req.headers["tenantid"];
    const userid = req.headers["userid"];
    const roleid = req.headers["roleid"];

    const result = {
      ...req.body,
      tenantid,
      userid,
      roleid,
    };

    const schema = Joi.object({
      leadid: Joi.alternatives(Joi.number().allow(""), Joi.number()).messages({
        "number.base": "Lead ID must be a number or empty",
      }),
      leadstatusid: Joi.alternatives(
        Joi.number().allow(""),
        Joi.number()
      ).messages({
        "number.base": "Lead status id must be a number or empty",
      }),
      companyid: Joi.alternatives(
        Joi.number().allow(""),
        Joi.number()
      ).messages({
        "number.base": "Company ID must be a number or empty",
      }),
      // all: Joi.number().required().messages({
      //   "any.required": "all is required",
      //   "number.base": "all must be a number",
      // }),
      from: Joi.alternatives()
        .try(Joi.string().allow(""), Joi.date())
        .messages({
          "string.base": "Followup date must be a string or empty",
        }),
      to: Joi.alternatives().try(Joi.string().allow(""), Joi.date()).messages({
        "string.base": "Followup date must be a string or empty",
      }),
      limit: Joi.alternatives(Joi.number().allow(""), Joi.number()).messages({
        "number.base": "Limit must be a number or empty",
      }),
      offset: Joi.alternatives(Joi.number().allow(""), Joi.number()).messages({
        "number.base": "Offset must be a number or empty",
      }),
      roleid: Joi.number().required().messages({
        "any.required": "Role ID is required",
        "number.base": "Role ID must be a number",
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
    const response = await service.getAllLeads(result);

    const response1 = await service.getAllLeadsCount(result);

    if (!_.isEmpty(response)) {
      return res.status(response.code).send({
        status: response.status,
        message: response.message,
        response: response.response,
        count: response1,
      });
    }
  } catch (error) {
    console.log("error", error);
    return res.status(400).send({
      status: false,
      message: "Failed to retrieve lead data",
      response: [],
    });
  }
};

module.exports.getLeadsById = async (req, res) => {
  try {
    const tenantid = req.headers["tenantid"];
    const userid = req.headers["userid"];
    const roleid = req.headers["roleid"];

    const result = {
      ...req.body,
      tenantid,
      userid,
      roleid,
    };

    const schema = Joi.object({
      leadid: Joi.alternatives(Joi.number().allow(""), Joi.number()).messages({
        "number.base": "Lead ID must be a number or empty",
      }),
      roleid: Joi.number().required().messages({
        "any.required": "Role ID is required",
        "number.base": "Role ID must be a number",
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
    const response = await service.getLeadsById(result);

    if (!_.isEmpty(response)) {
      return res.status(response.code).send({
        status: response.status,
        message: response.message,
        response: response.response,
      });
    }
  } catch (error) {
    console.log("error", error);
    return res.status(400).send({
      status: false,
      message: "Failed to retrieve lead data",
      response: [],
    });
  }
};

module.exports.leadReAssignToStaff = async (req, res) => {
  try {
    const tenantid = req.headers["tenantid"];
    const userid = req.headers["userid"];
    const result = {
      ...req.body,
      tenantid,
      userid,
    };

    const schema = Joi.object({
      leadid: Joi.number().required().messages({
        "any.required": "Lead ID is required",
        "number.base": "Lead ID must be a number",
      }),
      tenantstaffid: Joi.number().required().messages({
        "any.required": "Tenant Staff ID is required",
        "number.base": "Tenant Staff ID must be a number",
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

    const response = await service.leadReAssignToStaff(result);

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
      response: response.response,
    });
  } catch (err) {
    console.log(err);
    return res.send({
      status: false,
      message: "Failed to update staff performance",
    });
  }
};

module.exports.assignLeadToEmployee = async (req, res) => {
  try {
    const tenantid = req.headers["tenantid"];
    const userid = req.headers["userid"];
    const result = {
      ...req.body,
      tenantid,
      userid,
    };

    const schema = Joi.object({
      leadid: Joi.number().required().messages({
        "any.required": "Lead ID is required",
        "number.base": "Lead ID must be a number",
      }),
      tenantstaffid: Joi.array().required().messages({
        "any.required": "At least one staff ID is required",
        "array.base": "Staff ID must be an array",
      }),
      leadorderdate: Joi.alternatives(
        Joi.string().allow(""),
        Joi.string()
      ).messages({
        "string.base": "Lead order date must be a string or empty",
      }),
      starttime: Joi.alternatives(
        Joi.string().allow(""),
        Joi.string()
      ).messages({
        "string.base": "Start time must be a string or empty",
      }),
      tenantid: Joi.number().required().messages({
        "any.required": "Tenant ID is required",
        "number.base": "Tenant ID must be a number",
      }),
      staffuserid: Joi.number().required().messages({
        "any.required": "Staff User ID is required",
        "number.base": "Staff User ID must be a number",
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

    const response = await service.assignLeadToEmployee(result);

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
      response: response.response,
    });
  } catch (err) {
    console.log(err);
    return res.send({
      status: false,
      message: "Failed to update staff performance",
    });
  }
};
