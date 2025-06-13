const service = require("../service/index");
const _ = require("lodash");
const Joi = require("joi");

module.exports.createCompany = async (req, res) => {
  try {
    const tenantid = req.headers["tenantid"];
    if (!tenantid) {
      return res.status(400).send({
        status: false,
        message: "Tenant ID is required",
      });
    }

    const payload = {
      ...req.body,
      tenantid, // Adding tenantid for service call, but not for validation
    };

    // Define the schema without tenantid
    const schema = Joi.object({
      companyname: Joi.string().required().messages({
        "any.required": "Company name is required",
        "string.base": "Company name must be a string",
      }),
      companyuniqueid: Joi.string().required().messages({
        "any.required": "Company unique ID is required",
        "string.base": "Company unique ID must be a string",
      }),
      companyaddress: Joi.string().required().messages({
        "any.required": "Company address is required",
        "string.base": "Company address must be a string",
      }),
      companyimage: Joi.string().allow("").uri().messages({
        "string.base": "Company image must be a string",
        "string.uri": "Company image must be a valid URL",
      }),
      contact: Joi.string().required().messages({
        "any.required": "Contact is required",
        "string.base": "Contact must be a string",
      }),
      altercontact: Joi.string().allow("").messages({
        "string.base": "Alternate contact must be a string",
      }),
      email: Joi.string().email().required().messages({
        "any.required": "Email is required",
        "string.email": "Email must be a valid email address",
      }),
      alteremail: Joi.string().email().allow("").messages({
        "string.email": "Alternate email must be a valid email address",
      }),
      billingaddress: Joi.string().required().messages({
        "any.required": "Billing address is required",
        "string.base": "Billing address must be a string",
      }),
      gstnumber: Joi.string().allow("").messages({
        "string.base": "GST number must be a string",
      }),
      companyquotationnotes: Joi.string().required().messages({
        "any.required": "Quotation notes is required",
        "string.base": "Quotation notes must be a string",
      }),
      companyquotationtermsandconditions: Joi.string().required().messages({
        "any.required": "Quotation Terms & Conditions is required",
        "string.base": "Quotation Terms & Conditions must be a string",
      }),
    }).required();

    // Validate req.body without tenantid
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0]?.message || "Validation error",
      });
    }

    // Call the service function to create a company with payload including tenantid
    const response = await service.createCompany(payload);

    if (!response || typeof response.code !== "number" || typeof response.status !== "boolean") {
      return res.status(500).send({
        status: false,
        message: "Unexpected error occurred while creating the company",
      });
    }

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
    });
  } catch (err) {
    console.error("Error creating company:", err);
    return res.status(500).send({
      status: false,
      message: "Failed to create company",
    });
  }
};


module.exports.editCompany = async (req, res) => {
  try {
    const tenantid = req.headers["tenantid"];
    if (!tenantid) {
      return res.status(400).send({
        status: false,
        message: "Tenant ID is required",
      });
    }

    const payload = {
      ...req.body,
      tenantid, // Adding tenantid for service call, but not for validation
    };

    // Define the schema without tenantid
    const schema = Joi.object({
      companyid: Joi.number().required().messages({
        "any.required": "Company ID is required",
        "number.base": "Company ID must be a number",
      }),
      companyname: Joi.string().required().messages({
        "any.required": "Company name is required",
        "string.base": "Company name must be a string",
      }),
      companyuniqueid: Joi.string().required().messages({
        "any.required": "Company unique ID is required",
        "string.base": "Company unique ID must be a string",
      }),
      companyaddress: Joi.string().required().messages({
        "any.required": "Company address is required",
        "string.base": "Company address must be a string",
      }),
      companyimage: Joi.string().allow("").uri().messages({
        "string.base": "Company image must be a string",
        "string.uri": "Company image must be a valid URL",
      }),
      contact: Joi.string().required().messages({
        "any.required": "Contact is required",
        "string.base": "Contact must be a string",
      }),
      altercontact: Joi.string().allow("").messages({
        "string.base": "Alternate contact must be a string",
      }),
      email: Joi.string().email().required().messages({
        "any.required": "Email is required",
        "string.email": "Email must be a valid email address",
      }),
      alteremail: Joi.string().email().allow("").messages({
        "string.email": "Alternate email must be a valid email address",
      }),
      billingaddress: Joi.string().required().messages({
        "any.required": "Billing address is required",
        "string.base": "Billing address must be a string",
      }),
      gstnumber: Joi.string().allow("").messages({
        "string.base": "GST number must be a string",
      }),
      companyquotationnotes: Joi.string().required().messages({
        "any.required": "Quotation notes is required",
        "string.base": "Quotation notes must be a string",
      }),
      companyquotationtermsandconditions: Joi.string().required().messages({
        "any.required": "Quotation Terms & Conditions is required",
        "string.base": "Quotation Terms & Conditions must be a string",
      }),
    }).required();

    // Validate req.body without tenantid
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0]?.message || "Validation error",
      });
    }

    // Call the service function to create a company with payload including tenantid
    const response = await service.editCompany(payload);

    if (!response || typeof response.code !== "number" || typeof response.status !== "boolean") {
      return res.status(500).send({
        status: false,
        message: "Unexpected error occurred while edit the company",
      });
    }

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
    });
  } catch (err) {
    console.log(err);
    return res.send({
      status: false,
      message: "Failed to edit company",
    });
  }
};

module.exports.getAllCompany = async (req, res) => {
  try {
    const tenantid = req.headers["tenantid"];
    const result = {
      ...req.body,
      tenantid,
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
    }).required();

    const { error } = schema.validate(result);
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0]?.message || "Validation error",
      });
    }
    const response = await service.getAllCompany(result);

    // Safety check to ensure response object is properly structured
    if (
      !response ||
      typeof response.code !== "number" ||
      typeof response.status !== "boolean"
    ) {
      return res.status(200).send({
        status: false,
        message: "Unexpected error occurred while fetch company",
      });
    }

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
      response: response.response,
    });
  } catch (err) {
    console.log(err);
    return res.send({
      status: false,
      message: "Failed to fetch company data",
      response: [],
    });
  }
};

module.exports.updateCompanyStatus = async (req, res) => {
  try {
    const tenantid = req.headers["tenantid"];
    // const userid = req.headers["userid"];
    const result = {
      ...req.body,
      tenantid
    };

    // Update the validation schema for company instead of tenant staff
    const schema = Joi.object({
      key: Joi.number().required().messages({
        "any.required": "Key ID is required",
        "number.base": "Key ID must be a number",
      }),
      tenantid: Joi.number().required().messages({
        "any.required": "Tenant ID is required",
        "number.base": "Tenant ID must be a number",
      }),
      companyid: Joi.number().required().messages({
        "any.required": "Company ID is required",
        "number.base": "Company ID must be a number",
      }),
    }).required();

    const { error } = schema.validate(result);
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0]?.message || "Validation error",
      });
    }

    const response = await service.updateCompanyStatus(result);

    if (
      !response ||
      typeof response.code !== "number" ||
      typeof response.status !== "boolean"
    ) {
      return res.status(500).send({
        status: false,
        message: "Unexpected error occurred while updating company status",
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
      message: "Failed to update company status",
    });
  }
};

