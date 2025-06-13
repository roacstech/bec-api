const service = require("../service/index");
const Joi = require("joi");
const _ = require("lodash");

module.exports.convertCustomer = async (req, res) => {
  try {
    const tenantid = req.headers["tenantid"];
    const userid = req.headers["userid"];
    // const roleid = req.headers["roleid"];

    const result = {
      ...req.body,
      tenantid,
      userid,
      // roleid,
    };

    const schema = Joi.object({
      Customerid: Joi.number().required().messages({
        "any.required": "Customer ID is required",
        "number.base": "Customer ID must be a number",
      }),
      companyid: Joi.number().required().messages({
        "any.required": "Company ID is required",
        "number.base": "Company ID must be a number",
      }),
      tenantstaffid: Joi.number().required().messages({
        "any.required": "Tenant staff ID is required",
        "number.base": "Tenant staff ID must be a number",
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

    const response = await service.convertCustomer(result);
    return res.status(response.code).send({
      status: response.status,
      message: response.message,
    });
  } catch (error) {
    console.log("error", error);
  }
  return res.send({
    status: false,
    message: "Failed to convert Customer to customer",
  });
};

// new requirement added to the customer projects and buildings
module.exports.createCustomer = async (req, res) => {
  try {
    const tenantid = req.headers["tenantid"];
    const userid = req.headers["userid"];
    const result = {
      ...req.body,
      tenantid,
      userid,
    };

    let schema;

    const { customertype } = result;

    if (!customertype) {
      return res.status(400).send({
        status: false,
        message: "Customer type is required",
      });
    }
    // console.log('customertype', customertype);

    switch (customertype) {
      case 1:
        schema = Joi.object({
          customername: Joi.string().required().messages({
            "any.required": "Customer name is required",
            "string.base": "Customer name must be a string",
          }),
          customertrnno: Joi.string().optional().messages({
            "any.required": "Customer TRN No is required",
            "string.base": "Customer TRN No must be a string",
            }),
          customerimage: Joi.string().allow("").uri().messages({
            "string.base": "Customer image must be a string",
            "string.uri": "Customer image must be a valid URL",
          }),
          configid: Joi.number().required().messages({
            "any.required": "Config ID is required",
            "number.base": "Config ID must be a number",
          }),
          companyid: Joi.number().required().messages({
            "any.required": "Company ID is required",
            "number.base": "Company ID must be a number",
          }),
          customercompanyname: Joi.string().required().messages({
            "any.required": "Customer Company name is required",
            "string.base": "Customer Company name must be a string",
          }),
          customerprimaryemail: Joi.string().required().messages({
            "any.required": "Primary Email is required",
            "string.valid":
              "Primary Email can be empty or a valid email address",
          }),
          customeralteremail: Joi.alternatives()
            .try(Joi.string(), Joi.string().valid(""))
            .optional()
            .messages({
              "any.required": "Alternate Email is required",
              "string.valid":
                " Alternate Email can be empty or a valid email address",
            }),
          customerprimarycontact: Joi.string().required().messages({
            "any.required": "Primary Contact number is required",
            "string.base": "Primary Contact number must be a string",
          }),
          customeraltercontact: Joi.alternatives()
            .try(Joi.string().allow(""), Joi.string())
            .messages({
              "string.base": "Alternative date must be a string or empty",
            }),
          customertype: Joi.number().required().messages({
            "any.required": "Customer type ID is required",
            "number.base": "Customer type must be a number",
          }),
          address: Joi.alternatives(
            Joi.string().allow(""),
            Joi.string()
          ).messages({
            "number.base": "Address must be a string or empty",
          }),
          customerprojects: Joi.array()
            .items(
              Joi.object({
                projectname: Joi.string().required().messages({
                  "any.required": "Project name is required",
                  "string.base": "Project name must be a string",
                }),
                buildings: Joi.array()
                  .items(
                    Joi.string().messages({
                      "string.base": "Building name must be a valid string",
                    })
                  )
                  .required()
                  .messages({
                    "any.required": "Building name is required",
                  }),
              })
            )
            .required()
            .messages({
              "any.required": "Customer projects are required",
            }),
          customercompanyemail: Joi.alternatives()
            .try(Joi.string(), Joi.string().valid(""))
            .required()
            .messages({
              "any.required": "Company email is required",
              "string.valid":
                "Company email can be empty or a valid email address",
            }),
          customercompanyaddress: Joi.alternatives(
            Joi.string().allow(""),
            Joi.string()
          ).messages({
            "number.base": "Address must be a string or empty",
          }),
          countryid: Joi.alternatives(
            Joi.number().allow(""),
            Joi.number()
          ).messages({
            "number.base": "Country ID must be a number or empty",
          }),
          stateid: Joi.alternatives(
            Joi.number().allow(""),
            Joi.number()
          ).messages({
            "number.base": "State ID must be a number or empty",
          }),
          cityid: Joi.alternatives(
            Joi.number().allow(""),
            Joi.number()
          ).messages({
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

        break;

      case 2:
        schema = Joi.object({
          customername: Joi.string().required().messages({
            "any.required": "Customer name is required",
            "string.base": "Customer name must be a string",
          }),
          customertrnno: Joi.string().optional().messages({
            "any.required": "Customer TRN No is required",
            "string.base": "Customer TRN No must be a string",
            }),
          customerimage: Joi.string().allow("").uri().messages({
            "string.base": "Customer image must be a string",
            "string.uri": "Customer image must be a valid URL",
          }),
          configid: Joi.number().required().messages({
            "any.required": "Config ID is required",
            "number.base": "Config ID must be a number",
          }),
          companyid: Joi.number().required().messages({
            "any.required": "Company ID is required",
            "number.base": "Company ID must be a number",
          }),
          customertype: Joi.number().required().messages({
            "any.required": "Customer type ID is required",
            "number.base": "Customer type must be a number",
          }),
          customerprimaryemail: Joi.string().email().required().messages({
            "any.required": "Primary Email is required",
            "string.valid":
              "Primary Email can be empty or a valid email address",
          }),
          customeralteremail: Joi.alternatives()
            .try(Joi.string(), Joi.string().valid(""))
            .optional()
            .messages({
              "any.required": "Alternate Email is required",
              "string.valid":
                " Alternate Email can be empty or a valid email address",
            }),
          customerprimarycontact: Joi.string().required().messages({
            "any.required": "Primary Contact number is required",
            "string.base": "Primary Contact number must be a string",
          }),
          customeraltercontact: Joi.alternatives()
            .try(Joi.string().allow(""), Joi.string())
            .messages({
              "string.base": "Alternative date must be a string or empty",
            }),
          customeraddress: Joi.string().required().messages({
            "any.required": "Customer Address is required",
            "string.base": "Customer Address must be a string",
          }),
          countryid: Joi.alternatives(
            Joi.number().allow(""),
            Joi.number()
          ).messages({
            "number.base": "Country ID must be a number or empty",
          }),
          stateid: Joi.alternatives(
            Joi.number().allow(""),
            Joi.number()
          ).messages({
            "number.base": "State ID must be a number or empty",
          }),
          cityid: Joi.alternatives(
            Joi.number().allow(""),
            Joi.number()
          ).messages({
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
          customerprojects: Joi.array()
            .items(
              Joi.object({
                projectname: Joi.string().required().messages({
                  "any.required": "Project name is required",
                  "string.base": "Project name must be a string",
                }),
                buildings: Joi.array()
                  .items(
                    Joi.string().messages({
                      "string.base": "Building name must be a valid string",
                    })
                  )
                  .required()
                  .messages({
                    "any.required": "Building name is required",
                  }),
              })
            )
            .required()
            .messages({
              "any.required": "Customer projects are required",
            }),
        }).required();
        break;
    }

    const { error } = schema.validate(result);
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0]?.message || "Validation error",
      });
    }

    const response = await service.createCustomer(result);

    // console.log('res', response);

    if (
      !response ||
      typeof response.code !== "number" ||
      typeof response.status !== "boolean"
    ) {
      return res.status(500).send({
        status: false,
        message: "Unexpected error occurred while creating customer",
      });
    }

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
      notifydata: response.notifydata,
      mailProps: response.mailProps,
    });
  } catch (error) {
    console.error("Error in createCustomer:", error);
    return res.status(500).send({
      status: false,
      message: "Internal server error: failed to create customer",
    });
  }
};

module.exports.editCustomer = async (req, res) => {
  try {
    const tenantid = req.headers["tenantid"];
    const userid = req.headers["userid"];
    const result = {
      ...req.body,
      tenantid,
      userid,
    };

    const { customertype } = result;
    // console.log("customertype", customertype);

    let schema;

    switch (customertype) {
      case 1:
        schema = Joi.object({
          customername: Joi.string().required().messages({
            "any.required": "Customer name is required",
            "string.base": "Customer name must be a string",
          }),
          customertrnno: Joi.string().optional().messages({
            "any.required": "Customer TRN No is required",
            "string.base": "Customer TRN No must be a string",
            }),
          customerimage: Joi.string().allow("").uri().messages({
            "string.base": "Customer image must be a string",
            "string.uri": "Customer image must be a valid URL",
          }),
          configid: Joi.number().required().messages({
            "any.required": "Config ID is required",
            "number.base": "Config ID must be a number",
          }),
          companyid: Joi.number().required().messages({
            "any.required": "Company ID is required",
            "number.base": "Company ID must be a number",
          }),
          customerid: Joi.number().required().messages({
            "any.required": "Customer ID is required",
            "number.base": "Customer ID must be a number",
          }),
          customercompanyname: Joi.string().required().messages({
            "any.required": "Customer Company name is required",
            "string.base": "Customer Company name must be a string",
          }),
          customerprimaryemail: Joi.string().required().messages({
            "any.required": "Primary Email is required",
            "string.valid":
              "Primary Email can be empty or a valid email address",
          }),
          customeralteremail: Joi.alternatives()
            .try(Joi.string(), Joi.string().valid(""))
            .required()
            .messages({
              "any.required": "Primary Email is required",
              "string.valid":
                " Primary Email can be empty or a valid email address",
            }),
          customerprimarycontact: Joi.string().required().messages({
            "any.required": "Primary Contact number is required",
            "string.base": "Primary Contact number must be a string",
          }),
          customeraltercontact: Joi.alternatives()
            .try(Joi.string().allow(""), Joi.string())
            .messages({
              "string.base": "Alternative date must be a string or empty",
            }),
          customertype: Joi.number().required().messages({
            "any.required": "Customer type ID is required",
            "number.base": "Customer type must be a number",
          }),
          address: Joi.alternatives(
            Joi.string().allow(""),
            Joi.string()
          ).messages({
            "number.base": "Address must be a string or empty",
          }),
          customerprojects: Joi.array()
            .items(
              Joi.object({
                projectname: Joi.string().required().messages({
                  "any.required": "Project name is required",
                  "string.base": "Project name must be a string",
                }),
                buildings: Joi.array()
                  .items(
                    Joi.string().messages({
                      "string.base": "Building name must be a valid string",
                    })
                  )
                  .required()
                  .messages({
                    "any.required": "Building name is required",
                  }),
              })
            )
            .required()
            .messages({
              "any.required": "Customer projects are required",
            }),
          customercompanyemail: Joi.alternatives()
            .try(Joi.string(), Joi.string().valid(""))
            .required()
            .messages({
              "any.required": "Company email is required",
              "string.valid":
                "Company email can be empty or a valid email address",
            }),
          customercompanyaddress: Joi.alternatives(
            Joi.string().allow(""),
            Joi.string()
          ).messages({
            "number.base": "Address must be a string or empty",
          }),
          countryid: Joi.alternatives(
            Joi.number().allow(""),
            Joi.number()
          ).messages({
            "number.base": "Country ID must be a number or empty",
          }),
          stateid: Joi.alternatives(
            Joi.number().allow(""),
            Joi.number()
          ).messages({
            "number.base": "State ID must be a number or empty",
          }),
          cityid: Joi.alternatives(
            Joi.number().allow(""),
            Joi.number()
          ).messages({
            "number.base": "City ID must be a number or empty",
          }),
          tenantid: Joi.number().required().messages({
            "any.required": "Tenant ID is required",
            "number.base": "Tenant ID must be a number",
          }),
          appuserid: Joi.number().required().messages({
            "any.required": "App User ID is required",
            "number.base": "App User ID must be a number",
          }),
          userid: Joi.number().required().messages({
            "any.required": "User ID is required",
            "number.base": "User ID must be a number",
          }),
        }).required();

        break;

      case 2:
        schema = Joi.object({
          customername: Joi.string().required().messages({
            "any.required": "Customer name is required",
            "string.base": "Customer name must be a string",
          }),
          customertrnno: Joi.string().optional().messages({
            "any.required": "Customer TRN No is required",
            "string.base": "Customer TRN No must be a string",
            }),
          customeraddress: Joi.string().required().messages({
            "any.required": "Customer adcustomeraddress is required",
            "string.base": "Customer adcustomeraddress must be a string",
          }),
          customerimage: Joi.string().allow("").uri().messages({
            "string.base": "Customer image must be a string",
            "string.uri": "Customer image must be a valid URL",
          }),
          configid: Joi.number().required().messages({
            "any.required": "Config ID is required",
            "number.base": "Config ID must be a number",
          }),
          companyid: Joi.number().required().messages({
            "any.required": "Company ID is required",
            "number.base": "Company ID must be a number",
          }),
          customerid: Joi.number().required().messages({
            "any.required": "Customer ID is required",
            "number.base": "Customer ID must be a number",
          }),
          appuserid: Joi.number().required().messages({
            "any.required": "App User ID is required",
            "number.base": "App User ID must be a number",
          }),
          customertype: Joi.number().required().messages({
            "any.required": "Customer type ID is required",
            "number.base": "Customer type must be a number",
          }),
          customerprimaryemail: Joi.string().required().messages({
            "any.required": "Primary Email is required",
            "string.valid":
              "Primary Email can be empty or a valid email address",
          }),
          customeralteremail: Joi.alternatives()
            .try(Joi.string(), Joi.string().valid(""))
            .required()
            .messages({
              "any.required": "Primary Email is required",
              "string.valid":
                " Primary Email can be empty or a valid email address",
            }),
          customerprimarycontact: Joi.string().required().messages({
            "any.required": "Primary Contact number is required",
            "string.base": "Primary Contact number must be a string",
          }),
          customeraltercontact: Joi.alternatives()
            .try(Joi.string().allow(""), Joi.string())
            .messages({
              "string.base": "Alternative date must be a string or empty",
            }),
          customeraddress: Joi.string().required().messages({
            "any.required": "Customer Address is required",
            "string.base": "Customer Address must be a string",
          }),
          countryid: Joi.alternatives(
            Joi.number().allow(""),
            Joi.number()
          ).messages({
            "number.base": "Country ID must be a number or empty",
          }),
          stateid: Joi.alternatives(
            Joi.number().allow(""),
            Joi.number()
          ).messages({
            "number.base": "State ID must be a number or empty",
          }),
          cityid: Joi.alternatives(
            Joi.number().allow(""),
            Joi.number()
          ).messages({
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
          customerprojects: Joi.array()
            .items(
              Joi.object({
                projectname: Joi.string().required().messages({
                  "any.required": "Project name is required",
                  "string.base": "Project name must be a string",
                }),
                buildings: Joi.array()
                  .items(
                    Joi.string().messages({
                      "string.base": "Building name must be a valid string",
                    })
                  )
                  .required()
                  .messages({
                    "any.required": "Building name is required",
                  }),
              })
            )
            .required()
            .messages({
              "any.required": "Customer projects are required",
            }),
        }).required();
        break;
    }

    const { error } = schema.validate(result);
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details.map((err) => err.message),
      });
    }

    const response = await service.editCustomer(result);

    if (
      !response ||
      typeof response.code !== "number" ||
      typeof response.status !== "boolean"
    ) {
      return res.status(500).send({
        status: false,
        message: "Unexpected error occurred while editing customer",
      });
    }

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
    });
  } catch (error) {
    console.error("Error in editCustomer:", error);
    return res.status(500).send({
      status: false,
      message: "Internal server error: failed to edit customer",
    });
  }
};

module.exports.getCustomer = async (req, res) => {
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
      customerapproval: Joi.number().optional().messages({
        "any.required": "Customer Approval is required",
        "number.base": "Customer Approval must be a number",
      }),
      customertype: Joi.optional().messages({
        "any.required": "Customer Type is required",
        "number.base": "Customer Type must be a number",
      }),
      customerid: Joi.alternatives(
        Joi.number().allow(""),
        Joi.number()
      ).messages({
        "number.base": "Customer ID must be a number or empty",
      }),
      companyid: Joi.alternatives(
        Joi.number().allow(""),
        Joi.number()
      ).messages({
        "number.base": "Companyid ID must be a number or empty",
      }),
    }).required();

    const { error } = schema.validate(result);
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0]?.message || "Validation error",
      });
    }

    const response = await service.getCustomer(result);

    if (
      !response ||
      typeof response.code !== "number" ||
      typeof response.status !== "boolean"
    ) {
      return res.status(500).send({
        status: false,
        message: "Unexpected error occurred while fetch customer data",
      });
    }

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
      response: response.response,
      count: response.counts,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: false,
      message: "Failed to fetch customer data",
    });
  }
};

