const _ = require("lodash");
const moment = require("moment");
const bcrypt = require("bcrypt");
const mailService = require("../../../../mail/mailService");

module.exports.convertCustomer = async (props) => {
  const { leadid, tenantid, userid } = props;
  const db = global.dbConnection;

  try {
    const currentYear = moment().year();

    // Check if the lead already exists as a customer
    const checkLeadExist = await db("customers")
      .where({ leadid, tenantid })
      .first();

    if (!_.isEmpty(checkLeadExist)) {
      return {
        code: 200,
        status: true,
        message: "Already this lead converted to customer",
      };
    }

    // Start a transaction
    const result = await db.transaction(async (trx) => {
      const currentServerDateTimeUTC = moment()
        .utc()
        .format("YYYY-MM-DDTHH:mm:ss[Z]");
      const password = Math.floor(Math.random() * 9000 + 1000).toString();
      const hashpassword = bcrypt.hashSync(password, 10);

      // Fetch the last customer and user IDs
      const lastCustomer = await trx("customers")
        .select("tenantcustomerid")
        .where({ tenantid })
        .orderBy("customerid", "desc")
        .first();

      const lastUser = await trx("app_users")
        .select("tenantuserid")
        .where({ tenantid })
        .orderBy("tenantuserid", "desc")
        .first();

      const newTenantCustomerID = lastCustomer
        ? lastCustomer.tenantcustomerid + 1
        : 1;
      const newTenantUserID = lastUser ? lastUser.tenantuserid + 1 : 1;

      // Fetch lead data
      const getLeadData = await trx("leads")
        .where({ leadid, tenantid })
        .first();

      // console.log(getLeadData);

      // Insert new user
      const [insertedUserId] = await trx("app_users").insert({
        tenantuserid: newTenantUserID,
        authname: getLeadData.customerprimaryemail,
        username: getLeadData.leadname.toUpperCase(),
        password,
        hashpassword,
        primarycontact: getLeadData.customerprimarycontact,
        email: getLeadData.customerprimaryemail,
        roleid: 4,
        tenantid,
      });

      const userUniqueId = `LMS_CUST-${currentYear}_USR/${tenantid}${String(
        insertedUserId
      ).padStart(6, "0")}`;

      // Update user with unique ID
      await trx("app_users")
        .where({ userid: insertedUserId })
        .update({ useruniqueid: userUniqueId });

      // Insert new customer
      const [insertCustomerId] = await trx("customers").insert({
        tenantcustomerid: newTenantCustomerID,
        customerimage: getLeadData.leadimage,
        tenantid,
        leadid,
        adduserid: userid,
        customername: getLeadData.leadname.toUpperCase(),
        configid: getLeadData.configid,
        tenantleadid: getLeadData.tenantleadid,
        leadsourceid: getLeadData.leadsourceid,
        priorityid: getLeadData.priorityid,
        leadstatusid: getLeadData.leadstatusid,
        leadstageid: getLeadData.leadstageid,
        customerprimaryemail: getLeadData.customerprimaryemail,
        customeralteremail: getLeadData.customeralteremail,
        customerprimarycontact: getLeadData.customerprimarycontact,
        customeraltercontact: getLeadData.customeraltercontact,
        companyname: getLeadData.companyname,
        customercompanyemail: getLeadData.customercompanyemail,
        customercompanyaddress: getLeadData.customercompanyaddress,
        converteddate: currentServerDateTimeUTC,
        description: getLeadData.description,
        address: getLeadData.address,
        cityid: getLeadData.cityid,
        stateid: getLeadData.stateid,
        countryid: getLeadData.countryid,
      });

      if (!insertCustomerId) {
        throw new Error("Failed to add customer to table");
      }

      const customerUniqueId = `LMS_CUST-${currentYear}/${tenantid}${String(
        newTenantCustomerID
      ).padStart(6, "0")}`;

      // Update customer with unique ID
      const updateUniqueID = await trx("customers")
        .where({ customerid: insertCustomerId })
        .update({ customeruniqueid: customerUniqueId });

      if (updateUniqueID === 0) {
        throw new Error("Failed to update customer unique ID");
      }

      return {
        code: 200,
        status: true,
        message: "Successfully converted lead to customer",
      };
    });

    return result;
  } catch (err) {
    console.error(err);
    return {
      code: 500,
      status: false,
      message: "Failed to convert lead to customer",
    };
  }
};

