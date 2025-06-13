const service = require('../service/index');
const _ = require('lodash');
const Joi = require('joi');
const passport = require('passport');

module.exports.registration = async (req, res) => {
  console.log('req.body', req.body);
  try {
    const result = {
      ...req.body,
    };

    console.log('result', result);

    const schema = Joi.object({
      knowaboutoffice: Joi.string().required().messages({
        'string.base': 'Know about office must be a string',
      }),
      passportstatus: Joi.number().required().messages({
        'number.base': 'Passport status must be a number',
      }),
      passportexpirydate: Joi.alternatives().conditional('passportstatus', {
        is: 1,
        then: Joi.string().required().messages({
          'string.base': 'Passport expiry date must be a string',
          'any.required': 'Passport expiry date is required',
        }),
        otherwise: Joi.string().allow('', null),
      }),

      studentfirstname: Joi.string().required().messages({
        'any.required': 'Student first name is required',
        'string.base': 'Student first name must be a string',
      }),
      studentlastname: Joi.string().required().messages({
        'any.required': 'Student last name is required',
        'string.base': 'Student last name must be a string',
      }),
      studentdob: Joi.string().required().messages({
        'string.base': 'Student DOB must be a string',
      }),
      studentemail: Joi.string().email().required().messages({
        'string.base': 'Student email must be a string',
        'string.email': 'Student email must be a valid email address',
      }),
      studentmobile: Joi.number().required().messages({
        'string.base': 'Student mobile must be a string',
      }),
      parentcontact: Joi.number().required().messages({
        'string.base': 'Parent contact must be a string',
      }),
      address: Joi.string().required().messages({
        'string.base': 'Address must be a string',
      }),

      academicdetails: Joi.array()
        .items(
          Joi.object({
            academicid: Joi.number().required().messages({
              'number.base': 'Academic ID must be a number',
            }),
            university: Joi.string().required().messages({
              'any.required': 'University is required',
              'string.base': 'University must be a string',
            }),
            yop: Joi.string().required().messages({
              'any.required': 'Year of passing is required',
              'string.base': 'Year of passing must be a string',
            }),
            percentage: Joi.string().required().messages({
              'any.required': 'Percentage is required',
              'string.base': 'Percentage must be a string',
            }),
            numofarrears: Joi.string().required().messages({
              'any.required': 'Number of arrears is required',
              'string.base': 'Number of arrears must be a string',
            }),
          })
        )
        .required()
        .messages({
          'any.required': 'Academic details are required',
          'array.base': 'Academic details must be an array',
        }),

      currentstatus: Joi.number().required().messages({
        'number.base': 'Current status must be a number',
      }),
      currentstatusdescription: Joi.string().required().messages({
        'string.base': 'Current status description must be a string',
      }),

      languagetest: Joi.array()
        .items(
          Joi.object({
            languagetestid: Joi.number().required().messages({
              'number.base': 'Language test ID must be a number',
            }),
            speaking: Joi.string().min(1).required().messages({
              'string.empty': 'Speaking score is required',
            }),
            reading: Joi.string().min(1).required().messages({
              'string.empty': 'Reading score is required',
            }),
            writing: Joi.string().min(1).required().messages({
              'string.empty': 'Writing score is required',
            }),
            listening: Joi.string().min(1).required().messages({
              'string.empty': 'Listening score is required',
            }),
          })
        )
        .required()
        .messages({
          'any.required': 'Language test details are required',
          'array.base': 'Language test details must be an array',
        }),

      interestedcourse: Joi.array()
        .items(
          Joi.number().messages({
            'number.base': 'Course ID must be a number',
          })
        )
        .min(1)
        .required()
        .messages({
          'any.required': 'Interested course details are required',
          'array.base': 'Interested courses must be an array',
          'array.min': 'Please select at least one course',
        }),

      studentgap: Joi.number().required().messages({
        'number.base': 'Student gap must be a number',
      }),
      studentgapdescription: Joi.string().when('studentgap', {
        is: 1,
        then: Joi.required().messages({
          'string.empty': 'Please enter the student gap description',
        }),
        otherwise: Joi.optional(),
      }),

      interestedcountry: Joi.array()
        .items(
          Joi.number().messages({
            'number.base': 'Country ID must be a number',
          })
        )
        .min(1)
        .required()
        .messages({
          'any.required': 'Interested country details are required',
          'array.base': 'Interested countries must be an array',
          'array.min': 'Please select at least one country',
        }),

      marritalstatus: Joi.number().required().messages({
        'number.base': 'Marital status must be a number',
      }),

      dateofmarriage: Joi.alternatives().conditional('marritalstatus', {
        is: 1,
        then: Joi.string().required().messages({
          'string.base': 'Date of marriage must be a string',
          'any.required': 'Date of marriage is required when married',
        }),
        otherwise: Joi.string().allow(''),
      }),

      kids: Joi.alternatives().conditional('marritalstatus', {
        is: 1,
        then: Joi.number().required().messages({
          'number.base': 'Number of kids must be a number',
          'any.required': 'Number of kids is required when married',
        }),
        otherwise: Joi.valid(null),
      }),

      spousedob: Joi.alternatives().conditional('marritalstatus', {
        is: 1,
        then: Joi.string().required().messages({
          'string.base': 'Spouse DOB must be a string',
          'any.required': 'Spouse DOB is required when married',
        }),
        otherwise: Joi.string().allow(''),
      }),

      spouseresume: Joi.alternatives().conditional('marritalstatus', {
        is: 1,
        then: Joi.string().uri().required().messages({
          'string.base': 'Spouse resume must be a valid URL',
          'any.required': 'Spouse resume is required when married',
        }),
        otherwise: Joi.valid(''),
      }),

      fatheroccupation: Joi.string().required().messages({
        'string.base': 'Father occupation must be a string',
      }),
      motheroccupation: Joi.string().required().messages({
        'string.base': 'Mother occupation must be a string',
      }),
      sibilings: Joi.number().required().messages({
        'number.base': 'Siblings count must be a number',
      }),
      parentsincome: Joi.string().required().messages({
        'string.base': "Parents' income must be a string",
      }),
      additionalsponsers: Joi.string().optional().allow('').messages({
        'string.base': 'Additional sponsors must be a string',
      }),
      additionalsponsersrelationship: Joi.string()
        .optional()
        .allow('')
        .messages({
          'string.base': 'Additional sponsors relationship must be a string',
        }),
      additionalsponsersincome: Joi.string().optional().allow('').messages({
        'string.base': 'Additional sponsors income must be a string',
      }),
      appliedotheruniversitydescription: Joi.string().required().messages({
        'string.base': 'Applied other university description must be a string',
      }),
      visitothercountries: Joi.number().required().messages({
        'number.base': 'Visit other countries must be a number',
      }),
      visitothercountriesdescription: Joi.string().when('visitothercountries', {
        is: 1,
        then: Joi.required().messages({
          'string.empty': 'Please enter the visit other countries description',
        }),
        otherwise: Joi.optional(),
      }),
      visarefusal: Joi.number().required().messages({
        'number.base': 'Visa refusal must be a number',
      }),
      visarefusaldescription: Joi.string().when('visarefusal', {
        is: 1,
        then: Joi.required().messages({
          'string.empty': 'Please enter visa refusal description',
        }),
        otherwise: Joi.optional(),
      }),
      familyinoverseas: Joi.number().required().messages({
        'number.base': 'Family in overseas must be a number',
      }),

      familyinoverseascountry: Joi.number().when('familyinoverseas', {
        is: 1,
        then: Joi.required().messages({
          'number.base': 'Please select a country where your family resides',
          'any.required': 'Please select the family overseas country',
        }),
        otherwise: Joi.optional(),
      }),
      familyinoverseasrelationship: Joi.string().when('familyinoverseas', {
        is: 1,
        then: Joi.required().messages({
          'string.base': 'Family in overseas relationship must be a string',
          'any.required': 'Please enter family overseas relationship',
        }),
        otherwise: Joi.optional(),
      }),

      counselorcomments: Joi.string().optional().allow('').messages({
        'string.base': 'Counselor comments must be a string',
      }),
    }).required();

    const { error } = schema.validate(result);
    if (error) {
      console.log('errors', error);
      return res.status(400).send({
        status: false,
        message: error.details[0]?.message || 'Validation error',
      });
    }

    const response = await service.registration(result);

    // console.log('res', response);

    if (
      !response ||
      typeof response.code !== 'number' ||
      typeof response.status !== 'boolean'
    ) {
      return res.status(500).send({
        status: false,
        message: 'Unexpected error occurred while creating student',
      });
    }

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
      notifydata: response.notifydata,
      mailProps: response.mailProps,
    });
  } catch (error) {
    console.error('Error in createstudent:', error);
    return res.status(500).send({
      status: false,
      message: 'Internal server error: failed to create student',
    });
  }
};

