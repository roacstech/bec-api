const _ = require("lodash");

module.exports.createCompany = async (props) => {
  const {
    tenantid,
    companyuniqueid,
    companyname,
    companyaddress,
    companyimage,
    contact,
    altercontact,
    email,
    alteremail,
    billingaddress,
    gstnumber,
    companyquotationnotes,
    companyquotationtermsandconditions
  } = props;

  if (!companyname) {
    return {
      code: 400,
      status: false,
      message: "Company name is required",
    };
  }

  const db = global.dbConnection;

  try {

    // Check if email or contact already exists
    const [checkEmailExist, checkContactExist] = await Promise.all([
      db("company").where({ email, tenantid }).first(),
      db("company").where({ contact, tenantid }).first(),
    ]);

    if (checkEmailExist) {
      return {
        code: 400,
        status: false,
        message: "Email already exists",
      };
    }

    if (checkContactExist) {
      return {
        code: 400,
        status: false,
        message: "Contact number already exists",
      };
    }

    const result = await db.transaction(async (trx) => {
      // Insert company data and get the inserted company ID
      const [insertedCompanyId] = await trx("company").insert({
        tenantid,
        companyuniqueid,
        companyname,
        companyaddress,
        companyimage,
        contact,
        altercontact,
        email,
        alteremail,
        billingaddress,
        gstnumber,
        companyquotationnotes,
        companyquotationtermsandconditions
      }).returning("companyid");

      return {
        code: 201,
        status: true,
        message: "Company created successfully",
      };
    });

    return result;
  } catch (err) {
    console.error("Error creating company:", err);
    return {
      code: 500,
      status: false,
      message: "Failed to create company",
    };
  }
};

module.exports.editCompany = async (props) => {
  const {
    companyid, // Use companyid for editing
    companyname,
    companyaddress,
    companyimage,
    contact,
    companyuniqueid,
    altercontact,
    email,
    alteremail,
    billingaddress,
    gstnumber,
    companyquotationnotes,
    companyquotationtermsandconditions
  } = props;

  const db = global.dbConnection;

  try {
    // Check if the company exists
    const checkCompanyExist = await db("company")
      .where({
        companyid
      })
      .first();

    if (!checkCompanyExist) {
      return {
        code: 404,
        status: false,
        message: "Company does not exist",
      };
    }

    // Check if the new email or contact is already in use by another company
    const [checkEmailExist, checkContactExist] = await Promise.all([
      db("company")
        .where({
          email
        })
        .andWhereNot({ companyid })
        .first(),
      db("company")
        .where({
          contact
        })
        .andWhereNot({ companyid })
        .first(),
    ]);

    if (checkEmailExist) {
      return {
        code: 400,
        status: false,
        message: "Email address already in use",
      };
    }

    if (checkContactExist) {
      return {
        code: 400,
        status: false,
        message: "Contact number already in use",
      };
    }

    const result = await db.transaction(async (trx) => {
      // Update the company information
      const editCompany = await trx("company")
        .update({
          companyname,
          companyuniqueid,
          companyaddress,
          companyimage,
          contact,
          altercontact,
          email,
          alteremail,
          billingaddress,
          gstnumber,
          companyquotationnotes,
          companyquotationtermsandconditions
        })
        .where({
          companyid
        });

      if (editCompany > 0) {
        return {
          code: 200,
          status: true,
          message: "Company successfully edited",
        };
      } else {
        return {
          code: 400,
          status: false,
          message: "Failed to update company",
        };
      }
    });

    return result;
  } catch (err) {
    console.error("Error editing company:", err);
    return {
      code: 500,
      status: false,
      message: "An error occurred while editing the company",
    };
  }
};

module.exports.getAllCompany = async (props) => {
  const { tenantid, key } = props;
  const db = global.dbConnection;

  try {
    const result = await db.transaction(async (trx) => {
      // Initial query setup
      let companyQuery = trx("company")
        .select(
          "company.companyid",
          "company.companyuniqueid",
          "company.companyname",
          "company.companyaddress",
          "company.companyimage",
          "company.contact",
          "company.altercontact",
          "company.email",
          "company.alteremail",
          "company.billingaddress",
          "company.gstnumber",
          "company.status",
          "company.companyquotationtermsandconditions",
          "company.companyquotationnotes"
        )
        .where("company.tenantid", tenantid)

      // Apply additional filters
      if (key === 1) {
        companyQuery = companyQuery.andWhere("company.status", 1);
      }
      if (key === 2) {
        companyQuery = companyQuery.andWhere("company.status", 2);
      }

      const companyData = await companyQuery;

      return {
        code: 200,
        status: true,
        message: companyData.length > 0 ? "Successfully fetched company data" : "No company data found",
        response: companyData,
      };
    });

    return result;
  } catch (err) {
    console.error("Error fetching company data:", err); // Improved error logging
    return {
      code: 500,
      status: false,
      message: "Failed to fetch company data",
      response: [],
    };
  }
};

module.exports.updateCompanyStatus = async (props) => {
  const { companyid, tenantid, key } = props; // Use companyid instead of tenantstaffid
  const db = global.dbConnection;

  try {
    // Check if the company exists
    const checkCompanyExist = await db("company").where({
      companyid: companyid,
      tenantid: tenantid,
    });

    if (_.isEmpty(checkCompanyExist)) {
      return { code: 200, status: false, message: "This company does not exist" };
    }

    const result = await db.transaction(async (trx) => {
      switch (key) {
        case 1: // Make the company active
          const checkInactive = await trx("company")
            .where({ status: 2 })
            .where({ companyid: companyid, tenantid: tenantid });

          if (_.isEmpty(checkInactive)) {
            return {
              code: 200,
              status: false,
              message: "This company is already active",
            };
          }

          if (!_.isEmpty(checkInactive)) {
            const activateCompany = await trx("company")
              .update({ status: 1 })
              .where({ companyid: companyid, tenantid: tenantid });

            if (activateCompany > 0) {
              return {
                code: 200,
                status: true,
                message: "Company activated successfully",
              };
            } else {
              return {
                code: 200,
                status: false,
                message: "Failed to activate company",
              };
            }
          }
          break;

        case 2: // Make the company inactive
          const checkActive = await trx("company")
            .where({ status: 1 })
            .where({ companyid: companyid, tenantid: tenantid });

          if (_.isEmpty(checkActive)) {
            return {
              code: 200,
              status: false,
              message: "This company is already inactive",
            };
          }

          if (!_.isEmpty(checkActive)) {
            const deactivateCompany = await trx("company")
              .update({ status: 2 })
              .where({ companyid: companyid, tenantid: tenantid });

            if (deactivateCompany > 0) {
              return {
                code: 200,
                status: true,
                message: "Company deactivated successfully",
              };
            } else {
              return {
                code: 200,
                status: false,
                message: "Failed to deactivate company",
              };
            }
          }
          break;

        default:
          return {
            code: 400,
            status: false,
            message: "Invalid status key",
          };
      }
    });

    return result;
  } catch (err) {
    console.log("Error updating company status:", err);
    return {
      code: 500,
      status: false,
      message: "Failed to update company status",
    };
  }
};