module.exports.createCustomer = async (props) => {
  const {
    tenantid,
    userid,
    companyid,
    customertype,
    customername,
    customertrnno,
    customerimage,
    customeraddress,
    configid,
    customerprojects,
    customerprimaryemail,
    customeralteremail,
    customerprimarycontact,
    customeraltercontact,
    customercompanyname,
    customercompanyemail,
    customercompanyaddress,
    cityid,
    stateid,
    countryid,
  } = props;

  const db = global.dbConnection;

  try {
    const currentServerDateTimeUTC = moment()
      .format("YYYY-MM-DDTHH:mm:ss[Z]");

    const currentYear = moment().year();

    // Check for duplicate email or contact
    const checkEmailExist = await db("app_users")
      .where({ authname: customerprimaryemail,  tenantid })
      .first();

    const checkContactExist = await db("app_users")
      .where({ primarycontact: customerprimarycontact, tenantid })
      .first();

    if (customerprimarycontact === customeraltercontact) {
      return {
        code: 200,
        status: false,
        message: "Primary and alternate contact numbers must not be the same.",
      };
    }

    if (customerprimaryemail === customeralteremail) {
      return {
        code: 200,
        status: false,
        message: "Primary and alternate email must not be the same.",
      };
    }

    if (checkEmailExist) {
      return {
        code: 200,
        status: false,
        message: "Customer email already exists",
      };
    }

    if (checkContactExist) {
      return {
        code: 200,
        status: false,
        message: "Customer contact number already exists",
      };
    }

    const password = Math.floor(Math.random() * 9000 + 1000).toString();
    const hashpassword = bcrypt.hashSync(password, 10);

    console.log('hashpassword', hashpassword);
    

    const result = await db.transaction(async (trx) => {
      const [customeruserid] = await trx("app_users").insert({
        companyid,
        tenantid,
        authname: customerprimaryemail,
        username: customername.toUpperCase(),
        password,
        hashpassword,
        primarycontact: customerprimarycontact,
        email: customerprimaryemail,
        userimage: customerimage,
        roleid: 4,
      });

      if (!customeruserid) throw new Error("Failed to create customer");

      const userUniqueId = `RTS-USR-CUST-${currentYear}/${tenantid}${String(
        customeruserid
      ).padStart(6, "0")}`;

      const updateuniqueid = await trx("app_users")
        .where({ userid: customeruserid })
        .update({ useruniqueid: userUniqueId });

      if (updateuniqueid === 0)
        throw new Error("Failed to update user unique ID");

      const [insertCustomerId] = await trx("customers").insert({
        userid: customeruserid,
        companyid,
        customertype,
        tenantid,
        adduserid: userid,
        customername: customername,
        customertrnno,
        customerimage,
        configid,
        customerprimaryemail,
        customeraddress,
        customeralteremail,
        customerprimarycontact,
        customeraltercontact,
        customercompanyname,
        customercompanyemail,
        customercompanyaddress,
        converteddate: currentServerDateTimeUTC,
        cityid,
        stateid,
        countryid,
      });

      if (!insertCustomerId) throw new Error("Failed to insert customer");

      const customerUniqueId = `RTS-CUST-${currentYear}/${tenantid}${String(
        insertCustomerId
      ).padStart(6, "0")}`;

      const updateUniqueID = await trx("customers")
        .where({ customerid: insertCustomerId })
        .update({ customeruniqueid: customerUniqueId });

      if (updateUniqueID === 0)
        throw new Error("Failed to update customer unique ID");

      if (!_.isEmpty(customerprojects)) {
        for (const proj of customerprojects) {
          const [customerprojectid] = await trx("customerprojects").insert({
            customerid: insertCustomerId,
            tenantid,
            customerprojectname: proj.projectname,
          });

          if (!customerprojectid)
            throw new Error("Failed to insert customer project");

          if (!_.isEmpty(proj.buildings)) {
            for (const build of proj.buildings) {
              const [customerbuildingid] = await trx(
                "customerbuildings"
              ).insert({
                customerid: insertCustomerId,
                customerprojectid,
                tenantid,
                customerbuildingname: build,
              });

              if (!customerbuildingid)
                throw new Error("Failed to insert customer building");
            }
          }
        }
      }

      // if (customerprimaryemail) {
      //   const mailProps = {
      //     tenantid,
      //     customerprimaryemail,
      //     customerprimarycontact,
      //     customername,
      //     password,
      //   };
      //   await mailService.customerRegistrationMail(mailProps);
      // }

      return {
        code: 200,
        status: true,
        message: "Customer created successfully",
        notifydata: {
          tenantid,
          customername,
          customeruniqueid: customerUniqueId,
        },
        mailProps: {
          tenantid,
          customerprimaryemail,
          customerprimarycontact,
          customername,
          password,
        },
      };
    });

    return result;
  } catch (err) {
    console.error("Error creating customer:", err);
    return { code: 500, status: false, message: "Failed to create customer" };
  }
};