module.exports.getStudent = async (req, res) => {
  try {
    const result = {
      ...req.body,
    };
    const { studentid, studentemail, studentmobile } = result;

    // Validation schema
    const schema = Joi.object({
      studentid: Joi.number().optional().messages({
        'number.base': 'Student ID must be a number',
      }),
      studentemail: Joi.string().email().optional().messages({
        'string.email': 'Student email must be a valid email address',
      }),
      studentmobile: Joi.string().optional().messages({
        'string.base': 'Student mobile must be a string',
      }),
      approvalstatus: Joi.number().optional().messages({
        'number.base': 'Approval status must be a number',
      }),
    }).required();

    const { error } = schema.validate(result);

    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0]?.message || 'Validation error',
      });
    }

    // Call service function
    const response = await service.getStudent(result);

    if (
      !response ||
      typeof response.code !== 'number' ||
      typeof response.status !== 'boolean'
    ) {
      return res.status(500).send({
        status: false,
        message: 'Unexpected error occurred while fetching student details',
      });
    }

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
      response: response.response,
    });
  } catch (error) {
    console.error('Error in getStudent:', error);
    return res.status(500).send({
      status: false,
      message: 'Internal server error: failed to fetch student details',
    });
  }
};

module.exports.editStudent = async (req, res) => {
  try {
    const userid = req.headers['userid'];
    const result = {
      ...req.body,
      userid,
    };

    const schema = Joi.object({
      studentid: Joi.number().required().messages({
        'any.required': 'Student ID is required',
        'number.base': 'Student ID must be a number',
      }),
      userid: Joi.number().required().messages({
        'any.required': 'User id is required',
        'number.base': 'User id must be a number',
      }),
      studentfirstname: Joi.string().required().messages({
        'any.required': 'Student first name is required',
        'string.base': 'Student first name must be a string',
      }),
      studentlastname: Joi.string().required().messages({
        'any.required': 'Student last name is required',
        'string.base': 'Student last name must be a string',
      }),
      studentdob: Joi.string().required().messages({
        'string.base': 'Student DOB must be a string',
      }),
      studentemail: Joi.string().email().required().messages({
        'string.base': 'Student email must be a string',
        'string.email': 'Student email must be a valid email address',
      }),
      studentmobile: Joi.string().required().messages({
        'string.base': 'Student mobile must be a string',
      }),
      parentcontact: Joi.string().required().messages({
        'string.base': 'Parent contact must be a string',
      }),
      address: Joi.string().required().messages({
        'string.base': 'Address must be a string',
      }),
      currentstatus: Joi.number().required().messages({
        'number.base': 'Current status must be a number',
      }),
      currentstatusdescription: Joi.string().required().messages({
        'string.base': 'Current status description must be a string',
      }),
      studentgap: Joi.number().required().messages({
        'number.base': 'Student gap must be a number',
      }),
      studentgapdescription: Joi.string().required().messages({
        'string.base': 'Student gap description must be a string',
      }),
      marritalstatus: Joi.number().required().messages({
        'number.base': 'Marital status must be a number',
      }),
      dateofmarriage: Joi.string().allow('').messages({
        'string.base': 'Date of marriage must be a string',
      }),
      kids: Joi.number().required().messages({
        'number.base': 'Number of kids must be a number',
      }),
      spousedob: Joi.string().allow('').messages({
        'string.base': 'Spouse DOB must be a string',
      }),
      spouseresume: Joi.number().optional().messages({
        'number.base': 'Spouse resume must be a number',
      }),
      fatheroccupation: Joi.string().required().messages({
        'string.base': 'Father occupation must be a string',
      }),
      motheroccupation: Joi.string().required().messages({
        'string.base': 'Mother occupation must be a string',
      }),
      sibilings: Joi.number().required().messages({
        'number.base': 'Siblings count must be a number',
      }),
      parentsincome: Joi.string().required().messages({
        'string.base': "Parents' income must be a string",
      }),
      additionalsponsers: Joi.string().required().messages({
        'string.base': 'Additional sponsors must be a string',
      }),
      additionalsponsersrelationship: Joi.string().required().messages({
        'string.base': 'Additional sponsors relationship must be a string',
      }),
      additionalsponsersincome: Joi.string().required().messages({
        'string.base': 'Additional sponsors income must be a string',
      }),
      appliedotheruniversitydescription: Joi.string().required().messages({
        'string.base': 'Applied other university description must be a string',
      }),
      visitothercountries: Joi.number().required().messages({
        'number.base': 'Visit other countries must be a number',
      }),
      visitothercountriesdescription: Joi.string().required().messages({
        'string.base': 'Visit other countries description must be a string',
      }),
      visarefusal: Joi.number().required().messages({
        'number.base': 'Visa refusal must be a number',
      }),
      visarefusaldescription: Joi.string().allow('').messages({
        'string.base': 'Visa refusal description must be a string',
      }),
      familyinoverseas: Joi.number().required().messages({
        'number.base': 'Family in overseas must be a number',
      }),
      familyinoverseascountry: Joi.number().required().messages({
        'number.base': 'Family in overseas country must be a number',
      }),
      familyinoverseasrelationship: Joi.string().required().messages({
        'string.base': 'Family in overseas relationship must be a string',
      }),
      counselorcomments: Joi.string().required().messages({
        'string.base': 'Counselor comments must be a string',
      }),
      knowaboutoffice: Joi.string().required().messages({
        'string.base': 'Know about office must be a string',
      }),
      passportstatus: Joi.number().required().messages({
        'number.base': 'Passport status must be a number',
      }),
      passportexpirydate: Joi.string().required().messages({
        'string.base': 'Passport expiry date must be a string',
      }),
      academicdetails: Joi.array()
        .items(
          Joi.object({
            academicid: Joi.number().required().messages({
              'number.base': 'Academic ID must be a number',
            }),
            university: Joi.string().required().messages({
              'any.required': 'University is required',
              'string.base': 'University must be a string',
            }),
            yop: Joi.string().required().messages({
              'any.required': 'Year of passing is required',
              'string.base': 'Year of passing must be a string',
            }),
            percentage: Joi.string().required().messages({
              'any.required': 'Percentage is required',
              'string.base': 'Percentage must be a string',
            }),
            numofarrears: Joi.string().required().messages({
              'any.required': 'Number of arrears is required',
              'string.base': 'Number of arrears must be a string',
            }),
          })
        )
        .required()
        .messages({
          'any.required': 'Academic details are required',
          'array.base': 'Academic details must be an array',
        }),
      languagetest: Joi.array()
        .items(
          Joi.object({
            languagetestid: Joi.number().required().messages({
              'number.base': 'Language test ID must be a number',
            }),
            speaking: Joi.string().required().messages({
              'any.required': 'Speaking score is required',
              'string.base': 'Speaking score must be a string',
            }),
            reading: Joi.string().required().messages({
              'any.required': 'Reading score is required',
              'string.base': 'Reading score must be a string',
            }),
            writing: Joi.string().required().messages({
              'any.required': 'Writing score is required',
              'string.base': 'Writing score must be a string',
            }),
            listening: Joi.string().required().messages({
              'any.required': 'listening score is required',
              'string.base': 'listening score must be a string',
            }),
          })
        )
        .required()
        .messages({
          'any.required': 'Language test details are required',
          'array.base': 'Language test details must be an array',
        }),
      interestedcourse: Joi.array()
        .items(
          Joi.number().messages({
            'number.base': 'Course ID must be a number',
          })
        )
        .required()
        .messages({
          'any.required': 'Interested course details are required',
          'array.base': 'Interested courses must be an array',
        }),
      interestedcountry: Joi.array()
        .items(
          Joi.number().messages({
            'number.base': 'Country ID must be a number',
          })
        )
        .required()
        .messages({
          'any.required': 'Interested country details are required',
          'array.base': 'Interested countries must be an array',
        }),
    }).required();

    const { error } = schema.validate(result);
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0]?.message || 'Validation error',
      });
    }

    const response = await service.editStudent(result);

    if (
      !response ||
      typeof response.code !== 'number' ||
      typeof response.status !== 'boolean'
    ) {
      return res.status(500).send({
        status: false,
        message: 'Unexpected error occurred while updating student',
      });
    }

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
    });
  } catch (error) {
    console.error('Error in editStudent:', error);
    return res.status(500).send({
      status: false,
      message: 'Internal server error: failed to update student',
    });
  }
};

