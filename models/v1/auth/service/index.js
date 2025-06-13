const _ = require('lodash');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const moment = require('moment');
const mailService = require('../../../../mail/mailService');
const db = global.dbConnection;

// module.exports.login = async (props) => {
//   const { password, email, mobile, configid, devicetype, deviceid, fcmtoken } =
//     props;

//   try {
//     // signinconfig 1 -  normal login
//     // signinconfig 2 - mpin sign

//     const authmethod = await global
//       .dbConnection("app_config")
//       .select("signinconfigid")
//       .where("configid", configid)
//       .first();

//     if (authmethod.signinconfigid == 1) {
//       const user = await global
//         .dbConnection("app_users")
//         .leftJoin("tenants", "tenants.userid", "app_users.userid")
//         .select(
//           "app_users.roleid",
//           "app_users.userid",
//           "app_users.moduleid",
//           "app_users.username as name",
//           "tenants.tenantid",
//           "app_users.locationid",
//           "app_users.userid"
//         )
//         .where({ authname: email, password: password });

//       // token creation
//       if (!_.isEmpty(user)) {
//         if (!_.isUndefined(fcmtoken)) {
//           const device = await global
//             .dbConnection("app_users")
//             .update({ fcmtoken })
//             .where({ userid: user[0].userid });
//         }

//         const accesstoken = jwt.sign(
//           { userid: user.tenantid, email },
//           process.env.TOKEN,
//           {
//             expiresIn: "24h",
//           }
//         );

//         user[0].accesstoken = accesstoken;

//         return user;
//       }

//       return null;
//     }
//     else if (authmethod.signinconfigid == 2) {
//       const user = await global
//         .dbConnection("app_users")
//         .leftJoin("tenantstaffs", "tenantstaffs.userid", "app_users.userid")
//         .select(
//           "app_users.roleid",
//           "app_users.userid",
//           "app_users.moduleid",
//           "app_users.username as name",
//           "tenantstaffs.*",
//           "app_users.locationid",
//           "app_users.userid"
//         )
//         .where({ "app_users.authname": email, "app_users.password": password });

//       // token creation
//       if (!_.isEmpty(user)) {
//         if (!_.isUndefined(fcmtoken)) {
//           const device = await global
//             .dbConnection("app_users")
//             .update({ fcmtoken })
//             .where({ userid: user[0].userid });
//         }

//         const accesstoken = jwt.sign(
//           { userid: user.tenantid, email },
//           process.env.TOKEN,
//           {
//             expiresIn: "24h",
//           }
//         );

//         user[0].accesstoken = accesstoken;

//         return user;
//       }

//       return null;
//     } else {
//       return null;
//     }
//   } catch (err) {
//     console.log(err);
//   }
//   return null;
// };

// Google OAuth2 Login
module.exports.googleLogin = async (profile) => {
  try {
    const result = await db.transaction(async (trx) => {
      let user = await trx('app_users').where({ googleId: profile.id }).first();

      if (!profile.id) {
        throw new Error('Google ID is missing from profile');
      }
      const hashedPassword = await bcrypt.hash(profile.id, 10);
      console.log('Generated Hashed Password:', hashedPassword);

      // If the user doesn't exist, create a new user
      if (!user) {
        [user] = await trx('app_users')
          .insert({
            googleId: profile.id, // Make sure this is not NULL
            authname: profile.emails,
            username: profile.displayName,
            roleid: 4,
            hashpassword: hashedPassword,
          })
          .returning('*');
      }

      // Generate session and tokens
      const [sessionid] = await trx('sessions').insert({
        userid: user.userid,
        tenantid: user.tenantid || null,
        fcmtoken: null,
        configid: 1,
        roleid: user.roleid,
      });

      if (sessionid === 0) {
        throw new Error('Session id not created');
      }

      const accesstoken = jwt.sign(
        { response: { ...user, sessionid } },
        process.env.ACCESS_TOKEN,
        { expiresIn: '12h' }
      );

      const refreshtoken = jwt.sign(
        { response: { ...user, sessionid } },
        process.env.REFRESH_TOKEN,
        { expiresIn: '12h' }
      );

      // Insert FCM token (if applicable)
      await trx('fcmtokens').insert({
        userid: user.userid,
        email: profile.emails,
        tenantid: user.tenantid || null,
        sessionid: sessionid,
        fcmtoken: null, // No FCM token for Google login
        configid: 1, // Default config for Google login (adjust as needed)
        roleid: user.roleid,
        accesstoken: accesstoken,
        refreshtoken: refreshtoken,
      });

      return {
        code: 200,
        status: true,
        message: 'Google login successful',
        response: accesstoken,
      };
    });

    return result;
  } catch (err) {
    console.log('err in googleLogin', err);
    return {
      code: 500,
      status: false,
      message: 'Google authentication failed',
    };
  }
};