module.exports.editCustomer = async (props) => {
  const {
    customerid,
    companyid,
    appuserid,
    tenantid,
    userid,
    customername,
    customertrnno,
    customerimage,
    customertype,
    configid,
    customeraddress,
    customerprojects,
    customerprimaryemail,
    customeralteremail,
    customerprimarycontact,
    customeraltercontact,
    customercompanyname,
    customercompanyemail,
    customercompanyaddress,
    address,
    cityid,
    stateid,
    countryid,
  } = props;

  console.log('customertrnno', customertrnno);

  const db = global.dbConnection;

  try {
    // Check if the primary email is already in use by another customer
    const emailExists = await db("app_users")
      .where({ authname: customerprimaryemail, tenantid })
      .andWhereNot({ userid: appuserid })
      .first();

    // Check if the primary contact number is already in use by another customer
    const contactExists = await db("app_users")
      .where({ primarycontact: customerprimarycontact, tenantid })
      .andWhereNot({ userid: appuserid })
      .first();

    // Return error if email or contact already exists
    if (emailExists) {
      return {
        status: false,
        message: "Customer primary email already in use",
        code: 200,
      };
    }

    if (contactExists) {
      return {
        status: false,
        message: "Customer primary contact already in use",
        code: 200,
      };
    }

    if (customerprimarycontact === customeraltercontact) {
      return {
        code: 200,
        status: false,
        message: "Primary and alternate contact numbers must not be the same.",
      };
    }

    if (customerprimaryemail === customeralteremail) {
      return {
        code: 200,
        status: false,
        message: "Primary and alternate email must not be the same.",
      };
    }

    // Proceed with the transaction to update customer and user data
    const result = await db.transaction(async (trx) => {
      // Update user details in app_users table
      const editedUserCount = await trx("app_users")
        .update({
          authname: customerprimaryemail,
          companyid: companyid,
          username: customername.toUpperCase(),
          primarycontact: customerprimarycontact,
          email: customerprimaryemail,
          userimage: customerimage,
        })
        .where({ tenantid, userid: appuserid });

      if (editedUserCount === 0) {
        throw new Error("Failed to edit user in the user table!");
      }

      // Update customer details in customers table
      const editedCustomerCount = await trx("customers")
        .update({
          tenantid,
          companyid,
          adduserid: userid,
          customername: customername,
          customertrnno,
          customerimage,
          customertype,
          configid,
          customerprimaryemail,
          customeralteremail,
          customerprimarycontact,
          customeraltercontact,
          customercompanyname: customercompanyname || "",
          customercompanyemail: customercompanyemail || "",
          customercompanyaddress: customercompanyaddress || "",
          customeraddress: customeraddress || "",
          address,
          cityid,
          stateid,
          countryid,
        })
        .where({ customerid, tenantid });

      if (editedCustomerCount === 0) {
        throw new Error("Failed to edit customer in the customer table!");
      }

      // inserting the projetcs against buildings --> new
      if (!_.isEmpty(customerprojects)) {
        //if exist customer projects delete
        const existProject = await trx("customerprojects").where({
          customerid,
          tenantid,
        });

        if (!_.isEmpty(existProject)) {
          await trx("customerprojects")
            .where({
              customerid,
              tenantid,
            })
            .del();
        }

        await Promise.all(
          customerprojects.map(async (proj) => {
            const [customerprojectid] = await trx("customerprojects").insert({
              customerid: customerid,
              tenantid,
              customerprojectname: proj.projectname,
            });

            if (!_.isEmpty(proj.buildings)) {
              //if exist customer buildings delete
              const existProject = await trx("customerbuildings").where({
                customerid,
                tenantid,
              });

              if (!_.isEmpty(existProject)) {
                await trx("customerbuildings")
                  .where({
                    customerprojectid,
                    customerid,
                    tenantid,
                  })
                  .del();
              }

              //insert customer buildings
              await Promise.all(
                proj.buildings.map(async (build) => {
                  await trx("customerbuildings").insert({
                    customerid: customerid,
                    customerprojectid: customerprojectid,
                    tenantid,
                    customerbuildingname: build,
                  });
                })
              );
            }
          })
        );
      }

      // If all updates succeed, return a success response
      return {
        code: 200,
        status: true,
        message: "Customer edited successfully",
      };
    });

    return result;
  } catch (err) {
    // Log error for debugging
    console.error("Error editing customer:", err.message);

    // Return an error response
    return {
      code: 500,
      status: false,
      message: "Failed to edit customer due to an internal server error.",
    };
  }
};

module.exports.getCustomer = async (props) => {
  const { key, customerid, tenantid, companyid, customerapproval, customertype } = props;
  const db = global.dbConnection;

  try {
    let query = db("customers")
      .leftJoin("countries", "countries.countryid", "customers.countryid")
      .leftJoin("states", "states.stateid", "customers.stateid")
      .leftJoin("cities", "cities.cityid", "customers.cityid")
      .leftJoin("company", "company.companyid", "customers.companyid")
      .select(
        "customers.*",
        "company.*",
        "countries.countryname",
        "states.statename",
        "cities.cityname"
      )
      .orderBy("customers.customerid", "DESC")
      .where({ "customers.tenantid": tenantid });

    if (customerid) {
      query = query.where({ "customers.customerid": customerid });
    }

    if (companyid) {
      query = query.where({ "customers.companyid": companyid });
    }

    if (customerapproval) {
      query = query.where({ "customers.customerapproval": customerapproval });
    }

    if (customertype) {
      console.log('customertype', customertype)
      query = query.where({ "customers.customertype": customertype });
    }

    if (key === 1) {
      query = query.where({ "customers.customerstatus": 1 });
    } else if (key === 2) {
      query = query.where({ "customers.customerstatus": 2 });
    }

    const response = await query;

    const counts = await this.getCustomerCounts(props);

    if (!_.isEmpty(response)) {
      return {
        code: 200,
        status: true,
        message: "Successfully retrieved customers data",
        response: response,
        counts: counts, // Include all counts here
      };
    } else {
      return {
        code: 200,
        status: true,
        message: "No customers data fetched",
        response: [],
        counts: counts, // Include all counts here
      };
    }
  } catch (err) {
    console.error(err);
    return {
      code: 500,
      status: false,
      message: "Failed to fetch customers data",
      response: [],
      counts: {
        total_count: 0,
        active_count: 0,
        inactive_count: 0,
      },
    };
  }
};

module.exports.getRegistrationCustomer = async (props) => {
  const { key, customerid, tenantid, companyid, customerapproval } = props;
  const db = global.dbConnection;

  try {
    let query = db("registrationcustomers")
      .leftJoin(
        "countries",
        "countries.countryid",
        "registrationcustomers.countryid"
      )
      .leftJoin("states", "states.stateid", "registrationcustomers.stateid")
      .leftJoin("cities", "cities.cityid", "registrationcustomers.cityid")
      .leftJoin(
        "company",
        "company.companyid",
        "registrationcustomers.companyid"
      )
      .select(
        "registrationcustomers.*",
        "company.*",
        "countries.countryname",
        "states.statename",
        "cities.cityname"
      )
      .orderBy("registrationcustomers.registrationcustomerid", "DESC")
      .where({ "registrationcustomers.tenantid": tenantid });

    if (customerid) {
      query = query.where({
        "registrationcustomers.registrationcustomerid": customerid,
      });
    }

    if (companyid) {
      query = query.where({ "registrationcustomers.companyid": companyid });
    }

    if (customerapproval) {
      query = query.where({
        "registrationcustomers.registrationcustomerapproval": customerapproval,
      });
    }

    if (key === 1) {
      query = query.where({
        "registrationcustomers.registrationcustomerstatus": 1,
      });
    } else if (key === 2) {
      query = query.where({
        "registrationcustomers.registrationcustomerstatus": 2,
      });
    }

    const response = await query;

    const counts = await this.getRegistrationCustomerCounts(props);

    if (!_.isEmpty(response)) {
      return {
        code: 200,
        status: true,
        message: "Successfully retrieved customers data",
        response: response,
        counts: counts, // Include all counts here
      };
    } else {
      return {
        code: 200,
        status: true,
        message: "No customers data fetched",
        response: [],
        counts: counts, // Include all counts here
      };
    }
  } catch (err) {
    console.error(err);
    return {
      code: 500,
      status: false,
      message: "Failed to fetch customers data",
      response: [],
      counts: {
        total_count: 0,
        active_count: 0,
        inactive_count: 0,
      },
    };
  }
};