module.exports.updateApprovalStatus = async (req, res) => {
  try {
    const result = req.body;

    // Validation schema
    const schema = Joi.object({
      studentid: Joi.number().required().messages({
        'number.base': 'Student ID must be a number',
        'any.required': 'Student ID is required',
      }),
      key: Joi.number().valid(1, 2, 3).required().messages({
        'number.base': 'Approval status must be a number',
        'any.only':
          'Approval status must be 1 (Approved), 2 (Pending), or 3 (Rejected)',
        'any.required': 'Approval status is required',
      }),
    });

    const { error } = schema.validate(result);

    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0]?.message || 'Validation error',
      });
    }

    // Call service function
    const response = await service.updateApprovalStatus(result);

    if (
      !response ||
      typeof response.code !== 'number' ||
      typeof response.status !== 'boolean'
    ) {
      return res.status(500).send({
        status: false,
        message: 'Unexpected error occurred while updating approval status',
      });
    }

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
    });
  } catch (error) {
    console.error('Error in updateApprovalStatus:', error);
    return res.status(500).send({
      status: false,
      message: 'Internal server error: failed to update approval status',
    });
  }
};

module.exports.updateOfferLetterStatus = async (req, res) => {
  try {
    const result = req.body;

    // Validation schema
    const schema = Joi.object({
      studentid: Joi.number().required(),
      enrollmentid: Joi.number().required(),
      key: Joi.number().required(),
    });

    const { error } = schema.validate(result);

    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0]?.message || 'Validation error',
      });
    }

    // Call service function
    const response = await service.updateOfferLetterStatus(result);

    if (
      !response ||
      typeof response.code !== 'number' ||
      typeof response.status !== 'boolean'
    ) {
      return res.status(500).send({
        status: false,
        message: 'Unexpected error occurred while updating approval status',
      });
    }

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
    });
  } catch (error) {
    console.error('Error in updateApprovalStatus:', error);
    return res.status(500).send({
      status: false,
      message: 'Internal server error: failed to update approval status',
    });
  }
};

