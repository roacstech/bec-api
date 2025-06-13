const _ = require('lodash')
const Joi = require('joi')
const service = require('../service/index')

module.exports.addLeadStage = async (req, res) => {
  try {
    const tenantid = req.headers['tenantid']
    const userid = req.headers['userid']
    const result = {
      ...req.body,
      tenantid,
      userid
    }

    const schema = Joi.object({
      leadstagename: Joi.string().required().messages({
        'any.required': 'Lead stage name is required',
        'string.base': 'Lead stage name must be a string'
      }),
      leadstageimage: Joi.string().allow('').uri().messages({
        'string.base': 'Lead stage image must be a string',
        'string.uri': 'Lead stage image must be a valid URL'
      }),
      tenantid: Joi.number().required().messages({
        'any.required': 'Tenant ID is required',
        'number.base': 'Tenant ID must be a number'
      }),
      userid: Joi.number().required().messages({
        'any.required': 'User ID is required',
        'number.base': 'User ID must be a number'
      })
    }).required()

    const { error } = schema.validate(result)
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0]?.message || 'Validation error'
      })
    }

    const response = await service.addLeadStage(result)

    if (
      !response ||
      typeof response.code !== 'number' ||
      typeof response.status !== 'boolean'
    ) {
      return res.status(500).send({
        status: false,
        message: 'Unexpected error occurred while creating lead stage'
      })
    }

    return res.status(response.code).send({
      status: response.status,
      message: response.message
    })
  } catch (err) {
    console.log(err)
    return res.status(500).send({
      status: false,
      message: 'Failed to add lead stage'
    })
  }
}

module.exports.editLeadStage = async (req, res) => {
  try {
    const tenantid = req.headers['tenantid']
    const userid = req.headers['userid']
    const result = {
      ...req.body,
      tenantid,
      userid
    }

    const schema = Joi.object({
      leadstageid: Joi.number().required().messages({
        'any.required': 'Lead stage ID is required',
        'number.base': 'Lead stage ID must be a number'
      }),
      leadstagename: Joi.string().required().messages({
        'any.required': 'Lead stage name is required',
        'string.base': 'Lead stage name must be a string'
      }),
      leadstageimage: Joi.string().allow('').uri().messages({
        'string.base': 'Lead stage image must be a string',
        'string.uri': 'Lead stage image must be a valid URL'
      }),
      tenantid: Joi.number().required().messages({
        'any.required': 'Tenant ID is required',
        'number.base': 'Tenant ID must be a number'
      }),
      userid: Joi.number().required().messages({
        'any.required': 'User ID is required',
        'number.base': 'User ID must be a number'
      })
    }).required()

    const { error } = schema.validate(result)
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0]?.message || 'Validation error'
      })
    }

    const response = await service.editLeadStage(result)

    if (
      !response ||
      typeof response.code !== 'number' ||
      typeof response.status !== 'boolean'
    ) {
      return res.status(500).send({
        status: false,
        message: 'Unexpected error occurred while editing lead stage'
      })
    }

    return res.status(response.code).send({
      status: response.status,
      message: response.message
    })
  } catch (err) {
    console.log(err)
    return res.status(500).send({
      status: false,
      message: 'Failed to edit lead stage'
    })
  }
}

module.exports.getLeadStage = async (req, res) => {
  try {
    const tenantid = req.headers['tenantid']
    const userid = req.headers['userid']
    const result = {
      ...req.body,
      tenantid,
      userid
    }

    const schema = Joi.object({
      key: Joi.number().required().messages({
        'any.required': 'Key ID is required',
        'number.base': 'Key ID must be a number'
      }),
      tenantid: Joi.number().required().messages({
        'any.required': 'Tenant ID is required',
        'number.base': 'Tenant ID must be a number'
      }),
      userid: Joi.number().required().messages({
        'any.required': 'User ID is required',
        'number.base': 'User ID must be a number'
      }),
      leadstageid: Joi.alternatives(
        Joi.number().allow(''),
        Joi.number()
      ).messages({
        'number.base': 'Lead Stage ID must be a number or empty'
      })
    }).required()

    const { error } = schema.validate(result)
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0]?.message || 'Validation error'
      })
    }

    const response = await service.getLeadStage(result)

    if (
      !response ||
      typeof response.code !== 'number' ||
      typeof response.status !== 'boolean'
    ) {
      return res.status(500).send({
        status: false,
        message: 'Unexpected error occurred while fetch lead stage'
      })
    }

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
      response: response.response
    })
  } catch (err) {
    console.log(err)
    return res.status(500).send({
      status: false,
      message: 'Failed to retrieved lead stage data'
    })
  }
}

module.exports.updateLeadStageStatus = async (req, res) => {
  try {
    const tenantid = req.headers['tenantid']
    const userid = req.headers['userid']
    const result = {
      ...req.body,
      tenantid,
      userid
    }

    const schema = Joi.object({
      key: Joi.number().required().messages({
        'any.required': 'Key ID is required',
        'number.base': 'Key ID must be a number'
      }),
      tenantid: Joi.number().required().messages({
        'any.required': 'Tenant ID is required',
        'number.base': 'Tenant ID must be a number'
      }),
      userid: Joi.number().required().messages({
        'any.required': 'User ID is required',
        'number.base': 'User ID must be a number'
      }),
      leadstageid: Joi.number().required().messages({
        'any.required': 'Lead stage ID is required',
        'number.base': 'Lead stage ID must be a number'
      })
    }).required()

    const { error } = schema.validate(result)
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0]?.message || 'Validation error'
      })
    }

    const response = await service.updateLeadStageStatus(result)

    if (
      !response ||
      typeof response.code !== 'number' ||
      typeof response.status !== 'boolean'
    ) {
      return res.status(500).send({
        status: false,
        message: 'Unexpected error occurred while updating lead stage status'
      })
    }

    return res.status(response.code).send({
      status: response.status,
      message: response.message
    })
  } catch (err) {
    console.log(err)
    return res.status(500).send({
      status: false,
      message: 'Failed to update lead stage'
    })
  }
}