module.exports.getCustomerCounts = async (props) => {
  const { tenantid } = props;
  const db = global.dbConnection;

  try {
    const result = await db("customers")
      .select([
        db.raw("COUNT(*) as total_count"),
        db.raw(
          "SUM(CASE WHEN customerstatus = 1 THEN 1 ELSE 0 END) as active_count"
        ),
        db.raw(
          "SUM(CASE WHEN customerstatus = 2 THEN 1 ELSE 0 END) as inactive_count"
        ),
      ])
      .where({ tenantid: tenantid });

    const counts = result[0]; // Extract counts from the result array

    return {
      total_count: Number(counts.total_count),
      active_count: Number(counts.active_count),
      inactive_count: Number(counts.inactive_count),
    };
  } catch (err) {
    console.error(err);
    return {
      total_count: 0,
      active_count: 0,
      inactive_count: 0,
    };
  }
};

module.exports.getRegistrationCustomerCounts = async (props) => {
  const { tenantid } = props;
  const db = global.dbConnection;

  try {
    const result = await db("registrationcustomers")
      .select([
        db.raw("COUNT(*) as total_count"),
        db.raw(
          "SUM(CASE WHEN registrationcustomerapproval = 1 THEN 1 ELSE 0 END) as active_count"
        ),
        db.raw(
          "SUM(CASE WHEN registrationcustomerapproval = 2 THEN 1 ELSE 0 END) as inactive_count"
        ),
      ])
      .where({ tenantid: tenantid });

    const counts = result[0]; // Extract counts from the result array

    return {
      total_count: Number(counts.total_count),
      active_count: Number(counts.active_count),
      inactive_count: Number(counts.inactive_count),
    };
  } catch (err) {
    console.error(err);
    return {
      total_count: 0,
      active_count: 0,
      inactive_count: 0,
    };
  }
};

module.exports.updateCustomerStatus = async (props) => {
  const { customerid, tenantid, userid, key } = props;
  const db = global.dbConnection;
  try {
    const checkUserValid = await db("app_users").where({
      "app_users.userid": userid,
      "app_users.tenantid": tenantid,
    });

    const checkcustomersExist = await db("customers").where({
      customerid: customerid,
      tenantid: tenantid,
    });

    if (_.isEmpty(checkUserValid)) {
      return { code: 200, status: false, message: "You are a not valid user" };
    }

    if (_.isEmpty(checkcustomersExist)) {
      return { code: 200, status: false, message: "This customer not exist" };
    }
    const result = db.transaction(async (trx) => {
      switch (key) {
        case 1:
          const active = await trx("customers")
            .update({
              customerstatus: 1,
            })
            .where({
              customerid: customerid,
              tenantid: tenantid,
            });
          if (active > 0) {
            return {
              code: 200,
              status: true,
              message: "Customer active successful",
            };
          } else {
            return {
              code: 200,
              status: false,
              message: "Failed to customers active",
            };
          }

        case 2:
          const inactive = await trx("customers")
            .update({
              customerstatus: 2,
            })
            .where({
              customerid: customerid,
              tenantid: tenantid,
            });
          if (inactive > 0) {
            return {
              code: 200,
              status: true,
              message: "Customer inactive successful",
            };
          } else {
            return {
              code: 200,
              status: false,
              message: "Failed to customer inactive",
            };
          }
      }
    });

    return result;
  } catch (err) {
    console.log(err);
    return {
      code: 200,
      status: false,
      message: "Failed to update customer status",
    };
  }
};

module.exports.getCustomerById = async (props) => {
  const { customerid, tenantid } = props;
  const db = global.dbConnection;

  try {
    const response = await db("customers")
      .leftJoin("app_users", "app_users.userid", "customers.userid")
      .leftJoin("countries", "countries.countryid", "customers.countryid")
      .leftJoin("states", "states.stateid", "customers.stateid")
      .leftJoin("cities", "cities.cityid", "customers.cityid")
      .leftJoin("company", "company.companyid", "customers.companyid")
      .select(
        "app_users.password",
        "customers.*",
        "company.*",
        "countries.countryname",
        "states.statename",
        "cities.cityname"
      )
      .orderBy("customers.customerid", "DESC")
      .where({
        "customers.tenantid": tenantid,
        "customers.customerid": customerid,
      })
      .first();

    const customerprojects = await db("customerprojects")
      .select(
        "customerprojects.customerprojectid",
        "customerprojects.customerprojectname"
      )
      .where({
        "customerprojects.customerid": response.customerid,
        "customerprojects.tenantid": response.tenantid,
      });
    response.customerprojects = !_.isEmpty(customerprojects)
      ? customerprojects
      : [];

    await Promise.all(
      customerprojects.map(async (proj) => {
        const buildings = await db("customerbuildings")
          .select("customerbuildings.customerbuildingname")
          .where({
            "customerbuildings.customerid": response.customerid,
            "customerbuildings.tenantid": response.tenantid,
            "customerbuildings.customerprojectid": proj.customerprojectid,
          });

        proj.buildings =
          buildings.length > 0
            ? buildings.map((b) => b.customerbuildingname)
            : [];

            const buildingsapp = await db("customerbuildings")
            .where({
              "customerbuildings.customerid": response.customerid,
              "customerbuildings.tenantid": response.tenantid,
              "customerbuildings.customerprojectid": proj.customerprojectid,
            });
  
          proj.buildingsapp =
          buildingsapp
              ? buildingsapp
              : [];
      })
    );

    if (!_.isEmpty(response)) {
      return {
        code: 200,
        status: true,
        message: "Successfully retrieved customers data",
        response: response,
      };
    } else {
      return {
        code: 200,
        status: true,
        message: "No customers data fetched",
        response: [],
      };
    }
  } catch (err) {
    console.error(err);
    return {
      code: 500,
      status: false,
      message: "Failed to fetch customers data",
      response: [],
    };
  }
};

