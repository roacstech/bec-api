const _ = require("lodash");
const bcrypt = require("bcrypt");
const { response } = require("express");
const moment = require("moment");

module.exports.createSuperAdmin = async (props) => {
  const {
    adminname,
    adminlogo,
    adminemail,
    admincontact,
    companyname,
    gstno,
    billingaddress,
    brandname,
    brandlogo,
    app_password,
    user_mail,
    mail_service,
    mail_host,
  } = props;

  const db = global.dbConnection;
  try {
    const upperadminname = adminname.toUpperCase();
    const password = Math.floor(Math.random() * 9000 + 1000).toString();
    const hashpassword = bcrypt.hashSync(password, 10);

    const result = db.transaction(async (trx) => {
      //app_users table
      const [userid] = await trx("app_users").insert({
        username: upperadminname,
        authname: adminemail,
        primarycontact: admincontact,
        password: password,
        userimage: adminlogo,
        hashpassword: hashpassword,
      });

      if (!userid) {
        throw new Error("Userid created failed!");
      }

      const [tenantid] = await trx("tenants").insert({
        tenantname: adminname,
        tenantimage: adminlogo,
        alteremail: adminemail,
        primarycontact: admincontact,
        primaryemail: adminemail,
        app_password: app_password,
        user_mail: user_mail,
        mail_service: mail_service,
        mail_host,
        companyname,
        gstno,
        billingaddress,
        brandname,
        brandlogo,
      });

      if (!tenantid) {
        throw new Error("Tenantid created failed!");
      }

      return {
        code: 200,
        status: true,
        message: "Admin created successful!",
      };
    });
    return result;
  } catch (err) {
    console.log(err);
    return {
      code: 200,
      status: false,
      message: "Failed to create admin",
    };
  }
};

module.exports.createAdmin = async (props) => {
  const {
    adminname,
    adminprimarycontact,
    adminaltercontact,
    adminimage,
    adminprimaryemail,
    adminalteremail,
    adminuniqueid,
    adminsignature,
    tenantid,
  } = props;

  const db = global.dbConnection;
  try {
    const currentServerDateTimeUTC = moment().format("YYYY-MM-DDTHH:mm:ss[Z]");

    const currentYear = moment().year();

    const upperadminname = adminname.toUpperCase();
    const password = Math.floor(Math.random() * 9000 + 1000).toString(); // Generate random password
    const hashpassword = bcrypt.hashSync(password, 10); // Hash the password

    const result = await db.transaction(async (trx) => {
      // Check if the primary email already exists
      const existingEmail = await trx("app_users")
        .select("userid")
        .where({ authname: adminprimaryemail })
        .first();

      if (existingEmail) {
        return {
          code: 400,
          status: false,
          message: "Primary email already exists!",
        };
      }

      // Check if the primary contact already exists
      const existingContact = await trx("app_users")
        .select("userid")
        .where({ primarycontact: adminprimarycontact })
        .first();

      if (existingContact) {
        return {
          code: 400,
          status: false,
          message: "Primary contact already exists!",
        };
      }

      // Insert into app_users table
      const [userid] = await trx("app_users").insert({
        username: upperadminname,
        authname: adminprimaryemail,
        primarycontact: adminprimarycontact,
        altercontact: adminaltercontact,
        password: password,
        userimage: adminimage,
        hashpassword: hashpassword,
        roleid: 2,
      });

      if (!userid) {
        return {
          code: 200,
          status: false,
          message: "Admin created failed!",
        };
      }

      const userUniqueId = `RTS-ADM-CUST-${currentYear}/${tenantid}${String(
        userid
      ).padStart(6, "0")}`;

      const updateuniqueid = await trx("app_users")
        .where({ userid: userid })
        .update({ useruniqueid: userUniqueId });

      if (updateuniqueid === 0)
        throw new Error("Failed to update user unique ID");

      // Insert into admins table
      const [adminid] = await trx("admins").insert({
        userid: userid,
        adminname: upperadminname,
        adminprimarycontact: adminprimarycontact,
        adminaltercontact: adminaltercontact,
        adminuniqueid: adminuniqueid,
        adminimage: adminimage,
        adminprimaryemail: adminprimaryemail,
        adminalteremail: adminalteremail,
        adminsignature: adminsignature,
      });

      if (!adminid) {
        return {
          code: 200,
          status: false,
          message: "Admin created failed!",
        };
      }

      return {
        code: 200,
        status: true,
        message: "Admin created successfully!",
        data: {
          userid,
          adminid,
          username: upperadminname,
          temporaryPassword: password, // Return the generated password securely
        },
      };
    });

    return result;
  } catch (err) {
    console.error("createAdmin error:", err);
    return {
      code: 500,
      status: false,
      message: "Failed to create admin.",
      error: err.message,
    };
  }
};

