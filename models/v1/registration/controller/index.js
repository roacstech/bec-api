const service = require("../service/index");
const _ = require("lodash");
const Joi = require("joi");

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