module.exports.getRegistrationCustomer = async (req, res) => {
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
      customerapproval: Joi.number().required().messages({
        "any.required": "Customer Approval is required",
        "number.base": "Customer Approval must be a number",
      }),
      customerid: Joi.alternatives(
        Joi.number().allow(""),
        Joi.number()
      ).messages({
        "number.base": "Customer ID must be a number or empty",
      }),
      companyid: Joi.alternatives(
        Joi.number().allow(""),
        Joi.number()
      ).messages({
        "number.base": "Companyid ID must be a number or empty",
      }),
    }).required();

    const { error } = schema.validate(result);
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0]?.message || "Validation error",
      });
    }

    const response = await service.getRegistrationCustomer(result);

    if (
      !response ||
      typeof response.code !== "number" ||
      typeof response.status !== "boolean"
    ) {
      return res.status(500).send({
        status: false,
        message: "Unexpected error occurred while fetch customer data",
      });
    }

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
      response: response.response,
      count: response.counts,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: false,
      message: "Failed to fetch customer data",
    });
  }
};

module.exports.updateCustomerStatus = async (req, res) => {
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
      customerid: Joi.number().required().messages({
        "any.required": "Customer ID is required",
        "number.base": "Customer ID must be a number",
      }),
    }).required();

    const { error } = schema.validate(result);
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0]?.message || "Validation error",
      });
    }

    const response = await service.updateCustomerStatus(result);

    if (
      !response ||
      typeof response.code !== "number" ||
      typeof response.status !== "boolean"
    ) {
      return res.status(500).send({
        status: false,
        message: "Unexpected error occurred while updating customer status",
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
      message: "Failed to update customer status",
    });
  }
};