module.exports.getCustomerByIdApp = async (props) => {
  const { customerid, tenantid } = props;
  const db = global.dbConnection;

  try {
    const response = await db("customers")
      .leftJoin("countries", "countries.countryid", "customers.countryid")
      .leftJoin("states", "states.stateid", "customers.stateid")
      .leftJoin("cities", "cities.cityid", "customers.cityid")
      .leftJoin("company", "company.companyid", "customers.companyid")
      .select(
        "customers.*",
        "company.*",
        "countries.countryname",
        "states.statename",
        "cities.cityname"
      )
      .orderBy("customers.customerid", "DESC")
      .where({
        "customers.tenantid": tenantid,
        "customers.customerid": customerid,
      })
      .first();

    const customerprojects = await db("customerprojects")
      .select(
        "customerprojects.customerprojectid",
        "customerprojects.customerprojectname"
      )
      .where({
        "customerprojects.customerid": response.customerid,
        "customerprojects.tenantid": response.tenantid,
      });
    response.customerprojects = !_.isEmpty(customerprojects)
      ? customerprojects
      : [];

    await Promise.all(
      customerprojects.map(async (proj) => {
        const buildings = await db("customerbuildings")
          .select(
            "customerbuildings.customerbuildingname",
            "customerbuildings.customerbuildingid"
          )
          .where({
            "customerbuildings.customerid": response.customerid,
            "customerbuildings.tenantid": response.tenantid,
            "customerbuildings.customerprojectid": proj.customerprojectid,
          });

        proj.buildings = buildings;
      })
    );

    if (!_.isEmpty(response)) {
      return {
        code: 200,
        status: true,
        message: "Successfully retrieved customers data",
        response: response,
      };
    } else {
      return {
        code: 200,
        status: true,
        message: "No customers data fetched",
        response: [],
      };
    }
  } catch (err) {
    console.error(err);
    return {
      code: 500,
      status: false,
      message: "Failed to fetch customers data",
      response: [],
    };
  }
};

module.exports.getRegistrationCustomerById = async (props) => {
  const { customerid, tenantid } = props;
  const db = global.dbConnection;

  try {
    const response = await db("registrationcustomers")
      .leftJoin(
        "countries",
        "countries.countryid",
        "registrationcustomers.countryid"
      )
      .leftJoin("states", "states.stateid", "registrationcustomers.stateid")
      .leftJoin("cities", "cities.cityid", "registrationcustomers.cityid")
      .select(
        "registrationcustomers.*",
        "countries.countryname",
        "states.statename",
        "cities.cityname"
      )
      .orderBy("registrationcustomers.registrationcustomerid", "DESC")
      .where({
        "registrationcustomers.registrationcustomerid": customerid,
      })
      .first();

    const registrationcustomerprojects = await db(
      "registrationcustomerprojects"
    )
      .select(
        "registrationcustomerprojects.registrationcustomerprojectid",
        "registrationcustomerprojects.registrationcustomerprojectname"
      )
      .where({
        "registrationcustomerprojects.registrationcustomerid":
          response.registrationcustomerid,
      });
    response.customerprojects = !_.isEmpty(registrationcustomerprojects)
      ? registrationcustomerprojects
      : [];

    await Promise.all(
      registrationcustomerprojects.map(async (proj) => {
        const buildings = await db("registrationcustomerbuildings")
          .select(
            "registrationcustomerbuildings.registrationcustomerbuildingname"
          )
          .where({
            "registrationcustomerbuildings.registrationcustomerid":
              response.registrationcustomerid,
            "registrationcustomerbuildings.registrationcustomerprojectid":
              proj.registrationcustomerprojectid,
          });

        proj.buildings =
          buildings.length > 0
            ? buildings.map((b) => b.registrationcustomerbuildingname)
            : [];
      })
    );

    if (!_.isEmpty(response)) {
      return {
        code: 200,
        status: true,
        message: "Successfully retrieved customers data",
        response: response,
      };
    } else {
      return {
        code: 200,
        status: true,
        message: "No customers data fetched",
        response: [],
      };
    }
  } catch (err) {
    console.error(err);
    return {
      code: 500,
      status: false,
      message: "Failed to fetch customers data",
      response: [],
    };
  }
};

module.exports.getCustomerProject = async (props) => {
  const { customerid, tenantid } = props;
  const db = global.dbConnection;
  try {
    const result = await db.transaction(async (trx) => {
      const projects = await trx("customerprojects").where({
        "customerprojects.customerid": customerid,
        "customerprojects.tenantid": tenantid,
      });

      if (!_.isEmpty(projects)) {
        return {
          code: 200,
          status: true,
          message: "Successfully data retrieved",
          response: projects,
        };
      }

      if (_.isEmpty(projects)) {
        return {
          code: 200,
          status: true,
          message: "No data retrieved",
          response: [],
        };
      }
    });

    return result;
  } catch (err) {
    console.log("getCustomerProject", err);
    return {
      code: 200,
      status: false,
      message: "Failed to retrieve the data",
      response: [],
    };
  }
};

