const _ = require("lodash");

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