module.exports.getCustomerById = async (req, res) => {
  try {
    const tenantid = req.headers["tenantid"];
    const userid = req.headers["userid"];
    const result = {
      ...req.body,
      tenantid,
      userid,
    };

    const schema = Joi.object({
      tenantid: Joi.number().required().messages({
        "any.required": "Tenant ID is required",
        "number.base": "Tenant ID must be a number",
      }),
      userid: Joi.number().required().messages({
        "any.required": "User ID is required",
        "number.base": "User ID must be a number",
      }),
      customerid: Joi.alternatives(
        Joi.number().allow(""),
        Joi.number()
      ).messages({
        "number.base": "Customer ID must be a number or empty",
      }),
    }).required();

    const { error } = schema.validate(result);
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0]?.message || "Validation error",
      });
    }

    const response = await service.getCustomerById(result);

    if (
      !response ||
      typeof response.code !== "number" ||
      typeof response.status !== "boolean"
    ) {
      return res.status(500).send({
        status: false,
        message: "Unexpected error occurred while fetch customer data",
      });
    }

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
      response: response.response,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: false,
      message: "Failed to fetch customer data",
    });
  }
};

module.exports.getCustomerByIdApp = async (req, res) => {
  try {
    const tenantid = req.headers["tenantid"];
    const userid = req.headers["userid"];
    const result = {
      ...req.body,
      tenantid,
      userid,
    };

    const schema = Joi.object({
      tenantid: Joi.number().required().messages({
        "any.required": "Tenant ID is required",
        "number.base": "Tenant ID must be a number",
      }),
      userid: Joi.number().required().messages({
        "any.required": "User ID is required",
        "number.base": "User ID must be a number",
      }),
      customerid: Joi.alternatives(
        Joi.number().allow(""),
        Joi.number()
      ).messages({
        "number.base": "Customer ID must be a number or empty",
      }),
    }).required();

    const { error } = schema.validate(result);
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0]?.message || "Validation error",
      });
    }

    const response = await service.getCustomerByIdApp(result);

    if (
      !response ||
      typeof response.code !== "number" ||
      typeof response.status !== "boolean"
    ) {
      return res.status(500).send({
        status: false,
        message: "Unexpected error occurred while fetch customer data",
      });
    }

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
      response: response.response,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: false,
      message: "Failed to fetch customer data",
    });
  }
};