module.exports.getCustomerBuildings = async (props) => {
  const { customerid, customerprojectid, tenantid } = props;
  const db = global.dbConnection;
  try {
    const result = await db.transaction(async (trx) => {
      const buildings = await trx("customerbuildings").where({
        "customerbuildings.customerid": customerid,
        "customerbuildings.customerprojectid": customerprojectid,
        "customerbuildings.tenantid": tenantid,
      });

      if (!_.isEmpty(buildings)) {
        return {
          code: 200,
          status: true,
          message: "Successfully data retrieved",
          response: buildings,
        };
      }

      if (_.isEmpty(buildings)) {
        return {
          code: 200,
          status: true,
          message: "No data retrieved",
          response: [],
        };
      }
    });

    return result;
  } catch (err) {
    console.log("getCustomerProject", err);
    return {
      code: 200,
      status: false,
      message: "Failed to retrieve the data",
      response: [],
    };
  }
};

// approvals

module.exports.loginApproval = async (props) => {
  const { customerid, tenantid, userid, key, companyid } = props;
  const db = global.dbConnection;
  try {
    const currentYear = moment().year();
    let customerIdForMail

    const checkUserValid = await db("app_users").where({
      "app_users.userid": userid,
      "app_users.tenantid": tenantid,
    });

    const checkcustomersExist = await db("registrationcustomers").where({
      registrationcustomerid: customerid,
      tenantid: tenantid,
    });

    if (_.isEmpty(checkUserValid)) {
      return { code: 200, status: false, message: "You are a not valid user" };
    }

    if (_.isEmpty(checkcustomersExist)) {
      return { code: 200, status: false, message: "This customer not exist" };
    }

    const password = Math.floor(Math.random() * 9000 + 1000).toString();
    const hashpassword = bcrypt.hashSync(password, 10);

    const result = await db.transaction(async (trx) => {
      switch (key) {
        case 1:
          const active = await trx("registrationcustomers")
            .update({
              registrationcustomerapproval: 1,
              companyid: companyid,
            })
            .where({
              registrationcustomerid: customerid,
              tenantid: tenantid,
            });

          const registrationcustomers = await trx("registrationcustomers")
            .where({ registrationcustomerid: customerid, tenantid: tenantid })
            .first();

          // console.log('registrationcustomers', registrationcustomers)

          if (!_.isEmpty(registrationcustomers)) {
            const [customeruserid] = await trx("app_users").insert({
              companyid: registrationcustomers.companyid,
              tenantid: tenantid,
              authname: registrationcustomers.registrationcustomerprimaryemail,
              username: registrationcustomers.registrationcustomername,
              password,
              hashpassword,
              primarycontact:
                registrationcustomers.registrationcustomerprimarycontact,
              email: registrationcustomers.registrationcustomercompanyemail,
              roleid: 4,
            });

            if (!customeruserid) throw new Error("Failed to create customer");

            const userUniqueId = `RTS-USR-CUST-${currentYear}/${tenantid}${String(
              customeruserid
            ).padStart(6, "0")}`;

            const updateuniqueid = await trx("app_users")
              .where({ userid: customeruserid })
              .update({ useruniqueid: userUniqueId });

            if (updateuniqueid === 0)
              throw new Error("Failed to update user unique ID");

            const [insertCustomerId] = await trx("customers").insert({
              userid: customeruserid,
              customeruniqueid: userUniqueId,
              companyid: registrationcustomers.companyid,
              tenantid: tenantid,
              customername: registrationcustomers.registrationcustomername,
              customerimage: registrationcustomers.registrationcustomerimage,
              configid: registrationcustomers.configid,
              customerprimaryemail:
                registrationcustomers.registrationcustomerprimaryemail,
              customeralteremail:
                registrationcustomers.registrationcustomeralteremail,
              customerprimarycontact:
                registrationcustomers.registrationcustomerprimarycontact,
              customeraltercontact:
                registrationcustomers.registrationcustomeraltercontact,
              customercompanyname:
                registrationcustomers.registrationcustomercompanyname,
              customercompanyemail:
                registrationcustomers.registrationcustomercompanyemail,
              customercompanyaddress:
                registrationcustomers.registrationcustomercompanyaddress,
              cityid: registrationcustomers.cityid,
              stateid: registrationcustomers.stateid,
              countryid: registrationcustomers.countryid,
              customerregtype: 2,
              customertype: registrationcustomers.registrationcustomertype,
            });

            if (!insertCustomerId) throw new Error("Failed to insert customer");

            customerIdForMail = insertCustomerId

            const registrationCustomerProjects = await trx("registrationcustomerprojects")
              .where({ registrationcustomerid: customerid, tenantid: tenantid })

            // console.log('registrationCustomerProjects', registrationCustomerProjects)

            if (!_.isEmpty(registrationCustomerProjects)) {
              for (const proj of registrationCustomerProjects) {
                const [customerprojectid] = await trx(
                  "customerprojects"
                ).insert({
                  customerid: insertCustomerId,
                  tenantid: proj.tenantid,
                  customerprojectname: proj.registrationcustomerprojectname,
                });

                if (!customerprojectid)
                  throw new Error("Failed to insert customer project");

                const registrationcustomerbuildings = await trx(
                  "registrationcustomerbuildings"
                ).where({
                  registrationcustomerid: proj.registrationcustomerid,
                });

                // console.log('registrationcustomerbuildings', registrationcustomerbuildings)

                if (!_.isEmpty(registrationcustomerbuildings)) {
                  for (const build of registrationcustomerbuildings) {
                    const [customerbuildingid] = await trx(
                      "customerbuildings"
                    ).insert({
                      customerid: insertCustomerId,
                      customerprojectid: customerprojectid,
                      tenantid,
                      customerbuildingname:
                        build.registrationcustomerbuildingname,
                    });

                    if (!customerbuildingid)
                      throw new Error("Failed to insert customer building");
                  }
                }
              }
            }

            // if (registrationcustomers.registrationcustomeremail) {
            //   const mailProps = {
            //     tenantid,
            //     customerprimaryemail,
            //     customerprimarycontact,
            //     customername,
            //     password,
            //   };
            //   await mailService.customerRegistrationMail(mailProps);
            // }
          }

          if (active > 0) {
            return {
              code: 200,
              status: true,
              message: "Customer Approved successful",
              notifydata: {
                customername: registrationcustomers.registrationcustomername,
                key: 1 //approved
              },
              mailProps: {
                tenantid,
                customerid: customerIdForMail,
                customerprimaryemail: registrationcustomers.registrationcustomerprimaryemail,
                customerprimarycontact: registrationcustomers.registrationcustomerprimarycontact,
                customername: registrationcustomers.registrationcustomername,
                password,
              },
            };
          } else {
            return {
              code: 200,
              status: false,
              message: "Failed to approve customer",
            };
          }

        case 2:
          const inactive = await trx("registrationcustomers")
            .update({
              registrationcustomerapproval: 3,
            })
            .where({
              registrationcustomerid: customerid,
              tenantid: tenantid,
            });

          if (inactive > 0) {

            const regcustomers = await trx("registrationcustomers")
              .where({
                registrationcustomerid: customerid,
                tenantid: tenantid,
              })
              .first();

            return {
              code: 200,
              status: true,
              message: "Customer rejected successful",
              notifydata: {
                customername: regcustomers?.registrationcustomername,
                key: 2 //reject
              },
            };
          } else {
            return {
              code: 200,
              status: false,
              message: "Failed to reject customer",
            };
          }
      }
    });

    return result;
  } catch (err) {
    console.log(err);
    return {
      code: 200,
      status: false,
      message: "Failed to update customer approval",
    };
  }
};