module.exports.UserStatus = async (props) => {
  const { email, password, configid, mobile } = props;
  try {
    switch (configid) {
      case 1:
        const user1 = await global
          .dbConnection('app_users')
          .select('status')
          .where({ authname: email, password: password });

        return !_.isEmpty(user1) ? user1[0].status : null;
      case 2:
        const user2 = await global
          .dbConnection('app_users')
          .select('status')
          .where({ authname: mobile, password: password });

        return !_.isEmpty(user2) ? user2[0].status : null;
    }
  } catch (err) {
    console.log('error', err);
  }
  return null;
};

module.exports.login = async (props) => {
  const { email, mobile, fcmtoken, password, configid, roleid } = props;
  const db = global.dbConnection;

  let fixedConfigId = configid;

  if (!fixedConfigId || fixedConfigId === 0) {
    if (roleid === 1 || roleid === 2) {
      fixedConfigId = 1; // Web for SuperAdmin/Admin
    } else if (roleid === 3) {
      fixedConfigId = 2; // Mobile for Student
    }
  }
  try {
    const result = await db.transaction(async (trx) => {
      var checkemailexist;
      var checkmobilexist;
      var login;
      var student;
      var accesstoken;
      var refreshtoken;
      var sessionid;
      var createfcmtoken;
      var storedpassword;
      var checkpassword;

      await trx('fcmtokens')
        .where({
          fcmtoken,
          roleid,
        })
        .del();

      switch (fixedConfigId) {
        //web
        case 1:
          console.log(email, password);

          checkemailexist = await trx('app_users')
            // .leftJoin("tenants", "tenants.userid", "app_users.userid")
            .where({
              'app_users.authname': email,
              // "app_users.roleid": 1 || 2,
            })
            .first();

          if (_.isEmpty(checkemailexist)) {
            return {
              code: 400,
              status: false,
              message: 'Email not exist',
            };
          }

          if (
            checkemailexist.roleid === 2 &&
            checkemailexist.adminloginstatus !== 1
          ) {
            return {
              code: 403,
              status: false,
              message:
                'Your admin account is currently disabled. Please contact the system administrator for support.',
            };
          }

          if (
            checkemailexist.roleid === 3 &&
            checkemailexist.studentloginstatus !== 1
          ) {
            return {
              code: 403,
              status: false,
              message:
                'Your student account has been deactivated. Please contact your administrator for assistance.',
            };
          }

          console.log('Login Role:', checkemailexist.roleid);
          console.log('Admin Status:', checkemailexist.adminloginstatus);
          console.log('Student Status:', checkemailexist.studentloginstatus);

          // Compare passwords
          storedpassword = checkemailexist.hashpassword;
          checkpassword = await bcrypt.compare(
            String(password),
            storedpassword
          );

          console.log('chec', checkpassword);

          login = await trx('app_users')
            // .leftJoin("tenants", "tenants.userid", "app_users.userid")
            .where({
              'app_users.authname': email,
              // "app_users.roleid": 1 || 2,
            })
            .first();

          console.log('login?.roleid', login?.roleid);
          console.log('login?.userid', login?.userid);

          student = await trx('students')
            .select('studentid')
            .where({
              userid: login?.userid,
            })
            .first();

          if (!checkpassword) {
            return {
              code: 400,
              status: false,
              message: 'Username or password incorrect',
            };
          }

          [sessionid] = await trx('sessions').insert({
            userid: login?.userid,
            tenantid: login?.tenantid,
            fcmtoken,
            configid: fixedConfigId,
            accesstoken,
            refreshtoken,
            roleid: login?.roleid,
          });

          if (sessionid === 0) {
            throw new Error('Session id not created');
          }

          accesstoken = jwt.sign(
            { response: { ...login, ...student, sessionid } },
            process.env.ACCESS_TOKEN,
            {
              expiresIn: '12h',
            }
          );

          refreshtoken = jwt.sign(
            { response: { ...login, sessionid } },
            process.env.REFRESH_TOKEN,
            {
              expiresIn: '12h',
            }
          );

          [createfcmtoken] = await trx('fcmtokens').insert({
            userid: login?.userid,
            email: email,
            tenantid: login?.tenantid,
            mobile,
            sessionid: sessionid,
            fcmtoken,
            configid: fixedConfigId,
            roleid: login?.roleid,
            accesstoken: accesstoken,
            refreshtoken: refreshtoken,
          });

          if (!createfcmtoken) {
            throw new Error('createfcmtoken Error!');
          }
          console.log('accesstoken', accesstoken);

          return {
            code: 200,
            status: true,
            message: 'Logged in succcessfully',
            response: accesstoken,
          };

        //mobile
        case 2:
          if (roleid === 1) {
            checkemailexist = await trx('app_users')
              .leftJoin('tenants', 'tenants.userid', 'app_users.userid')
              .where({
                'app_users.authname': email,
                'app_users.roleid': 1,
              })
              .first();

            if (_.isEmpty(checkemailexist)) {
              return {
                code: 400,
                status: false,
                message: 'Email not exist',
              };
            }

            // Compare passwords
            storedpassword = checkemailexist.hashpassword;
            checkpassword = await bcrypt.compare(
              String(password),
              storedpassword
            );

            console.log('chec', checkpassword);

            login = await trx('app_users')
              .leftJoin('tenants', 'tenants.userid', 'app_users.userid')
              .where({
                'app_users.authname': email,
                'app_users.roleid': 1,
              })
              .first();

            if (!checkpassword) {
              return {
                code: 400,
                status: false,
                message: 'Username or password incorrect',
              };
            }
          }

          if (roleid === 3) {
            checkemailexist = await trx('app_users')
              .leftJoin(
                'tenantstaffs',
                'tenantstaffs.userid',
                'app_users.userid'
              )
              .where({
                'app_users.authname': email,
                'app_users.roleid': 3,
              })
              .first();

            if (_.isEmpty(checkemailexist)) {
              return {
                code: 400,
                status: false,
                message: 'Email not exist',
              };
            }

            // Compare passwords
            storedpassword = checkemailexist.hashpassword;
            checkpassword = await bcrypt.compare(
              String(password),
              storedpassword
            );

            console.log('chec', checkpassword);

            login = await trx('app_users')
              .leftJoin(
                'tenantstaffs',
                'tenantstaffs.userid',
                'app_users.userid'
              )
              .where({
                'app_users.authname': email,
                'app_users.roleid': 3,
              })
              .first();

            if (!checkpassword) {
              return {
                code: 400,
                status: false,
                message: 'Username or password incorrect',
              };
            }
          }

          if (roleid === 4) {
            checkemailexist = await trx('app_users')
              .leftJoin('customers', 'customers.userid', 'app_users.userid')
              .where({
                'app_users.authname': email,
                'app_users.roleid': 4,
              })
              .first();

            if (_.isEmpty(checkemailexist)) {
              return {
                code: 400,
                status: false,
                message: 'Email not exist',
              };
            }

            // Compare passwords
            storedpassword = checkemailexist.hashpassword;
            checkpassword = await bcrypt.compare(
              String(password),
              storedpassword
            );

            console.log('chec', checkpassword);

            login = await trx('app_users')
              .leftJoin('customers', 'customers.userid', 'app_users.userid')
              .leftJoin(
                'countries',
                'countries.countryid',
                'customers.countryid'
              )
              .leftJoin('states', 'states.stateid', 'customers.stateid')
              .leftJoin('cities', 'cities.cityid', 'customers.cityid')
              .select(
                'app_users.primarycontact',
                'app_users.roleid',
                'app_users.username',
                'app_users.useruniqueid',
                'app_users.roleid',
                'customers.customerid',
                'customers.customeruniqueid',
                'customers.userid',
                'customers.tenantid',
                'customers.customername',
                'customers.customerimage',
                'customers.customercompanyaddress',
                'customers.customeraddress',
                'customers.customertype',
                'cities.cityid',
                'countries.countryid',
                'states.stateid',
                'countries.countryname',
                'states.statename',
                'cities.cityname'
              )
              .where({
                'app_users.authname': email,
                'app_users.roleid': 4,
              })
              .first();

            if (!checkpassword) {
              return {
                code: 400,
                status: false,
                message: 'Username or password incorrect',
              };
            }
          }

          [sessionid] = await trx('sessions').insert({
            userid: login?.userid,
            tenantid: login?.tenantid,
            fcmtoken,
            configid: fixedConfigId,
            accesstoken,
            refreshtoken,
            roleid,
          });

          if (sessionid === 0) {
            throw new Error('Session id not created');
          }

          accesstoken = jwt.sign(
            { response: { ...login, sessionid } },
            process.env.ACCESS_TOKEN,
            {
              expiresIn: '12h',
            }
          );

          refreshtoken = jwt.sign(
            { response: { ...login, sessionid } },
            process.env.REFRESH_TOKEN,
            {
              expiresIn: '12h',
            }
          );

          [createfcmtoken] = await trx('fcmtokens').insert({
            userid: login?.userid,
            email: email,
            tenantid: login?.tenantid,
            mobile,
            sessionid: sessionid,
            fcmtoken,
            configid: fixedConfigId,
            roleid,
            accesstoken: accesstoken,
            refreshtoken: refreshtoken,
          });

          if (!createfcmtoken) {
            throw new Error('createfcmtoken Error!');
          }

          return {
            code: 200,
            status: true,
            message: 'Logged in succcessfully',
            response: accesstoken,
          };
      }
    });
    return result;
  } catch (err) {
    console.log('err login', err);
    return {
      code: 200,
      status: false,
      message: 'Authenttication failed',
    };
  }
};