module.exports.editAdmin = async (props) => {
  const {
    adminid,
    adminname,
    adminprimarycontact,
    adminaltercontact,
    adminimage,
    adminprimaryemail,
    adminalteremail,
    adminuniqueid,
    adminsignature,
  } = props;

  const db = global.dbConnection;
  try {
    const upperadminname = adminname ? adminname.toUpperCase() : undefined;

    const result = await db.transaction(async (trx) => {
      // Check if the admin exists
      const user = await trx("admins")
        .select("userid")
        .where({ adminid })
        .first();

      if (!user) {
        return {
          code: 404,
          status: false,
          message: "Admin not found!",
        };
      }

      // Update the app_users table
      const updatedAppUser = await trx("app_users")
        .where({ userid: user.userid })
        .update({
          username: upperadminname,
          authname: adminprimaryemail,
          primarycontact: adminprimarycontact,
          altercontact: adminaltercontact,
          userimage: adminimage,
        });

      if (!updatedAppUser) {
        throw new Error("Failed to update admin user in app_users table.");
      }

      // Update the admins table
      const updatedAdmin = await trx("admins").where({ adminid }).update({
        adminname: upperadminname,
        adminprimarycontact: adminprimarycontact,
        adminaltercontact: adminaltercontact,
        adminuniqueid: adminuniqueid,
        adminimage: adminimage,
        adminprimaryemail: adminprimaryemail,
        adminalteremail: adminalteremail,
        adminsignature: adminsignature,
      });

      if (!updatedAdmin) {
        throw new Error("Failed to update admin in admins table.");
      }

      return {
        code: 200,
        status: true,
        message: "Admin updated successfully!",
      };
    });

    return result;
  } catch (err) {
    console.error("editAdmin error:", err);
    return {
      code: 500,
      status: false,
      message: "Failed to update admin.",
      error: err.message,
    };
  }
};

module.exports.getAdmin = async (adminid) => {
  const db = global.dbConnection;
  try {
    let query = db("admins")
      .leftJoin("app_users", "admins.userid", "app_users.userid")
      .select("admins.*", "app_users.authname", "app_users.password");

    // Only filter by adminid if it's provided
    if (adminid) {
      query = query.where("admins.adminid", adminid).first();
    }

    const adminDetails = await query;

    // If adminid was provided but no admin found
    if (adminid && !adminDetails) {
      return {
        code: 404,
        status: false,
        message: "Admin not found!",
      };
    }

    return {
      code: 200,
      status: true,
      message: adminid
        ? "Admin details retrieved successfully!"
        : "All admin details retrieved!",
      response: adminDetails,
    };
  } catch (err) {
    console.error("getAdmin error:", err);
    return {
      code: 500,
      status: false,
      message: "Failed to retrieve admin details.",
      error: err.message,
    };
  }
};

module.exports.updateAdminStatus = async (props) => {
  const { adminid, key } = props;
  const db = global.dbConnection;

  if (!adminid) {
    return { code: 400, status: false, message: "adminid is required" };
  }

  try {
    // Check if the admin exists
    const checkAdminExist = await db("admins").where({ adminid });

    if (_.isEmpty(checkAdminExist)) {
      return { code: 404, status: false, message: "This admin does not exist" };
    }

    // Start transaction
    const result = await db.transaction(async (trx) => {
      let adminstatus;
      let statusMessage;

      switch (key) {
        case 1: // Activate admin
          adminstatus = 1;
          statusMessage = "Admin activated successfully";
          break;

        case 2: // Deactivate admin
          adminstatus = 2;
          statusMessage = "Admin deactivated successfully";
          break;

        default:
          return { code: 400, status: false, message: "Invalid status key" };
      }

      // Check current status
      const checkStatus = await trx("admins").where({ adminid, adminstatus });

      if (!_.isEmpty(checkStatus)) {
        return {
          code: 200,
          status: false,
          message: `This admin is already ${key === 1 ? "active" : "inactive"}`,
        };
      }

      // Update `admins` table
      const updateAdmin = await trx("admins")
        .update({ adminstatus })
        .where({ adminid });

      if (updateAdmin === 0) {
        return {
          code: 500,
          status: false,
          message: "Failed to update admin status",
        };
      }

      // Check if `adminloginstatus` exists in `app_users`
      const columns = await trx.raw(
        "SHOW COLUMNS FROM app_users LIKE 'adminloginstatus'"
      );
      if (columns[0].length === 0) {
        console.error(
          "Column 'adminloginstatus' does not exist in 'app_users'"
        );
        return {
          code: 500,
          status: false,
          message:
            "Database error: Missing column 'adminloginstatus' in 'app_users'",
        };
      }

      // Update `app_users.adminloginstatus`
      await trx("app_users")
        .update({ adminloginstatus: adminstatus })
        .where("userid", function () {
          this.select("userid").from("admins").where("adminid", adminid);
        });

      return { code: 200, status: true, message: statusMessage };
    });

    return result;
  } catch (err) {
    console.error("Error updating admin status:", err);
    return {
      code: 500,
      status: false,
      message: "Failed to update admin status",
    };
  }
};
