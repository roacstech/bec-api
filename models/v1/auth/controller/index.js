const Joi = require("joi");
const service = require("../service/index");
const _ = require("lodash");
const { OAuth2Client } = require("google-auth-library");

const passport = require("passport");
const jwt = require("jsonwebtoken");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

console.log(process.env.GOOGLE_CLIENT_ID);

// Google OAuth2 Login
module.exports.googleLogin = (req, res, next) => {
  passport.authenticate("google", { scope: ["profile", "email"] })(
    req,
    res,
    next
  );
};

module.exports.googleCallback = async (req, res) => {
  try {
    const { token } = req.body; // Get token from frontend
    const decoded = jwt.decode(token, { complete: true });

    console.log("👍🏻", decoded.header.alg); // This will print "RS256" or another algorithm

    if (!token) {
      return res
        .status(400)
        .json({ status: false, message: "No token provided" });
    }

    // Verify Google Token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID, // Must match frontend client ID
    });

    const payload = ticket.getPayload();
    console.log("Google Payload:", payload);

    if (!payload) {
      return res
        .status(401)
        .json({ status: false, message: "Invalid Google token" });
    }

    // Extract User Info
    const userProfile = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };

    console.log("User Profile:", userProfile);

    // Call the service function to handle login logic
    const result = await service.googleLogin(userProfile);

    return res.status(result.code).json({
      status: result.status,
      message: result.message,
      response: result.response,
    });
  } catch (error) {
    console.error("Error in Google Callback:", error.message);
    return res
      .status(500)
      .json({ status: false, message: `Server error: ${error.message}` });
  }
};

module.exports.login = async (req, res) => {
  try {
    const result = {
      ...req.body,
    };

    var schema;

    const configid = req.body.configid;

    if (!configid) {
      return res.send({
        status: false,
        message: "Config id required",
      });
    }

    switch (configid) {
      case 1:
        schema = Joi.object({
          email: Joi.string().email().required().messages({
            "any.required": "Email is required",
            "string.email": "Email must be a valid email address",
            "string.valid": "Email can be empty or a valid email address",
          }),
          password: Joi.number().required().messages({
            "any.required": "Password is required",
            "number.base": "Password must be a number",
          }),
          fcmtoken: Joi.optional().messages({
            "any.required": "Fcm token is required",
            "string.base": "Fcm token must be a string",
          }),
          roleid: Joi.number().required().messages({
            "any.required": "Role ID is required",
            "number.base": "Role ID must be a number",
          }),
          configid: Joi.number().required().messages({
            "any.required": "Config ID is required",
            "number.base": "Config ID must be a number",
          }),
        }).required();
        break;

      case 2:
        schema = Joi.object({
          email: Joi.string().email().required().messages({
            "any.required": "Email is required",
            "string.email": "Email must be a valid email address",
            "string.valid": "Email can be empty or a valid email address",
          }),
          password: Joi.number().required().messages({
            "any.required": "Password is required",
            "number.base": "Password must be a number",
          }),
          fcmtoken: Joi.optional().messages({
            "any.required": "Fcm token is required",
            "string.base": "Fcm token must be a string",
          }),
          roleid: Joi.number().required().messages({
            "any.required": "Role ID is required",
            "number.base": "Role ID must be a number",
          }),
          configid: Joi.number().required().messages({
            "any.required": "Config ID is required",
            "number.base": "Config ID must be a number",
          }),
        }).required();
        break;

      default:
        return res.status(400).send({
          status: false,
          message: "Invalid Config ID",
        });
    }

    const { error } = schema.validate(result);
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0]?.message || "Validation error",
      });
    }

    const response = await service.login(result);

    if (response?.status) {
      res.cookie("accesstoken", response, {
        httpOnly: true, // Makes it inaccessible to JavaScript on the client-side
        secure: true, // Sends the cookie over HTTPS only in production
      });
    }

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
      response: response.response,
    });
  } catch (err) {
    console.log("err", err);
    return res.send({
      status: false,
      message: "Internal server error",
    });
  }
};

module.exports.logout = async (req, res) => {
  try {
    const result = {
      ...req.body,
    };

    const response = await service.logout(result);

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
      response: response.response,
    });
  } catch (err) {
    console.log("err", err);
    return res.send({
      status: false,
      message: "Internal server error",
    });
  }
};