module.exports.updateStudentStatus = async (req, res) => {
  try {
    console.log('Request Body:', req.body);

    const { studentid, key } = req.body;

    if (!studentid || !key) {
      return res.status(400).json({
        status: false,
        message: 'studentid and key are required',
      });
    }

    const response = await service.updateStudentStatus(req.body);

    return res.status(response.code).json({
      status: response.status,
      message: response.message,
      data: response.response || null,
    });
  } catch (error) {
    console.error('Error updating student status:', error);

    return res.status(500).json({
      status: false,
      message: 'Something went wrong. Please try again later!',
    });
  }
};

module.exports.selectUniversity = async (req, res) => {
  try {
    const userid = req.headers['userid'];

    // if (!userid) {
    //   return res.status(400).send({
    //     status: false,
    //     message: "User ID header is required",
    //   });
    // }

    const result = {
      ...req.body,
      userid,
    };

    const schema = Joi.object({
      university: Joi.array()
        .items(
          Joi.object({
            universityid: Joi.number().required().messages({
              'any.required': 'University id is required',
            }),
            courseid: Joi.number().required().messages({
              'any.required': 'Course id is required',
            }),
            departmentid: Joi.number().required().messages({
              'any.required': 'Department id is required',
            }),
          })
        )
        .required(),
      studentid: Joi.number().required().messages({
        'any.required': 'Student id is required',
      }),
      userid: Joi.string().required().messages({
        'any.required': 'User ID is required',
      }),
    }).unknown(false); // optional: disallow unknown fields

    const { error } = schema.validate(result, { abortEarly: false });
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details.map((err) => err.message).join(', '),
      });
    }

    const response = await service.selectUniversity(result);

    if (
      !response ||
      typeof response.code !== 'number' ||
      typeof response.status !== 'boolean'
    ) {
      return res.status(500).send({
        status: false,
        message: 'Unexpected error occurred while select university',
      });
    }

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
    });
  } catch (error) {
    console.error('Error in selectUniversity:', error);
    return res.status(500).send({
      status: false,
      message: 'Internal server error: failed to select university',
    });
  }
};

