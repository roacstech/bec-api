const { response } = require('express');
const service = require('../service/index');
const _ = require("lodash");

module.exports.counts = async (req, res) => {
  try {
    const tenantid = req.headers["tenantid"];
    const userid = req.headers["userid"];
    
    // Combine tenantid and userid into the result object
    const result = {
      ...req.body,
      tenantid,
      userid,
    };

    // Call the service to get counts
    const counts = await service.counts(result);

    // Validate if the service returned the expected structure
    if (_.isEmpty(counts)) {
      return res.status(404).send({
        status: false,
        message: "No counts found for the given parameters",
      });
    }

    // Return the successful counts response
    return res.status(200).send({
      status: true,
      message: "Counts retrieved successfully",
      response: counts,
    });

  } catch (error) {
    console.error("Error:", error);

    // Return error response in case of an internal error
    return res.status(500).send({
      status: false,
      message: "Failed to retrieve counts. Please try again later.",
    });
  }
};

module.exports.customercard = async (req, res) => {
  try {
    const tenantid = req.headers["tenantid"];
    const userid = req.headers["userid"];
    
    // Combine tenantid and userid into the result object
    const result = {
      ...req.body,
      tenantid,
      userid,
    };

    // Call the service to get response
    const response = await service.customercard(result);

    // Validate if the service returned the expected structure
    if (_.isEmpty(response)) {
      return res.status(404).send({
        status: false,
        message: "No response found for the given parameters",
      });
    }

    // Return the successful response response
    return res.status(200).send({
      status: true,
      message: "Response retrieved successfully",
      response: response,
    });

  } catch (error) {
    console.error("Error:", error);

    // Return error response in case of an internal error
    return res.status(500).send({
      status: false,
      message: "Failed to retrieve response. Please try again later.",
    });
  }
};


module.exports.getServiceRequestInsights = async (req, res) => {
  try {
    const tenantid = req.headers["tenantid"];
    const userid = req.headers["userid"];
    
    // Combine tenantid and userid into the result object
    const result = {
      ...req.body,
      tenantid,
      userid,
    };

    // Call the service to get response
    const response = await service.getServiceRequestInsights(result);

    // Validate if the service returned the expected structure
    if (_.isEmpty(response)) {
      return res.status(404).send({
        status: false,
        message: "No response found for the given parameters",
      });
    }

    // Return the successful response response
    return res.status(200).send({
      status: true,
      message: "Response retrieved successfully",
      response: response,
    });

  } catch (error) {
    console.error("Error:", error);

    // Return error response in case of an internal error
    return res.status(500).send({
      status: false,
      message: "Failed to retrieve response. Please try again later.",
    });
  }
};