// module.exports.registrationcustomer = async (req, res) => {
//   try {
//     const result = {
//       ...req.body,
//     };

//     let schema;

//     switch (result.customertype) {
//       case 2:
//         schema = Joi.object({
//           customername: Joi.string().required().messages({
//             "any.required": "Customer name is required",
//             "string.base": "Customer name must be a string",
//           }),
//           customerimage: Joi.string().allow("").uri().messages({
//             "string.base": "Customer image must be a string",
//             "string.uri": "Customer image must be a valid URL",
//           }),
//           customertype: Joi.number().required().messages({
//             "any.required": "Customer Type is required",
//             "number.base": "Customer Type must be a number",
//           }),
//           configid: Joi.number().required().messages({
//             "any.required": "Config ID is required",
//             "number.base": "Config ID must be a number",
//           }),
//           customerprimaryemail: Joi.string().email().required().messages({
//             "any.required": "Primary Email is required",
//             "string.email": "Primary Email must be a valid email address",
//             "string.valid":
//               "Primary Email can be empty or a valid email address",
//           }),
//           customeralteremail: Joi.alternatives()
//             .try(Joi.string().email(), Joi.string().valid(""))
//             .required()
//             .messages({
//               "any.required": "Primary Email is required",
//               "string.email": " PrimaryEmail must be a valid email address",
//               "string.valid":
//                 " Primary Email can be empty or a valid email address",
//             }),
//           customerprimarycontact: Joi.string().required().messages({
//             "any.required": "Primary Contact number is required",
//             "string.base": "Primary Contact number must be a string",
//           }),
//           customeraltercontact: Joi.alternatives()
//             .try(Joi.string().allow(""), Joi.string())
//             .messages({
//               "string.base": "Alternative date must be a string or empty",
//             }),
//           customerprojects: Joi.array()
//             .items(
//               Joi.object({
//                 projectname: Joi.string().required().messages({
//                   "any.required": "Project name is required",
//                   "string.base": "Project name must be a string",
//                 }),
//                 buildings: Joi.array()
//                   .items(
//                     Joi.string().messages({
//                       "string.base": "Building name must be a valid string",
//                     })
//                   )
//                   .required()
//                   .messages({
//                     "any.required": "Building name is required",
//                   }),
//               })
//             )
//             .required()
//             .messages({
//               "any.required": "Customer projects are required",
//             }),
//           countryid: Joi.alternatives(
//             Joi.number().allow(""),
//             Joi.number()
//           ).messages({
//             "number.base": "Country ID must be a number or empty",
//           }),
//           stateid: Joi.alternatives(
//             Joi.number().allow(""),
//             Joi.number()
//           ).messages({
//             "number.base": "State ID must be a number or empty",
//           }),
//           cityid: Joi.alternatives(
//             Joi.number().allow(""),
//             Joi.number()
//           ).messages({
//             "number.base": "City ID must be a number or empty",
//           }),
//           tenantid: Joi.number().required().messages({
//             "any.required": "Tenant ID is required",
//             "number.base": "Tenant ID must be a number",
//           }),
//         }).required();
//         break;
//       case 1:
//         schema = Joi.object({
//           customername: Joi.string().required().messages({
//             "any.required": "Customer name is required",
//             "string.base": "Customer name must be a string",
//           }),
//           customerimage: Joi.string().allow("").uri().messages({
//             "string.base": "Customer image must be a string",
//             "string.uri": "Customer image must be a valid URL",
//           }),
//           customertype: Joi.number().required().messages({
//             "any.required": "Customer Type is required",
//             "number.base": "Customer Type must be a number",
//           }),
//           configid: Joi.number().required().messages({
//             "any.required": "Config ID is required",
//             "number.base": "Config ID must be a number",
//           }),
//           customercompanyname: Joi.string().required().messages({
//             "any.required": "Customer Company name is required",
//             "string.base": "Customer Company name must be a string",
//           }),
//           customerprimaryemail: Joi.string().email().required().messages({
//             "any.required": "Primary Email is required",
//             "string.email": "Primary Email must be a valid email address",
//             "string.valid":
//               "Primary Email can be empty or a valid email address",
//           }),
//           customeralteremail: Joi.alternatives()
//             .try(Joi.string().email(), Joi.string().valid(""))
//             .required()
//             .messages({
//               "any.required": "Primary Email is required",
//               "string.email": " PrimaryEmail must be a valid email address",
//               "string.valid":
//                 " Primary Email can be empty or a valid email address",
//             }),
//           customerprimarycontact: Joi.string().required().messages({
//             "any.required": "Primary Contact number is required",
//             "string.base": "Primary Contact number must be a string",
//           }),
//           customeraltercontact: Joi.alternatives()
//             .try(Joi.string().allow(""), Joi.string())
//             .messages({
//               "string.base": "Alternative date must be a string or empty",
//             }),
//           customerprojects: Joi.array()
//             .items(
//               Joi.object({
//                 projectname: Joi.string().required().messages({
//                   "any.required": "Project name is required",
//                   "string.base": "Project name must be a string",
//                 }),
//                 buildings: Joi.array()
//                   .items(
//                     Joi.string().messages({
//                       "string.base": "Building name must be a valid string",
//                     })
//                   )
//                   .required()
//                   .messages({
//                     "any.required": "Building name is required",
//                   }),
//               })
//             )
//             .required()
//             .messages({
//               "any.required": "Customer projects are required",
//             }),
//           customercompanyemail: Joi.alternatives()
//             .try(Joi.string().email(), Joi.string().valid(""))
//             .required()
//             .messages({
//               "any.required": "Company email is required",
//               "string.email": "Company email must be a valid email address",
//               "string.valid":
//                 "Company email can be empty or a valid email address",
//             }),
//           customercompanyaddress: Joi.alternatives(
//             Joi.string().allow(""),
//             Joi.string()
//           ).messages({
//             "number.base": "Address must be a string or empty",
//           }),
//           countryid: Joi.alternatives(
//             Joi.number().allow(""),
//             Joi.number()
//           ).messages({
//             "number.base": "Country ID must be a number or empty",
//           }),
//           stateid: Joi.alternatives(
//             Joi.number().allow(""),
//             Joi.number()
//           ).messages({
//             "number.base": "State ID must be a number or empty",
//           }),
//           cityid: Joi.alternatives(
//             Joi.number().allow(""),
//             Joi.number()
//           ).messages({
//             "number.base": "City ID must be a number or empty",
//           }),
//           tenantid: Joi.number().required().messages({
//             "any.required": "Tenant ID is required",
//             "number.base": "Tenant ID must be a number",
//           }),
//         }).required();
//         break;
//       default:
//         break;
//     }