module.exports.assignAdmin = async (req, res) => {
  try {
    const userid = req.headers['userid'];

    // if (!userid) {
    //   return res.status(400).send({
    //     status: false,
    //     message: "User ID header is required",
    //   });
    // }

    const result = {
      ...req.body,
      userid,
    };

    const schema = Joi.object({
      studentid: Joi.number().required().messages({
        'any.required': 'Student id is required',
      }),
      adminid: Joi.number().required().messages({
        'any.required': 'Student id is required',
      }),
      userid: Joi.string().required().messages({
        'any.required': 'User ID is required',
      }),
    }).unknown(false); // optional: disallow unknown fields

    const { error } = schema.validate(result, { abortEarly: false });
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details.map((err) => err.message).join(', '),
      });
    }

    const response = await service.assignAdmin(result);

    if (
      !response ||
      typeof response.code !== 'number' ||
      typeof response.status !== 'boolean'
    ) {
      return res.status(500).send({
        status: false,
        message: 'Unexpected error occurred while select university',
      });
    }

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
    });
  } catch (error) {
    console.error('Error in selectUniversity:', error);
    return res.status(500).send({
      status: false,
      message: 'Internal server error: failed to select university',
    });
  }
};

module.exports.uploadStudentChecklistFile = async (req, res) => {
  try {
    const schema = Joi.object({
      enrollmentid: Joi.number().required().messages({
        'any.required': 'Enrollment ID is required',
      }),
      studentchecklistid: Joi.number().required().messages({
        'any.required': 'Student Checklist ID is required',
      }),
      documents: Joi.array()
        .items(
          Joi.object({
            checklistdataid: Joi.number().required().messages({
              'any.required': 'Checklist Data ID is required',
              'number.base': 'Checklist Data ID must be a number',
            }),
            documenturl: Joi.string().required().messages({
              'any.required': 'Document URL is required',
              'string.base': 'Document URL must be a string',
            }),
          })
        )
        .required(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0]?.message || 'Validation error',
      });
    }

    // Corrected this line to use validated input
    const response = await service.uploadStudentChecklistFile(value);

    if (
      !response ||
      typeof response.code !== 'number' ||
      typeof response.status !== 'boolean'
    ) {
      return res.status(500).send({
        status: false,
        message: 'Unexpected error occurred while uploading checklist document',
      });
    }

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
    });
  } catch (error) {
    console.error('Controller Error:', error);
    return res.status(500).send({
      status: false,
      message: 'Unexpected server error during student file upload',
    });
  }
};