module.exports.getRegistrationCustomerById = async (req, res) => {
  try {
    const tenantid = req.headers["tenantid"];
    const userid = req.headers["userid"];
    const result = {
      ...req.body,
      tenantid,
      userid,
    };

    const schema = Joi.object({
      tenantid: Joi.number().required().messages({
        "any.required": "Tenant ID is required",
        "number.base": "Tenant ID must be a number",
      }),
      userid: Joi.number().required().messages({
        "any.required": "User ID is required",
        "number.base": "User ID must be a number",
      }),
      customerid: Joi.alternatives(
        Joi.number().allow(""),
        Joi.number()
      ).messages({
        "number.base": "Customer ID must be a number or empty",
      }),
    }).required();

    const { error } = schema.validate(result);
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0]?.message || "Validation error",
      });
    }

    const response = await service.getRegistrationCustomerById(result);

    if (
      !response ||
      typeof response.code !== "number" ||
      typeof response.status !== "boolean"
    ) {
      return res.status(500).send({
        status: false,
        message: "Unexpected error occurred while fetch customer data",
      });
    }

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
      response: response.response,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: false,
      message: "Failed to fetch customer data",
    });
  }
};

module.exports.getCustomerProject = async (req, res) => {
  try {
    const tenantid = req.headers["tenantid"];
    const userid = req.headers["userid"];
    const result = {
      ...req.body,
      tenantid,
      userid,
    };

    const schema = Joi.object({
      tenantid: Joi.number().required().messages({
        "any.required": "Tenant ID is required",
        "number.base": "Tenant ID must be a number",
      }),
      userid: Joi.number().required().messages({
        "any.required": "User ID is required",
        "number.base": "User ID must be a number",
      }),
      customerid: Joi.alternatives(
        Joi.number().allow(""),
        Joi.number()
      ).messages({
        "number.base": "Customer ID must be a number or empty",
      }),
    }).required();

    const { error } = schema.validate(result);
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0]?.message || "Validation error",
      });
    }

    const response = await service.getCustomerProject(result);

    if (
      !response ||
      typeof response.code !== "number" ||
      typeof response.status !== "boolean"
    ) {
      return res.status(500).send({
        status: false,
        message: "Unexpected error occurred while fetch customer data",
      });
    }

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
      response: response.response,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: false,
      message: "Failed to fetch customer data",
    });
  }
};

