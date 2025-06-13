const service = require("../service/index");
const _ = require("lodash");
const Joi = require("joi");

module.exports.getleadbyemployeeid = async (req, res) => {
  try {
    // const tenantid = req.headers["tenantid"];
    // const userid = req.headers["userid"];
    // const result = {
    //   ...req.body,
    //   tenantid,
    //   userid,
    // };

    // console.log('apsrams', req.body)

    const response = await service.getLeadByEmployeeId(req.body);

    

    // Safety check to ensure response object is properly structured
    if (
      !response ||
      typeof response.code !== "number" ||
      typeof response.status !== "boolean"
    ) {
      return res.status(200).send({
        status: false,
        message: "Unexpected error occurred while getting lead details",
      });
    }

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
      response:  response.response,

    });
  } catch (err) {
    console.log(err);
    return res.send({
      status: false,
      message: "Failed to getting lead details",
    });
  }
};

module.exports.employeeSiteVisit = async (req, res) => {
  try {
    const tenantid = req.headers["tenantid"];
    const userid = req.headers["userid"];
    const result = {
      ...req.body,
      tenantid,
      userid,
    };

    const response = await service.employeeSiteVisit(result);

    // Safety check to ensure response object is properly structured
    if (
      !response ||
      typeof response.code !== "number" ||
      typeof response.status !== "boolean"
    ) {
      return res.status(200).send({
        status: false,
        message: "Unexpected error occurred while employee Site Visit",
      });
    }

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
      response:  response.response,

    });
  } catch (err) {
    console.log(err);
    return res.send({
      status: false,
      message: "Failed to employee Site Visit",
    });
  }
};


module.exports.getLeadSiteVisitDetails = async (req, res) => {
  try {
    // const tenantid = req.headers["tenantid"];
    // const userid = req.headers["userid"];
    // const result = {
    //   ...req.body,
    //   tenantid,
    //   userid,
    // };

    console.log('apsrams', req.body)

    const response = await service.getLeadSiteVisitDetails(req.body);

    

    // Safety check to ensure response object is properly structured
    if (
      !response ||
      typeof response.code !== "number" ||
      typeof response.status !== "boolean"
    ) {
      return res.status(200).send({
        status: false,
        message: "Unexpected error occurred while getting lead details",
      });
    }

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
      response:  response.response,

    });
  } catch (err) {
    console.log(err);
    return res.send({
      status: false,
      message: "Failed to getting lead details",
    });
  }
};