module.exports.uploadOfferLetterChecklistFile = async (req, res) => {
  try {
    const userid = req.headers['userid']; // Assuming you are using user ID from headers.

    // Validate required input fields
    const schema = Joi.object({
      checklistdataid: Joi.number().required().messages({
        'any.required': 'Checklist Data ID is required',
        'number.base': 'Checklist Data ID must be a number',
      }),
      offerletterchecklisturl: Joi.string().required().messages({
        'any.required': 'Offer Letter Checklist URL is required',
        'string.base': 'Offer Letter Checklist URL must be a string',
      }),
      userid: Joi.string().required().messages({
        'any.required': 'User ID is required',
      }),
      studentid: Joi.number().optional(), // Allowing studentid
      checklistid: Joi.number().optional(), // Allowing checklistid
      checklistitemid: Joi.number().optional(), // Allowing checklistitemid
      enrollmentid: Joi.number().optional(), // Allowing enrollmentid
    }).unknown(true); // Allow additional fields (optional)

    // Validate request body
    const result = {
      ...req.body,
      userid,
    };

    const { error } = schema.validate(result, { abortEarly: false });
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details.map((err) => err.message).join(', '),
      });
    }

    // Call service to handle the file upload logic
    const response = await service.uploadOfferLetterChecklistFile(result);

    if (
      !response ||
      typeof response.code !== 'number' ||
      typeof response.status !== 'boolean'
    ) {
      return res.status(500).send({
        status: false,
        message:
          'Unexpected error occurred while uploading offer letter checklist file',
      });
    }

    // Return the response based on service result
    return res.status(response.code).send({
      status: response.status,
      message: response.message,
    });
  } catch (error) {
    console.error('Error in uploadOfferLetterChecklistFile:', error);
    return res.status(500).send({
      status: false,
      message:
        'Internal server error: failed to upload offer letter checklist file',
    });
  }
};

