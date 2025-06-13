const service = require('../service/index');
const _ = require('lodash');
const Joi = require('joi');

module.exports.createLeads = async (req, res) => {
  try {
    const db = global.dbConnection;

    // Define schema for validation
    const schema = Joi.object({
      leadname: Joi.string().required().messages({
        'any.required': 'Lead name is required',
        'string.base': 'Lead name must be a string',
      }),
      leademail: Joi.string().email().required().messages({
        'any.required': 'Email is required',
        'string.email': 'Email must be a valid email address',
      }),
      leadcontact: Joi.number().integer().positive().messages({
        'any.required': 'Phone number is required',
        'number.base': 'Phone number must be a number',
        'number.integer': 'Phone number must be an integer',
        'number.positive': 'Phone number must be a positive number',
      }),
      referraltypeid: Joi.number().integer().positive().required().messages({
        'any.required': 'Referral Type is required',
        'number.base': 'Referral Type ID must be a number',
        'number.integer': 'Referral Type ID must be an integer',
        'number.positive': 'Referral Type ID must be a positive number',
      }),
      counsellor: Joi.string().messages({
        'string.base': 'Counsellor must be a string',
      }),
    }).required();

    // Validate request data
    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0]?.message || 'Validation error',
      });
    }

    // Check if email already exists
    const existingEmail = await db('leads')
      .where({ leademail: value.leademail })
      .first();
    if (existingEmail) {
      return res.status(400).send({
        status: false,
        message: 'Email already exists',
      });
    }

    // Insert data into database
    const [insertedId] = await db('leads').insert(value);

    return res.status(201).send({
      status: true,
      message: 'Leads data saved successfully',
      data: { leadid: insertedId, ...value },
    });
  } catch (err) {
    console.error('Error saving leads data:', err);
    return res.status(500).send({
      status: false,
      message: 'Failed to save leads data',
    });
  }
};

module.exports.getLeadsById = async (req, res) => {
  try {
    const db = global.dbConnection;
    const { id } = req.params;

    // Ensure ID is a valid number
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return res
        .status(400)
        .send({ status: false, message: 'Invalid ID provided' });
    }

    // Fetch record by leadid
    const leadsData = await db('leads').where({ leadid: numericId }).first();

    if (!leadsData) {
      return res.status(404).send({ status: false, message: 'No data found' });
    }

    return res.status(200).send({ status: true, data: leadsData });
  } catch (err) {
    console.error('Error fetching leads data by ID:', err);
    return res.status(500).send({ status: false, message: 'Server error' });
  }
};

// module.exports.getAllLeads = async (req, res) => {
//   try {
//     const tenantid = req.headers["tenantid"];
//     const userid = req.headers["userid"];
//     const roleid = req.headers["roleid"];

//     const result = {
//       ...req.body,
//       tenantid,
//       userid,
//       roleid,
//     };

//     const schema = Joi.object({
//       leadid: Joi.alternatives(Joi.number().allow(""), Joi.number()).messages({
//         "number.base": "Lead ID must be a number or empty",
//       }),
//       leadstatusid: Joi.alternatives(
//         Joi.number().allow(""),
//         Joi.number()
//       ).messages({
//         "number.base": "Lead status id must be a number or empty",
//       }),
//       companyid: Joi.alternatives(
//         Joi.number().allow(""),
//         Joi.number()
//       ).messages({
//         "number.base": "Company ID must be a number or empty",
//       }),
//       // all: Joi.number().required().messages({
//       //   "any.required": "all is required",
//       //   "number.base": "all must be a number",
//       // }),
//       from: Joi.alternatives()
//         .try(Joi.string().allow(""), Joi.date())
//         .messages({
//           "string.base": "Followup date must be a string or empty",
//         }),
//       to: Joi.alternatives().try(Joi.string().allow(""), Joi.date()).messages({
//         "string.base": "Followup date must be a string or empty",
//       }),
//       limit: Joi.alternatives(Joi.number().allow(""), Joi.number()).messages({
//         "number.base": "Limit must be a number or empty",
//       }),
//       offset: Joi.alternatives(Joi.number().allow(""), Joi.number()).messages({
//         "number.base": "Offset must be a number or empty",
//       }),
//       roleid: Joi.number().required().messages({
//         "any.required": "Role ID is required",
//         "number.base": "Role ID must be a number",
//       }),
//       tenantid: Joi.number().required().messages({
//         "any.required": "Tenant ID is required",
//         "number.base": "Tenant ID must be a number",
//       }),
//       userid: Joi.number().required().messages({
//         "any.required": "User ID is required",
//         "number.base": "User ID must be a number",
//       }),
//     }).required();