module.exports.getCustomerBuildings = async (req, res) => {
  try {
    const tenantid = req.headers["tenantid"];
    const userid = req.headers["userid"];
    const result = {
      ...req.body,
      tenantid,
      userid,
    };

    const schema = Joi.object({
      tenantid: Joi.number().required().messages({
        "any.required": "Tenant ID is required",
        "number.base": "Tenant ID must be a number",
      }),
      userid: Joi.number().required().messages({
        "any.required": "User ID is required",
        "number.base": "User ID must be a number",
      }),
      customerprojectid: Joi.number().required().messages({
        "any.required": "Customer project ID is required",
        "number.base": "Customer project ID must be a number",
      }),
      customerid: Joi.alternatives(
        Joi.number().allow(""),
        Joi.number()
      ).messages({
        "number.base": "Customer ID must be a number or empty",
      }),
    }).required();

    const { error } = schema.validate(result);
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0]?.message || "Validation error",
      });
    }

    const response = await service.getCustomerBuildings(result);

    if (
      !response ||
      typeof response.code !== "number" ||
      typeof response.status !== "boolean"
    ) {
      return res.status(500).send({
        status: false,
        message: "Unexpected error occurred while fetch customer data",
      });
    }

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
      response: response.response,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: false,
      message: "Failed to fetch customer data",
    });
  }
};