//     const { error } = schema.validate(result);
//     if (error) {
//       return res.status(400).send({
//         status: false,
//         message: error.details[0]?.message || "Validation error",
//       });
//     }

//     const response = await service.registrationcustomer(result);

//     // console.log('res', response);

//     if (
//       !response ||
//       typeof response.code !== "number" ||
//       typeof response.status !== "boolean"
//     ) {
//       return res.status(500).send({
//         status: false,
//         message: "Unexpected error occurred while creating customer",
//       });
//     }

//     return res.status(response.code).send({
//       status: response.status,
//       message: response.message,
//       notifydata: response.notifydata,
//       mailProps: response.mailProps,
//     });
//   } catch (error) {
//     console.error("Error in registration:", error);
//     return res.status(500).send({
//       status: false,
//       message: "Internal server error: failed to create customer",
//     });
//   }
// };

module.exports.registration = async (req, res) => {
  try {
   
    // Extract request body
    const result = { ...req.body };

    // Define validation schema
    const schema = Joi.object({
      firstname: Joi.string().trim().required().messages({
        "any.required": "First name is required",
        "string.base": "First name must be a string",
      }),
      lastname: Joi.string().trim().required().messages({
        "any.required": "Last name is required",
        "string.base": "Last name must be a string",
      }),
      email: Joi.string().trim().email().required().messages({
        "any.required": "Email is required",
        "string.email": "Email must be a valid email address",
      }),
      password: Joi.string().min(6).required().messages({
        "any.required": "Password is required",
        "string.min": "Password must be at least 6 characters long",
      }),
    });

    // Validate the input data
    const { error } = schema.validate(result, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        status: false,
        message: error.details.map((err) => err.message).join(", "),
      });
    }

    // Call service to register the user
    const response = await service.registration(result);

    if (
      !response ||
      typeof response.code !== "number" ||
      typeof response.status !== "boolean"
    ) {
      return res.status(500).json({
        status: false,
        message: "Unexpected error occurred while registering user",
      });
    }

    return res.status(response.code).json({
      status: response.status,
      message: response.message,
      data: response.response || null, // Ensure `data` is always returned
    });
  } catch (error) {
    console.error("❌ Error in user registration:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error: Failed to register user",
    });
  }
};