//customer app

module.exports.editCustomerProfile = async (props) => {
  const {
    tenantid,
    customerid,
    userid,
    cityid,
    stateid,
    countryid,
    customername,
    customerimage,
    customeraddress,
    customerprimaryemail,
    customeralteremail,
    customerprimarycontact,
    customeraltercontact,
    customercompanyname,
    customercompanyemail,
    customercompanyaddress,
    customertype,
    customerprojects,
  } = props;

  const db = global.dbConnection;
  try {
    let updateCustomer;
    let updateuser;

    const result = await db.transaction(async (trx) => {
      switch (customertype) {
        // customer type - 1 (business)
        case 1:
          updateCustomer = await trx("customers")
            .update({
              customername: customername.toUpperCase(),
              customerimage,
              customeraddress,
              customerprimarycontact,
              customeraltercontact,
              customerprimaryemail,
              customeralteremail,
              customercompanyname,
              customercompanyemail,
              customercompanyaddress,
              cityid,
              stateid,
              countryid,
              adduserid: userid,
            })
            .where({
              customerid,
              tenantid,
            });

          if (updateCustomer === 0) {
            await trx.rollback();
            return {
              code: 200,
              status: false,
              message: "Failed to update customer",
            };
          }

          updateuser = await trx("app_users")
            .update({
              username: customername.toUpperCase(),
              primarycontact: customerprimarycontact,
              altercontact: customeraltercontact,
              email: customerprimaryemail,
              authname: customerprimaryemail,
              adduserid: userid,
            })
            .where({
              userid: userid,
              tenantid: tenantid,
            });

          if (updateuser === 0) {
            await trx.rollback();
            return {
              code: 200,
              status: false,
              message: "Failed to update customer",
            };
          }

          // inserting the projects against buildings --> new
          if (!_.isEmpty(customerprojects)) {
            //if exist customer projects delete
            const existProject = await trx("customerprojects").where({
              customerid,
              tenantid,
            });

            if (!_.isEmpty(existProject)) {
              await trx("customerprojects")
                .where({
                  customerid,
                  tenantid,
                })
                .del();
            }

            await Promise.all(
              customerprojects.map(async (proj) => {
                const [customerprojectid] = await trx(
                  "customerprojects"
                ).insert({
                  customerid: customerid,
                  tenantid,
                  customerprojectname: proj.projectname,
                });

                if (!_.isEmpty(proj.buildings)) {
                  //if exist customer buildings delete
                  const existProject = await trx("customerbuildings").where({
                    customerid,
                    tenantid,
                  });

                  if (!_.isEmpty(existProject)) {
                    await trx("customerbuildings")
                      .where({
                        customerprojectid,
                        customerid,
                        tenantid,
                      })
                      .del();
                  }

                  //insert customer buildings
                  await Promise.all(
                    proj.buildings.map(async (build) => {
                      await trx("customerbuildings").insert({
                        customerid: customerid,
                        customerprojectid: customerprojectid,
                        tenantid,
                        customerbuildingname: build,
                      });
                    })
                  );
                }
              })
            );
          }

          return {
            code: 200,
            status: true,
            message: "Successfully profile updated",
          };

        // customer type - 2 (personal)
        case 2:
          updateCustomer = await trx("customers")
            .update({
              customername: customername.toUpperCase(),
              customerimage,
              customeraddress,
              customerprimarycontact,
              customeraltercontact,
              customerprimaryemail,
              customeralteremail,
              cityid,
              stateid,
              countryid,
              adduserid: userid,
            })
            .where({
              customerid,
              tenantid,
            });

          if (updateCustomer === 0) {
            await trx.rollback();
            return {
              code: 200,
              status: false,
              message: "Failed to update customer",
            };
          }

          updateuser = await trx("app_users")
            .update({
              username: customername.toUpperCase(),
              primarycontact: customerprimarycontact,
              altercontact: customeraltercontact,
              email: customerprimaryemail,
              authname: customerprimaryemail,
              adduserid: userid,
            })
            .where({
              userid: userid,
              tenantid: tenantid,
            });

          // inserting the projects against buildings --> new
          if (!_.isEmpty(customerprojects)) {
            //if exist customer projects delete
            const existProject = await trx("customerprojects").where({
              customerid,
              tenantid,
            });

            if (!_.isEmpty(existProject)) {
              await trx("customerprojects")
                .where({
                  customerid,
                  tenantid,
                })
                .del();
            }

            await Promise.all(
              customerprojects.map(async (proj) => {
                const [customerprojectid] = await trx(
                  "customerprojects"
                ).insert({
                  customerid: customerid,
                  tenantid,
                  customerprojectname: proj.projectname,
                });

                if (!_.isEmpty(proj.buildings)) {
                  //if exist customer buildings delete
                  const existProject = await trx("customerbuildings").where({
                    customerid,
                    tenantid,
                  });

                  if (!_.isEmpty(existProject)) {
                    await trx("customerbuildings")
                      .where({
                        customerprojectid,
                        customerid,
                        tenantid,
                      })
                      .del();
                  }

                  //insert customer buildings
                  await Promise.all(
                    proj.buildings.map(async (build) => {
                      await trx("customerbuildings").insert({
                        customerid: customerid,
                        customerprojectid: customerprojectid,
                        tenantid,
                        customerbuildingname: build,
                      });
                    })
                  );
                }
              })
            );
          }

          if (updateCustomer > 0) {
            return {
              code: 200,
              status: true,
              message: "Successfully profile updated",
            };
          }

          break;

        default:
          return {
            code: 200,
            status: false,
            message: "Invalid customer provided",
          };
      }
    });
    return result;
  } catch (err) {
    console.log("editCustomerProfile Error", err);
    return {
      code: 200,
      status: false,
      message: "Failed to update customer profile",
    };
  }
};