// approval

module.exports.loginApproval = async (req, res) => {
  try {
    const tenantid = req.headers["tenantid"];
    const userid = req.headers["userid"];
    const result = {
      ...req.body,
      tenantid,
      userid,
    };
    // console.log('result.key', result.key);

    let schema;
    switch (result.key) {
      case 1:
        schema = Joi.object({
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
          customerid: Joi.number().required().messages({
            "any.required": "Customer ID is required",
            "number.base": "Customer ID must be a number",
          }),
          companyid: Joi.number().required().messages({
            "any.required": "Company ID is required",
            "number.base": "Company ID must be a number",
          }),
        }).required();
        break;
      case 2:
        schema = Joi.object({
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
          customerid: Joi.number().required().messages({
            "any.required": "Customer ID is required",
            "number.base": "Customer ID must be a number",
          }),
        }).required();
        break;
      default:
        schema = Joi.object({
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
          customerid: Joi.number().required().messages({
            "any.required": "Customer ID is required",
            "number.base": "Customer ID must be a number",
          }),
        }).required();
        break;
    }

    const { error } = schema.validate(result);
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0]?.message || "Validation error",
      });
    }

    const response = await service.loginApproval(result);

    if (
      !response ||
      typeof response.code !== "number" ||
      typeof response.status !== "boolean"
    ) {
      return res.status(500).send({
        status: false,
        message: "Unexpected error occurred while updating customer status",
      });
    }

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
      notifydata: response.notifydata,
      mailProps: response.mailProps,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: false,
      message: "Failed to update customer status",
    });
  }
};