module.exports.logout = async (props) => {
  const { fcmtoken, accesstoken, refreshtoken, userid } = props;
  const db = global.dbConnection;
  try {
    const result = await db.transaction(async (trx) => {
      const deletetoken = await trx('fcmtokens')
        .where({
          userid,
          accesstoken,
          fcmtoken,
          sessionid,
        })
        .del();

      if (deletetoken === 0) {
        await trx.rollback();
        throw new Error('Failed to delete fcmtoken');
      }
      return {
        code: 200,
        status: true,
        message: 'Successfully logout',
      };
    });

    return result;
  } catch (err) {
    console.log('logout api err', err);
    return {
      code: 200,
      status: false,
      message: 'Failed to logout',
    };
  }
};

// module.exports.registrationcustomer = async (props) => {
//   const {
//     tenantid,
//     companyid,
//     customername,
//     customerimage,
//     customertype,
//     configid,
//     customerprojects,
//     customerprimaryemail,
//     customeralteremail,
//     customerprimarycontact,
//     customeraltercontact,
//     customercompanyname,
//     customercompanyemail,
//     customercompanyaddress,
//     cityid,
//     stateid,
//     countryid,
//   } = props;

//   const db = global.dbConnection;

//   try {
//     const currentServerDateTime = moment().format("YYYY-MM-DDTHH:mm:ss[Z]");
//     const currentYear = moment().year();