module.exports.getCustomerProfileById = async (props) => {
  const { customerid, tenantid, userid } = props;
  const db = global.dbConnection;
  try {
    const result = await db.transaction(async (trx) => {
      const customer = await trx("customers")
        .leftJoin("app_users", "app_users.userid", "customers.userid")
        .leftJoin("countries", "countries.countryid", "customers.countryid")
        .leftJoin("states", "states.stateid", "customers.stateid")
        .leftJoin("cities", "cities.cityid", "customers.cityid")
        .leftJoin("company", "company.companyid", "customers.companyid")
        .select(
          "customers.customerid",
          "customers.tenantid",
          "customers.userid",
          "customers.customername",
          "app_users.username",
          "customers.companyid",
          "company.companyname",
          "app_users.roleid",
          "customers.customerimage",
          "customers.customeruniqueid",
          "customers.customerprimaryemail",
          "customers.customerprimarycontact",
          "customers.customercompanyaddress",
          "customers.customeralteremail",
          "customers.customeraltercontact",
          "customers.customeraddress",
          "customers.customercompanyname",
          "customers.customercompanyemail",
          "customers.customertype",
          "customers.customerapproval",
          "customers.customerstatus",
          "customers.customerregtype",
          "countries.countryid",
          'countries.countryname',
          "states.stateid",
          "states.statename",
          "cities.cityid",
          "cities.cityname"
        )
        .where({
          "customers.customerid": customerid,
          "customers.tenantid": tenantid,
          "customers.userid": userid,
        })
        .first();

      const customerprojects = await db("customerprojects")
        .select(
          "customerprojects.customerprojectid",
          "customerprojects.customerprojectname"
        )
        .where({
          "customerprojects.customerid": customer.customerid,
          "customerprojects.tenantid": customer.tenantid,
        });
      customer.customerprojects = !_.isEmpty(customerprojects)
        ? customerprojects
        : [];

      await Promise.all(
        customerprojects.map(async (proj) => {
          const buildings = await db("customerbuildings")
            .select("customerbuildings.customerbuildingname")
            .where({
              "customerbuildings.customerid": customer.customerid,
              "customerbuildings.tenantid": customer.tenantid,
              "customerbuildings.customerprojectid": proj.customerprojectid,
            });

          proj.buildings = buildings.length > 0 ? buildings : [];
        })
      );

      if (!_.isEmpty(customer)) {
        return {
          code: 200,
          status: true,
          message: "Successfully data retrieved",
          response: customer,
        };
      }

      if (_.isEmpty(customer)) {
        return {
          code: 200,
          status: true,
          message: "No data retrieved",
          response: [],
        };
      }
    });
    return result;
  } catch (err) {
    console.log("getCustomerDetailByApp Error", err);
    return {
      code: 200,
      status: false,
      message: "Failed to retrieve data",
      response: [],
    };
  }
};


module.exports.getCustomerCompany = async (props) => {
  const { tenantid, companyid } = props;
  const db = global.dbConnection;
  try {
    const result = await db.transaction(async (trx) => {
      // Initial query setup
      const customerCompany = await trx("customers")

        .where({"customers.tenantid": tenantid,
          "customers.customertype": 1,
          "customers.companyid": companyid
        })
      return {
        code: 200,
        status: true,
        message: customerCompany.length > 0 ? "Successfully fetched customer company data" : "No customer company data found",
        response: customerCompany,
      };
    });
    return result;
  } catch (err) {
    console.error("Error fetching customer company data:", err); // Improved error logging
    return {
      code: 500,
      status: false,
      message: "Failed to fetch customer company data",
      response: [],
    };
  }
};