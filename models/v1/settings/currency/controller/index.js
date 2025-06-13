const service = require("../service/index");
const Joi = require("joi");
const _ = require("lodash");


module.exports.getCurrency = async (req, res) => {
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
        currencyid: Joi.alternatives(
          Joi.number().allow(""),
          Joi.number()
        ).messages({
          "number.base": "Currency ID must be a number or empty",
        }),
      }).required();
  
      const { error } = schema.validate(result);
      if (error) {
        return res.status(400).send({
          status: false,
          message: error.details[0]?.message || "Validation error",
        });
      }
  
      const response = await service.getCurrency(result);
  
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