//     // Check for duplicate email or contact
//     const checkEmailExist = await db("registrationcustomers")
//       .where({
//         registrationcustomerprimaryemail: customerprimaryemail,
//         tenantid,
//       })
//       .first();

//     const checkContactExist = await db("registrationcustomers")
//       .where({
//         registrationcustomerprimarycontact: customerprimarycontact,
//         tenantid,
//       })
//       .first();

//     if (customerprimarycontact === customeraltercontact) {
//       return {
//         code: 200,
//         status: false,
//         message: "Primary and alternate contact numbers must not be the same.",
//       };
//     }

//     if (customerprimaryemail === customeralteremail) {
//       return {
//         code: 200,
//         status: false,
//         message: "Primary and alternate email must not be the same.",
//       };
//     }

//     if (checkEmailExist) {
//       return {
//         code: 200,
//         status: false,
//         message: "Customer email already exists",
//       };
//     }

//     if (checkContactExist) {
//       return {
//         code: 200,
//         status: false,
//         message: "Customer contact number already exists",
//       };
//     }

//     // const password = Math.floor(Math.random() * 9000 + 1000).toString();
//     // const hashpassword = bcrypt.hashSync(password, 10);

//     const result = await db.transaction(async (trx) => {
//       //   const [customeruserid] = await trx("app_users").insert({
//       //     companyid,
//       //     tenantid,
//       //     authname: customerprimaryemail,
//       //     username: customername.toUpperCase(),
//       //     password,
//       //     hashpassword,
//       //     primarycontact: customerprimarycontact,
//       //     email: customerprimaryemail,
//       //     roleid: 4,
//       //   });