module.exports.uploadPaymentReceiptFile = async (req, res) => {
  try {
    const userid = req.headers['userid']; // Assuming you're using user ID from headers

    // Validate required input fields
    const schema = Joi.object({
      checklistdataid: Joi.number().required().messages({
        'any.required': 'Checklist Data ID is required',
        'number.base': 'Checklist Data ID must be a number',
      }),
      receipturl: Joi.string().required().messages({
        'any.required': 'Payment Receipt URL is required',
        'string.base': 'Payment Receipt URL must be a string',
      }),
      userid: Joi.string().required().messages({
        'any.required': 'User ID is required',
      }),
      studentid: Joi.number().optional(), // Optional field
      checklistid: Joi.number().optional(), // Optional field
      checklistitemid: Joi.number().optional(), // Optional field
      enrollmentid: Joi.number().optional(), // Optional field
    }).unknown(true); // Allow additional fields

    // Validate request body with the userid from headers
    const result = {
      ...req.body,
      userid,
    };

    const { error } = schema.validate(result, { abortEarly: false });
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details.map((err) => err.message).join(', '),
      });
    }

    // Call service to handle the file upload logic
    const response = await service.uploadPaymentReceiptFile(result);

    if (
      !response ||
      typeof response.code !== 'number' ||
      typeof response.status !== 'boolean'
    ) {
      return res.status(500).send({
        status: false,
        message:
          'Unexpected error occurred while uploading payment receipt file',
      });
    }

    // Return the response based on service result
    return res.status(response.code).send({
      status: response.status,
      message: response.message,
    });
  } catch (error) {
    console.error('Error in uploadPaymentReceiptFile:', error);
    return res.status(500).send({
      status: false,
      message: 'Internal server error: failed to upload payment receipt file',
    });
  }
};