module.exports.validateUserEmail = async (req, res) => {
  try {
    const result = {
      ...req.body,
    };

    const schema = Joi.object({
      email: Joi.string().email().required().messages({
        "any.required": "Email is required",
        "string.email": "Email must be a valid email address",
        "string.valid": "Email can be empty or a valid email address",
      }),
    }).required();

    const { error } = schema.validate(result);
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0]?.message || "Validation error",
      });
    }

    const response = await service.validateUserEmail(result);

    if (
      !response ||
      typeof response.code !== "number" ||
      typeof response.status !== "boolean"
    ) {
      return res.status(500).send({
        status: false,
        message: "Unexpected error occurred while validate user email",
      });
    }

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
      mailProps: response.mailProps,
      response: response.response,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: false,
      message: "Failed to validate user email",
    });
  }
};

module.exports.validateUserOTP = async (req, res) => {
  try {
    const result = {
      ...req.body,
    };

    const schema = Joi.object({
      email: Joi.string().email().required().messages({
        "any.required": "Email is required",
        "string.email": "Email must be a valid email address",
        "string.valid": "Email can be empty or a valid email address",
      }),
      otp: Joi.number().required().messages({
        "any.required": "OTP is required",
        "number.base": "OTP must be a number",
      }),
    }).required();

    const { error } = schema.validate(result);
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0]?.message || "Validation error",
      });
    }

    const response = await service.validateUserOTP(result);

    if (
      !response ||
      typeof response.code !== "number" ||
      typeof response.status !== "boolean"
    ) {
      return res.status(500).send({
        status: false,
        message: "Unexpected error occurred while validate user otp",
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
      message: "Failed to validate user otp",
    });
  }
};

module.exports.setNewPassword = async (req, res) => {
  try {
    const result = {
      ...req.body,
    };

    const schema = Joi.object({
      email: Joi.string().email().required().messages({
        "any.required": "Email is required",
        "string.email": "Email must be a valid email address",
      }),
      password: Joi.number()
        .integer() // Ensures only integers are allowed
        .min(1000) // Minimum value for a 4-digit number
        .max(9999) // Maximum value for a 4-digit number
        .required()
        .messages({
          "any.required": "Password is required",
          "number.base": "Password must be a 4-digit number",
          "number.min": "Password must be at least 4 digits",
          "number.max": "Password must be at most 4 digits",
        }),
      retypepassword: Joi.number()
        .integer()
        .min(1000)
        .max(9999)
        .required()
        .messages({
          "any.required": "Re-Type Password is required",
          "number.base": "Re-Type Password must be a 4-digit number",
          "number.min": "Re-Type Password must be at least 4 digits",
          "number.max": "Re-Type Password must be at most 4 digits",
        }),
    }).required();

    const { error } = schema.validate(result);
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0]?.message || "Validation error",
      });
    }

    const response = await service.setNewPassword(result);

    if (
      !response ||
      typeof response.code !== "number" ||
      typeof response.status !== "boolean"
    ) {
      return res.status(500).send({
        status: false,
        message: "Unexpected error occurred while validating user OTP",
      });
    }

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      status: false,
      message: "Failed to validate user OTP",
    });
  }
};

module.exports.getUserByID = async (req, res) => {
  try {
    const tenantid = req.headers["tenantid"];
    const userid = req.headers["userid"];
    const result = {
      ...req.body,
      tenantid,
      userid,
    };

    const schema = Joi.object({
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
      return res.status(200).send({
        status: false,
        message: error.details[0]?.message || "Validation error",
      });
    }

    const response = await service.getUserByID(result);

    // console.log("res", response);

    if (
      !response ||
      typeof response.code !== "number" ||
      typeof response.status !== "boolean"
    ) {
      return res.status(500).send({
        status: false,
        message: "Unexpected error occurred while fetch user",
      });
    }

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
      response: response.response,
    });
  } catch (error) {
    console.error("Error in getUserByID:", error);
    return res.status(500).send({
      status: false,
      message: "Internal server error: failed to retrieving data",
    });
  }
};