//       //   if (!customeruserid) throw new Error("Failed to create customer");

//       // const userUniqueId = `RTS-USR-CUST-${currentYear}/${tenantid}${String(
//       //   customeruserid
//       // ).padStart(6, "0")}`;

//       // const updateuniqueid = await trx("app_users")
//       //   .where({ userid: customeruserid })
//       //   .update({ useruniqueid: userUniqueId });

//       // if (updateuniqueid === 0)
//       //   throw new Error("Failed to update user unique ID");

//       const [insertCustomerId] = await trx("registrationcustomers").insert({
//         companyid,
//         tenantid,
//         registrationcustomername: customername.toUpperCase(),
//         registrationcustomerimage: customerimage,
//         configid,
//         registrationcustomertype: customertype,
//         registrationcustomerprimaryemail: customerprimaryemail,
//         registrationcustomeralteremail: customeralteremail,
//         registrationcustomerprimarycontact: customerprimarycontact,
//         registrationcustomeraltercontact: customeraltercontact,
//         registrationcustomercompanyname: customercompanyname
//           ? customercompanyname
//           : "",
//         registrationcustomercompanyemail: customercompanyemail
//           ? customercompanyemail
//           : "",
//         registrationcustomercompanyaddress: customercompanyaddress
//           ? customercompanyaddress
//           : "",
//         cityid,
//         stateid,
//         countryid,
//         registrationcustomerapproval: 2,
//       });

//       if (!insertCustomerId) throw new Error("Failed to insert customer");

//       const customerUniqueId = `RTS-CUST-${currentYear}/${tenantid}${String(
//         insertCustomerId
//       ).padStart(6, "0")}`;

//       const updateUniqueID = await trx("registrationcustomers")
//         .where({ registrationcustomerid: insertCustomerId })
//         .update({ registrationcustomeruniqueid: customerUniqueId });

//       if (updateUniqueID === 0)
//         throw new Error("Failed to update customer unique ID");

//       if (!_.isEmpty(customerprojects)) {
//         for (const proj of customerprojects) {
//           const [customerprojectid] = await trx(
//             "registrationcustomerprojects"
//           ).insert({
//             registrationcustomerid: insertCustomerId,
//             tenantid,
//             registrationcustomerprojectname: proj.projectname,
//           });

//           if (!customerprojectid)
//             throw new Error("Failed to insert customer project");

//           if (!_.isEmpty(proj.buildings)) {
//             for (const build of proj.buildings) {
//               const [customerbuildingid] = await trx(
//                 "registrationcustomerbuildings"
//               ).insert({
//                 registrationcustomerid: insertCustomerId,
//                 registrationcustomerprojectid: customerprojectid,
//                 registrationcustomerbuildingname: build,
//               });

//               if (!customerbuildingid)
//                 throw new Error("Failed to insert customer building");
//             }
//           }
//         }
//       }

//       // if (customerprimaryemail) {
//       //   const mailProps = {
//       //     tenantid,
//       //     customerprimaryemail,
//       //     customerprimarycontact,
//       //     customername,
//       //     password,
//       //   };
//       //   await mailService.customerRegistrationMail(mailProps);
//       // }