module.exports.uploadCoEFile = async (req, res) => {
  try {
    const userid = req.headers['userid']; // Assuming you're using user ID from headers

    // Log incoming request for debugging
    console.log('Request Body:', req.body);
    console.log('Request Headers:', req.headers);

    // Validate required input fields
    const schema = Joi.object({
      checklistdataid: Joi.number().required().messages({
        'any.required': 'Checklist Data ID is required',
        'number.base': 'Checklist Data ID must be a number',
      }),
      coeurl: Joi.string().required().messages({
        'any.required': 'CoE File URL is required',
        'string.base': 'CoE File URL must be a string',
      }),
      userid: Joi.string().required().messages({
        'any.required': 'User ID is required',
      }),
      studentid: Joi.number().optional(),
      checklistid: Joi.number().optional(),
      checklistitemid: Joi.number().optional(),
      documenttypeid: Joi.number().optional(),
      enrollmentid: Joi.number().optional(),
    }).unknown(true); // Allow additional fields

    // Validate request body with the userid from headers
    const result = {
      ...req.body,
      userid,
    };

    const { error } = schema.validate(result, { abortEarly: false });
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details.map((err) => err.message).join(', '),
      });
    }

    // Call service to handle the file upload logic
    const response = await service.uploadCoEFile(result);

    if (
      !response ||
      typeof response.code !== 'number' ||
      typeof response.status !== 'boolean'
    ) {
      return res.status(500).send({
        status: false,
        message: 'Unexpected error occurred while uploading CoE file',
      });
    }

    // Return the response based on service result
    return res.status(response.code).send({
      status: response.status,
      message: response.message,
    });
  } catch (error) {
    console.error('Error in uploadCoEFile:', error);
    return res.status(500).send({
      status: false,
      message: 'Internal server error: failed to upload CoE file',
    });
  }
};

module.exports.uploadVisaChecklistFile = async (req, res) => {
  try {
    const userid = req.headers['userid']; // Assuming you're using user ID from headers

    // Log incoming request for debugging
    console.log('Request Body:', req.body);
    console.log('Request Headers:', req.headers);

    // Validate required input fields
    const schema = Joi.object({
      checklistdataid: Joi.number().required().messages({
        'any.required': 'Checklist Data ID is required',
        'number.base': 'Checklist Data ID must be a number',
      }),
      visaurl: Joi.string().required().messages({
        'any.required': 'Visa URL is required',
        'string.base': 'Visa URL must be a string',
      }),
      userid: Joi.string().required().messages({
        'any.required': 'User ID is required',
      }),
      studentid: Joi.number().optional(),
      checklistid: Joi.number().optional(),
      checklistitemid: Joi.number().optional(),
      documenttypeid: Joi.number().optional(),
      enrollmentid: Joi.number().optional(),
    }).unknown(true); // Allow additional fields

    // Validate request body with the userid from headers
    const result = {
      ...req.body,
      userid,
    };

    const { error } = schema.validate(result, { abortEarly: false });
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details.map((err) => err.message).join(', '),
      });
    }

    // Call service to handle the file upload logic
    const response = await service.uploadVisaChecklistFile(result);

    if (
      !response ||
      typeof response.code !== 'number' ||
      typeof response.status !== 'boolean'
    ) {
      return res.status(500).send({
        status: false,
        message: 'Unexpected error occurred while uploading Visa checklist',
      });
    }

    // Return the response based on service result
    return res.status(response.code).send({
      status: response.status,
      message: response.message,
    });
  } catch (error) {
    console.error('Error in uploadVisaChecklist:', error);
    return res.status(500).send({
      status: false,
      message: 'Internal server error: failed to upload Visa checklist',
    });
  }
};