module.exports.editUserProfile = async (req, res) => {
  try {
    const tenantid = req.headers["tenantid"];
    const userid = req.headers["userid"];
    const result = {
      ...req.body,
      tenantid,
      userid,
    };

    const schema = Joi.object({
      username: Joi.string().required().messages({
        "any.required": "User name is required",
        "string.base": "User name must be a string",
      }),
      primaryemail: Joi.string().email().required().messages({
        "any.required": "Primary Email is required",
        "string.email": "Primary Email must be a valid email address",
        "string.valid": "Primary Email can be empty or a valid email address",
      }),
      alteremail: Joi.string().email().optional().messages({
        "any.required": "Alter Email is required",
        "string.email": "Alter Email must be a valid email address",
        "string.valid": "Alter Email can be empty or a valid email address",
      }),
      primarycontact: Joi.string().required().messages({
        "any.required": "Primary contact is required",
        "string.base": "Primary contact must be a string",
      }),
      altercontact: Joi.optional().messages({
        "any.required": "Alter contact is required",
        "string.base": "Alter contact must be a string",
      }),
      userimage: Joi.string().allow("").uri().optional().messages({
        "string.base": "User image must be a string",
        "string.uri": "User image must be a valid URL",
      }),
      signatureurl: Joi.string().allow("").uri().optional().messages({
        "string.base": "Signature url must be a string",
        "string.uri": "Signature url must be a valid URL",
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
      return res.status(200).send({
        status: false,
        message: error.details[0]?.message || "Validation error",
      });
    }

    const response = await service.editUserProfile(result);

    // console.log("res", response);

    if (
      !response ||
      typeof response.code !== "number" ||
      typeof response.status !== "boolean"
    ) {
      return res.status(500).send({
        status: false,
        message: "Unexpected error occurred while editUserProfile",
      });
    }

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
      response: response.response,
    });
  } catch (error) {
    console.error("Error in editUserProfile:", error);
    return res.status(500).send({
      status: false,
      message: "Internal server error: failed to edit UserProfile",
    });
  }
};

// OAuth2

// const { authenticateJWT } = require("../middleware/protectedJWT");
// const { handleAsyncActionV2 } = require("../middleware/responseHandler");
// const authService = require("../services/authService");
// const {
//   passport: passportConfig,
//   generateToken,
// } = require("../utils/passport-config");
// const { config } = require("../utils/utils");

// module.exports.googleAuth = passportConfig.authenticate("google", {
//   scope: ["profile", "email"],
//   session: false,
// });

// module.exports.googleAuthCallback = (req, res) => {
//   const redirectUrl = config.get("oAuth.clientRedirectUrl");
//   // Generate a JWT token for the user
//   console.log("User from CallBack : ", { ...req.user });
//   const token = generateToken(
//     req.user.data ? { ...req.user.data } : { ...req.user }
//   );
//   console.log("Token from CallBack : ", token);
//   // Set the token as a cookie
//   res.cookie("authorization", token, {
//     httpOnly: true, // Makes it inaccessible to JavaScript on the client-side
//     secure: true, // Sends the cookie over HTTPS only in production
//     sameSite: "None",
//     maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
//   });
//   // Redirect to the client with the token
//   res.redirect(`${redirectUrl}/auth/callback?token=${token}`);
// };
// module.exports.me = [authenticateJWT, handleAsyncActionV2(authService.me)];

// module.exports.me = [authenticateJWT, handleAsyncActionV2(authService.me)];

// module.exports.googleAuth = passportConfig.authenticate("google", {
//   scope: ["profile", "email"],
//   session: false,
// });

// module.exports.googleAuthCallback = (req, res) => {
//   const redirectUrl = config.get("oAuth.clientRedirectUrl");

//   // Generate a JWT token for the user
//   console.log("User from CallBack : ", { ...req.user });
//   const token = generateToken(
//     req.user.data ? { ...req.user.data } : { ...req.user }
//   );
//   console.log("Token from CallBack : ", token);

//   // Set the token as a cookie
//   res.cookie("authorization", token, {
//     httpOnly: true, // Makes it inaccessible to JavaScript on the client-side
//     secure: true, // Sends the cookie over HTTPS only in production
//     sameSite: "None",
//     maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
//   });

//   // Redirect to the client with the token
//   res.redirect(`${redirectUrl}/auth/callback?token=${token}`);
// };