//       return {
//         code: 200,
//         status: true,
//         message: "Customer created successfully",
//         response: {
//           tenantid,
//           customername,
//           customeruniqueid: customerUniqueId,
//         },
//         notifydata: {
//           customername,
//           customeruniqueid: customerUniqueId,
//         },
//         mailProps: {
//           tenantid,
//           customerprimaryemail,
//           customerprimarycontact,
//           customername,
//           customertype,
//         },
//       };
//     });

//     return result;
//   } catch (err) {
//     console.error("Error creating customer:", err);
//     return { code: 500, status: false, message: "Failed to create customer" };
//   }
// };

module.exports.registration = async (props) => {
  const { firstname, lastname, email, password } = props;
  const db = global.dbConnection;

  try {
    // Ensure DB connection exists
    if (!db) {
      throw new Error('Database connection is not available');
    }

    const currentServerDateTime = moment().format('YYYY-MM-DDTHH:mm:ss[Z]');
    const currentYear = moment().year();

    // Check if email already exists in appusers table
    const existingUser = await db('app_users')
      .where({ email: email }) // ✅ Correct column name
      .first();

    if (existingUser) {
      return {
        code: 409, // 409 Conflict (Better than 200 for existing email)
        status: false,
        message: 'Email already exists',
      };
    }

    // Hash the password asynchronously
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user record into appusers
    const [insertUserId] = await db('app_users')
      .insert({
        created: currentServerDateTime, // ✅ Correct column name
        email: email, // ✅ Correct column name
        username: `${firstname} ${lastname}`.toUpperCase(),
        password: hashedPassword, // ✅ Correct column name
      })
      .returning('userid'); // Ensure ID is returned

    if (!insertUserId) {
      throw new Error('Failed to insert user record');
    }

    // Generate unique User ID
    const userUniqueId = `USR-${currentYear}-${String(insertUserId).padStart(
      6,
      '0'
    )}`;

    // Update record with unique User ID
    await db('app_users')
      .where({ userid: insertUserId })
      .update({ useruniqueid: userUniqueId });

    return {
      code: 201, // 201 Created
      status: true,
      message: 'User registered successfully',
      response: {
        userUniqueId,
        firstname,
        lastname,
        email,
      },
    };
  } catch (error) {
    console.error('❌ Error registering user:', error.message);
    return {
      code: 500,
      status: false,
      message: 'Internal server error: Failed to register user',
    };
  }
}; // validate email for fortgot password
module.exports.validateUserEmail = async (props) => {
  const { email } = props;
  const db = global.dbConnection;
  try {
    const result = await db.transaction(async (trx) => {
      const checkvaliduser = await trx('app_users')
        .where({
          'app_users.authname': email,
          'app_users.email': email,
        })
        .first();

      if (_.isEmpty(checkvaliduser)) {
        await trx.rollback();
        return {
          code: 200,
          status: false,
          message: 'User email not valid',
        };
      }

      const otp = Math.floor(1000 + Math.random() * 9000).toString(); // Generate 4-digit OTP

      const updateuser = await trx('app_users')
        .update({
          'app_users.forgototp': otp,
        })
        .where({
          'app_users.authname': email,
          'app_users.email': email,
        });

      if (updateuser === 0) {
        await trx.rollback();

        return {
          code: 200,
          status: false,
          message: 'User email not valid',
        };
      }

      if (!_.isEmpty(checkvaliduser)) {
        return {
          code: 200,
          status: true,
          message: 'Please check your email otp sent successfully',
          mailProps: {
            email: email,
            userid: checkvaliduser.userid,
            otp: otp,
          },
        };
      }
    });

    return result;
  } catch (err) {
    console.log('forgotPassword Error', err);
  }
};

module.exports.validateUserOTP = async (props) => {
  const { email, otp } = props;
  const db = global.dbConnection;
  try {
    const result = await db.transaction(async (trx) => {
      const checkvaliduser = await trx('app_users').where({
        'app_users.email': email,
        'app_users.forgototp': otp,
      });

      if (_.isEmpty(checkvaliduser)) {
        return {
          code: 200,
          status: false,
          message: 'Please check your email or otp is correct',
        };
      }

      if (!_.isEmpty(checkvaliduser)) {
        return {
          code: 200,
          status: true,
          message: 'OTP is validated successfully',
        };
      }
    });

    return result;
  } catch (err) {
    console.log('validateUserOTP Error', err);
    return {
      code: 200,
      status: false,
      message: 'Please check your email or otp is correct',
    };
  }
};