module.exports.editCustomerProfile = async (req, res) => {
  try {
    const tenantid = req.headers["tenantid"];
    const userid = req.headers["userid"];
    const result = {
      ...req.body,
      tenantid,
      userid,
    };

    const { customertype } = result;
    console.log("customertype", customertype);

    let schema;

    switch (customertype) {

      case 1:
        schema = Joi.object({
          customername: Joi.string().required().messages({
            "any.required": "Customer name is required",
            "string.base": "Customer name must be a string",
          }),
          customerimage: Joi.string().allow("").uri().messages({
            "string.base": "Customer image must be a string",
            "string.uri": "Customer image must be a valid URL",
          }),
          customerid: Joi.number().required().messages({
            "any.required": "Customer ID is required",
            "number.base": "Customer ID must be a number",
          }),
          customercompanyname: Joi.string().required().messages({
            "any.required": "Customer Company name is required",
            "string.base": "Customer Company name must be a string",
          }),
          customerprimaryemail: Joi.string().email().required().messages({
            "any.required": "Primary Email is required",
            "string.email": "Primary Email must be a valid email address",
            "string.valid":
              "Primary Email can be empty or a valid email address",
          }),
          customeralteremail: Joi.alternatives()
            .try(Joi.string().email(), Joi.string().valid(""))
            .required()
            .messages({
              "any.required": "Primary Email is required",
              "string.email": " PrimaryEmail must be a valid email address",
              "string.valid":
                " Primary Email can be empty or a valid email address",
            }),
          customerprimarycontact: Joi.string().required().messages({
            "any.required": "Primary Contact number is required",
            "string.base": "Primary Contact number must be a string",
          }),
          customeraltercontact: Joi.alternatives()
            .try(Joi.string().allow(""), Joi.string())
            .messages({
              "string.base": "Alternative date must be a string or empty",
            }),
          customertype: Joi.number().required().messages({
            "any.required": "Customer type ID is required",
            "number.base": "Customer type must be a number",
          }),
          customerprojects: Joi.array()
            .items(
              Joi.object({
                projectname: Joi.string().required().messages({
                  "any.required": "Project name is required",
                  "string.base": "Project name must be a string",
                }),
                buildings: Joi.array()
                  .items(
                    Joi.string().messages({
                      "string.base": "Building name must be a valid string",
                    })
                  )
                  .required()
                  .messages({
                    "any.required": "Building name is required",
                  }),
              })
            )
            .required()
            .messages({
              "any.required": "Customer projects are required",
            }),
          customercompanyemail: Joi.alternatives()
            .try(Joi.string().email(), Joi.string().valid(""))
            .required()
            .messages({
              "any.required": "Company email is required",
              "string.email": "Company email must be a valid email address",
              "string.valid":
                "Company email can be empty or a valid email address",
            }),
          customercompanyaddress: Joi.alternatives(
            Joi.string().allow(""),
            Joi.string()
          ).messages({
            "number.base": "Address must be a string or empty",
          }),
          countryid: Joi.alternatives(
            Joi.number().allow(""),
            Joi.number()
          ).messages({
            "number.base": "Country ID must be a number or empty",
          }),
          stateid: Joi.alternatives(
            Joi.number().allow(""),
            Joi.number()
          ).messages({
            "number.base": "State ID must be a number or empty",
          }),
          cityid: Joi.alternatives(
            Joi.number().allow(""),
            Joi.number()
          ).messages({
            "number.base": "City ID must be a number or empty",
          }),
          customeraddress: Joi.optional(),
          tenantid: Joi.number().required().messages({
            "any.required": "Tenant ID is required",
            "number.base": "Tenant ID must be a number",
          }),
          userid: Joi.number().required().messages({
            "any.required": "User ID is required",
            "number.base": "User ID must be a number",
          }),
        }).required();

        break;

      case 2:
        schema = Joi.object({
          customername: Joi.string().required().messages({
            "any.required": "Customer name is required",
            "string.base": "Customer name must be a string",
          }),
          customeraddress: Joi.string().required().messages({
            "any.required": "Customer adcustomeraddress is required",
            "string.base": "Customer adcustomeraddress must be a string",
          }),
          customerimage: Joi.string().allow("").uri().messages({
            "string.base": "Customer image must be a string",
            "string.uri": "Customer image must be a valid URL",
          }),
          customerid: Joi.number().required().messages({
            "any.required": "Customer ID is required",
            "number.base": "Customer ID must be a number",
          }),
       
          customertype: Joi.number().required().messages({
            "any.required": "Customer type ID is required",
            "number.base": "Customer type must be a number",
          }),
          customerprimaryemail: Joi.string().email().required().messages({
            "any.required": "Primary Email is required",
            "string.email": "Primary Email must be a valid email address",
            "string.valid":
              "Primary Email can be empty or a valid email address",
          }),
          customeralteremail: Joi.alternatives()
            .try(Joi.string().email(), Joi.string().valid(""))
            .required()
            .messages({
              "any.required": "Primary Email is required",
              "string.email": " PrimaryEmail must be a valid email address",
              "string.valid":
                " Primary Email can be empty or a valid email address",
            }),
          customerprimarycontact: Joi.string().required().messages({
            "any.required": "Primary Contact number is required",
            "string.base": "Primary Contact number must be a string",
          }),
          customeraltercontact: Joi.alternatives()
            .try(Joi.string().allow(""), Joi.string())
            .messages({
              "string.base": "Alternative date must be a string or empty",
            }),
          customeraddress: Joi.string().required().messages({
            "any.required": "Customer Address is required",
            "string.base": "Customer Address must be a string",
          }),
          countryid: Joi.alternatives(
            Joi.number().allow(""),
            Joi.number()
          ).messages({
            "number.base": "Country ID must be a number or empty",
          }),
          stateid: Joi.alternatives(
            Joi.number().allow(""),
            Joi.number()
          ).messages({
            "number.base": "State ID must be a number or empty",
          }),
          cityid: Joi.alternatives(
            Joi.number().allow(""),
            Joi.number()
          ).messages({
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
          customerprojects: Joi.array()
            .items(
              Joi.object({
                projectname: Joi.string().required().messages({
                  "any.required": "Project name is required",
                  "string.base": "Project name must be a string",
                }),
                buildings: Joi.array()
                  .items(
                    Joi.string().messages({
                      "string.base": "Building name must be a valid string",
                    })
                  )
                  .required()
                  .messages({
                    "any.required": "Building name is required",
                  }),
              })
            )
            .required()
            .messages({
              "any.required": "Customer projects are required",
            }),
        }).required();
        break;
    }

    const { error } = schema.validate(result);

    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details.map((err) => err.message),
      });
    }

    const response = await service.editCustomerProfile(result);

    if (
      !response ||
      typeof response.code !== "number" ||
      typeof response.status !== "boolean"
    ) {
      return res.status(500).send({
        status: false,
        message: "Unexpected error occurred while update profile",
      });
    }

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
    });
  } catch (error) {
    console.error("Error in editCustomer:", error);
    return res.status(500).send({
      status: false,
      message: "Internal server error: failed to update profile",
    });
  }
};