//     const { error } = schema.validate(result);
//     if (error) {
//       return res.status(400).send({
//         status: false,
//         message: error.details[0]?.message || "Validation error",
//       });
//     }
//     const response = await service.getAllLeads(result);

//     const response1 = await service.getAllLeadsCount(result);

//     if (!_.isEmpty(response)) {
//       return res.status(response.code).send({
//         status: response.status,
//         message: response.message,
//         response: response.response,
//         count: response1,
//       });
//     }
//   } catch (error) {
//     console.log("error", error);
//     return res.status(400).send({
//       status: false,
//       message: "Failed to retrieve lead data",
//       response: [],
//     });
//   }
// };

module.exports.editLead = async (req, res) => {
  try {
    const db = global.dbConnection;
    const { leadid, leadname, leademail, leadcontact, referraltypeid } =
      req.body;

    // Validate request data
    const schema = Joi.object({
      leadid: Joi.number().integer().positive().required().messages({
        'any.required': 'Lead ID is required',
        'number.base': 'Lead ID must be a number',
        'number.integer': 'Lead ID must be an integer',
        'number.positive': 'Lead ID must be positive',
      }),
      leadname: Joi.string().optional(),
      leademail: Joi.string().email().optional(),
      leadcontact: Joi.number().integer().positive().optional(),
      referraltypeid: Joi.number().integer().positive().optional().messages({
        'number.base': 'Referral Type ID must be a number',
        'number.integer': 'Referral Type ID must be an integer',
        'number.positive': 'Referral Type ID must be a positive number',
      }),
    }).required();

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0]?.message || 'Validation error',
      });
    }

    // Ensure leadid is valid
    const numericId = parseInt(value.leadid, 10);
    if (isNaN(numericId)) {
      return res.status(400).send({
        status: false,
        message: 'Invalid Lead ID provided',
      });
    }

    // Check if lead exists
    const existingLead = await db('leads').where({ leadid: numericId }).first();
    if (!existingLead) {
      return res.status(404).send({
        status: false,
        message: 'Lead not found',
      });
    }

    // Check if email already exists if it's provided
    if (value.leademail && value.leademail !== existingLead.leademail) {
      const existingEmail = await db('leads')
        .where({ leademail: value.leademail })
        .first();
      if (existingEmail) {
        return res.status(400).send({
          status: false,
          message: 'Email already exists',
        });
      }
    }

    // Update lead data in the database
    await db('leads').where({ leadid: numericId }).update(value);

    return res.status(200).send({
      status: true,
      message: 'Lead updated successfully',
      data: { leadid: numericId, ...value },
    });
  } catch (err) {
    console.error('Error updating lead:', err);
    return res.status(500).send({ status: false, message: 'Server error' });
  }
};

module.exports.getAllLeads = async (req, res) => {
  try {
    const db = global.dbConnection;

    // Fetch all leads
    const leadsData = await db('leads')
      .leftJoin(
        'referral_types',
        'leads.referraltypeid',
        'referral_types.referraltypeid'
      )
      .orderBy('leadid', 'DESC');

    if (leadsData.length === 0) {
      return res.status(404).send({ status: false, message: 'No leads found' });
    }

    return res.status(200).send({ status: true, data: leadsData });
  } catch (err) {
    console.error('Error fetching all leads:', err);
    return res.status(500).send({ status: false, message: 'Server error' });
  }
};

module.exports.deleteLead = async (req, res) => {
  try {
    const db = global.dbConnection;

    // Define Joi schema for validating leadid
    const schema = Joi.object({
      leadid: Joi.number().integer().positive().required().messages({
        'any.required': 'Lead ID is required',
        'number.base': 'Lead ID must be a number',
        'number.integer': 'Lead ID must be an integer',
        'number.positive': 'Lead ID must be a positive number',
      }),
    });

    // Validate the request body against the schema
    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0]?.message || 'Validation error',
      });
    }

    const { leadid } = value; // Extract leadid from validated body

    // Check if lead exists
    const existingLead = await db('leads').where({ leadid }).first();
    if (!existingLead) {
      return res.status(404).send({
        status: false,
        message: 'Lead not found',
      });
    }

    // Delete lead from the database
    await db('leads').where({ leadid }).del();

    return res.status(200).send({
      status: true,
      message: 'Lead deleted successfully',
    });
  } catch (err) {
    console.error('Error deleting lead:', err);
    return res.status(500).send({ status: false, message: 'Server error' });
  }
};

module.exports.updateLeadStatus = async (req, res) => {
  try {
    const response = await service.updateLeadStatus(req.body);

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
      data: response.data || null, // Ensure `data` is always present
    });
  } catch (error) {
    console.error('Error updating lead status:', error);

    return res.status(500).send({
      status: false,
      message: 'Internal server error!',
    });
  }
};