module.exports.setNewPassword = async (props) => {
  const { email, password, retypepassword } = props;
  const db = global.dbConnection;

  try {
    const result = await db.transaction(async (trx) => {
      // Check if the user exists
      const checkvaliduser = await trx('app_users').where({ email }).first();

      if (_.isEmpty(checkvaliduser)) {
        return {
          code: 200,
          status: false,
          message: 'Please check your email',
        };
      }

      // Validate that passwords are numeric and match
      if (!/^\d+$/.test(password) || !_.isEqual(password, retypepassword)) {
        return {
          code: 200,
          status: false,
          message: 'Passwords must be same',
        };
      }

      // Convert password to string and hash it
      const hashpassword = bcrypt.hashSync(password.toString(), 10);

      // Update the user's password
      const updatePassword = await trx('app_users')
        .where({ email, userid: checkvaliduser.userid })
        .update({
          password: password,
          hashpassword: hashpassword, // Store the hashed password
          forgototp: 0, // Clear the forgot OTP
        });

      if (updatePassword === 0) {
        return {
          code: 200,
          status: false,
          message: 'Your password could not be updated',
        };
      }

      return {
        code: 200,
        status: true,
        message: 'Your password has been updated successfully',
      };
    });

    return result;
  } catch (err) {
    console.error('setNewPassword Error', err);
    return {
      code: 500,
      status: false,
      message: 'An error occurred while updating your password',
    };
  }
};

module.exports.getUserByID = async (props) => {
  const { userid, tenantid, roleid } = props;
  const db = global.dbConnection;
  try {
    let users;

    const result = db.transaction(async (trx) => {
      switch (roleid) {
        case 1:
          users = await trx('app_users')
            .leftJoin('tenants', 'tenants.userid', 'app_users.userid')
            .select(
              'app_users.userid',
              'app_users.useruniqueid',
              'app_users.username',
              'tenants.tenantid',
              'tenants.tenantname',
              'tenants.tenantprimarycontact as primarycontact',
              'tenants.tenantaltercontact as altercontact',
              'tenants.tenantprimaryemail as primaryemail',
              'tenants.tenantalteremail as alteremail',
              'tenants.tenantimage as userimage',
              'tenants.tenantsignatureurl as signatureurl'
            )
            .where({
              'app_users.userid': userid,
              'app_users.tenantid': tenantid,
              'app_users.roleid': roleid,
            })
            .first();

          if (!_.isEmpty(users)) {
            return {
              code: 200,
              status: true,
              message: 'Data fetched successfully',
              response: users,
            };
          }

          if (_.isEmpty(users)) {
            return {
              code: 200,
              status: true,
              message: 'No data fetched successfully',
              response: [],
            };
          }
          break;
        case 2:
          users = await trx('app_users')
            .leftJoin('admins', 'admins.userid', 'app_users.userid')
            .select(
              'app_users.userid',
              'app_users.useruniqueid',
              'app_users.username',
              'admins.adminid',
              'admins.adminname',
              'admins.adminprimarycontact as primarycontact',
              'admins.adminaltercontact as altercontact',
              'admins.adminprimaryemail as primaryemail',
              'admins.adminalteremail as alteremail',
              'admins.adminimage as userimage',
              'admins.adminsignature as signatureurl'
            )
            .where({
              'app_users.userid': userid,
              'app_users.tenantid': tenantid,
              'app_users.roleid': roleid,
            })
            .first();

          if (!_.isEmpty(users)) {
            return {
              code: 200,
              status: true,
              message: 'Data fetched successfully',
              response: users,
            };
          }

          if (_.isEmpty(users)) {
            return {
              code: 200,
              status: true,
              message: 'No data fetched successfully',
              response: [],
            };
          }
          break;
        default:
          return {
            code: 400,
            status: false,
            message: 'Invalid roleid',
          };
      }
    });

    return result;
  } catch (err) {
    console.log('user err', err);
    return {
      code: 200,
      status: false,
      message: 'Failed to user data',
    };
  }
};