module.exports.getCustomerProfileById = async (req, res) => {
  try {
    const tenantid = req.headers["tenantid"];
    const userid = req.headers["userid"];
    const result = {
      ...req.body,
      tenantid,
      userid,
    };

    const schema = Joi.object({
      customerid: Joi.number().required().messages({
        "any.required": "Customer ID is required",
        "number.base": "Customer ID must be a number",
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

    const response = await service.getCustomerProfileById(result);

    if (
      !response ||
      typeof response.code !== "number" ||
      typeof response.status !== "boolean"
    ) {
      return res.status(500).send({
        status: false,
        message: "Unexpected error occurred while retrieve customer data",
      });
    }

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
      response: response.response,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: false,
      message: "Failed to retrieve customer data",
    });
  }
};


module.exports.getCustomerCompany = async (req, res) => {
  try {
    const tenantid = req.headers["tenantid"];
    const result = {
      ...req.body,
      tenantid,
    };
    const schema = Joi.object({
      companyid: Joi.number().required().messages({
        "any.required": "Company ID is required",
        "number.base": "Company ID must be a number",
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
    const response = await service.getCustomerCompany(result);
    // Safety check to ensure response object is properly structured
    if (
      !response ||
      typeof response.code !== "number" ||
      typeof response.status !== "boolean"
    ) {
      return res.status(200).send({
        status: false,
        message: "Unexpected error occurred while fetch customer company",
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
      message: "Failed to fetch customer company data",
      response: [],
    });
  }
};