module.exports.editUserProfile = async (props) => {
  const {
    userid,
    roleid,
    username,
    primaryemail,
    alteremail,
    primarycontact,
    altercontact,
    userimage,
    signatureurl,
  } = props;
  const db = global.dbConnection;
  try {
    console.log('userimage', userimage);

    let editprofile;
    let edituser;

    const result = await db.transaction(async (trx) => {
      switch (roleid) {
        case 1:
          editprofile = await trx('tenants')
            .update({
              tenantname: username.toUpperCase(),
              tenantprimaryemail: primaryemail,
              tenantalteremail: alteremail,
              tenantprimarycontact: primarycontact,
              tenantaltercontact: altercontact,
              tenantimage: userimage,
              tenantsignatureurl: signatureurl,
            })
            .where({
              userid: userid,
            });

          if (editprofile === 0) {
            throw new Error('editprofile error occured');
          }

          edituser = await trx('app_users')
            .update({
              authname: primaryemail,
              username: username.toUpperCase(),
              primarycontact: primarycontact,
              email: primaryemail,
              userimage: userimage,
            })
            .where({
              userid: userid,
            });

          if (editprofile === 0) {
            throw new Error('edituser error occured');
          }

          if (editprofile > 0 && edituser > 0) {
            return {
              code: 200,
              status: true,
              message: 'Profile updated successfully',
            };
          }

          break;

        case 2:
          editprofile = await trx('admins')
            .update({
              adminname: username.toUpperCase(),
              adminalteremail: primaryemail,
              adminalteremail: alteremail,
              adminprimarycontact: primarycontact,
              adminaltercontact: altercontact,
              adminimage: userimage,
              adminsignature: signatureurl,
            })
            .where({
              userid: userid,
            });

          if (editprofile === 0) {
            throw new Error('editprofile error occured');
          }

          edituser = await trx('app_users')
            .update({
              authname: primaryemail,
              username: username.toUpperCase(),
              primarycontact: primarycontact,
              email: primaryemail,
              userimage: userimage,
            })
            .where({
              userid: userid,
            });

          if (editprofile === 0) {
            throw new Error('edituser error occured');
          }

          if (editprofile > 0 && edituser > 0) {
            return {
              code: 200,
              status: true,
              message: 'Profile updated successfully',
            };
          }

          break;

        default:
          return {
            code: 200,
            status: false,
            message: 'Invalid key provided',
          };
      }
    });

    return result;
  } catch (err) {
    console.log('editProfile err', err);
    return {
      code: 200,
      status: false,
      message: 'Failed to edit profile',
    };
  }
};

// Oauth
// const passport = require("passport");
// const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
// const jwt = require("jsonwebtoken");
// const { createUser } = require("../services/userService");
// const { config } = require("./utils");
// const serverCallBackUrl = config.get("oAuth.serverCallBackUrl");
// passport.use(
//   new GoogleStrategy(
//
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         // Check if the user exists in the database
//         let user = await db("app_user")
//           .where({ email: profile.emails[0].value })
//           .first();
//         if (!user) {
//           user = await createUser({
//             googleId: profile.id,
//             email: profile.emails[0].value,
//             firstName: profile.name.givenName,
//             lastName: profile.name.givenName,
//             profilePic: profile.photos[0].value,
//           });
//         }
//         console.log("User Before Callback : ", user);
//         done(null, { ...user });
//       } catch (err) {
//         done(err, null);
//       }
//     }
//   )
// );
// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });
// passport.deserializeUser(async (id, done) => {
//   try {
//     const user = await db("app_user").where({ appUserId: id }).first();
//     done(null, user);
//   } catch (err) {
//     done(err);
//   }
// });
// const generateToken = (user) => {
//   return jwt.sign(
//     { id: user.appUserId, email: user.email },
//     process.env.JWT_SECRET,
//     {
//       expiresIn: "1h",
//     }
//   );
// };
// module.exports = { passport, generateToken };
