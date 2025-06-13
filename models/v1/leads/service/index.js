const _ = require("lodash");

module.exports.createLeads = async (props) => {
  const { leadname, leademail, leadcontact, referraltypeid } = props; // Added referraltypeid

  if (!leadname || !leademail || !leadcontact) {
    return {
      code: 400,
      status: false,
      message: "Lead name, email, and contact are required fields",
    };
  }

  const db = global.dbConnection;

  try {
    // Check if leademail already exists
    const existingEmail = await db("leads").where({ leademail }).first();

    if (existingEmail) {
      return {
        code: 400,
        status: false,
        message: "Email already exists",
      };
    }

    // Insert new record into `leads` table
    const [insertedId] = await db("leads").insert({
      leadname,
      leademail,
      leadcontact,
      referraltypeid: referraltypeid || null, // Allow referraltypeid to be optional
    });

    return {
      code: 201,
      status: true,
      message: "Record added successfully",
      data: {
        leadid: insertedId,
        leadname,
        leademail,
        leadcontact,
        referraltypeid,
      },
    };
  } catch (err) {
    console.error("Error inserting data:", err);
    return {
      code: 500,
      status: false,
      message: "Failed to insert record",
    };
  }
};

module.exports.getLeadsById = async (leadid) => {
  try {
    const db = global.dbConnection;

    // Ensure leadid is valid
    if (!leadid) {
      throw new Error("Lead ID is required");
    }

    // Fetch record by leadid
    const leadsData = await db("leads").where({ leadid }).first();

    if (!leadsData) {
      return {
        code: 404,
        status: false,
        message: "No data found",
      };
    }

    return {
      code: 200,
      status: true,
      data: leadsData,
    };
  } catch (err) {
    console.error("Error fetching leads data by ID:", err);
    return {
      code: 500,
      status: false,
      message: "Server error",
    };
  }
};

module.exports.getAllLeads = async (props) => {
  const {
    leadid,
    tenantid,
    offset,
    limit,
    from,
    to,
    leadstatusid,
    tenantstaffid,
  } = props;
  const db = global.dbConnection;

  try {
    let leaddata = db("leads")
      .leftJoin("app_types", "app_types.apptypeid", "leads.leadstatusid")
      .leftJoin(
        "app_leadstage",
        "app_leadstage.leadstageid",
        "leads.leadstageid"
      )
      .leftJoin("countries", "countries.countryid", "leads.countryid")
      .leftJoin("states", "states.stateid", "leads.stateid")
      .leftJoin("cities", "cities.cityid", "leads.cityid")
      .leftJoin("app_priority", "app_priority.priorityid", "leads.priorityid")
      .leftJoin(
        "app_leadsource",
        "app_leadsource.leadsourceid",
        "leads.leadsourceid"
      )
      .leftJoin("company", "company.companyid", "leads.companyid")
      .select(
        "leads.*",
        "leads.tenantstaffid",
        "countries.countryname",
        "states.statename",
        "cities.cityname",
        "company.companyid",
        "company.companyname",
        "app_leadsource.leadsourcename",
        "app_leadsource.leadsourceimage",
        "app_leadstage.leadstagename",
        "app_leadstage.leadstageimage",
        "app_types.apptypeid as leadstatusid",
        "app_types.typename as leadstatusname",
        "app_types.typeimage as leadstatusimage",
        "app_priority.priorityname"
      )
      .orderBy("leads.leadid", "DESC")
      .offset(offset)
      .limit(limit)
      .where({ "leads.tenantid": tenantid });

    if (leadid) {
      leaddata = leaddata.where({ "leads.leadid": leadid });
    }

    if (from && to) {
      leaddata = leaddata.whereBetween(db.raw("DATE(leads.leaddate)"), [
        from,
        to,
      ]);
    }

    if (leadstatusid) {
      leaddata = leaddata.where({ "leads.leadstatusid": leadstatusid });
    }

    if (tenantstaffid) {
      leaddata = leaddata.whereIn("leads.leadid", tenantstaffid);
    }

    const response = await leaddata;
    // console.log('response', response);

    if (response.length === 0) {
      return {
        code: 200,
        status: true,
        message: "No lead data",
        response: [],
      };
    }

    // Fetch staff details and format dates
    const updatedResponse = await Promise.all(
      response.map(async (lead) => {
        const staffIds = lead.tenantstaffid.split(","); // Split tenantstaffid into array
        const staffDetailsPromises = staffIds.map(async (staffId) => {
          const staffDetails = await db("tenantstaffs")
            .leftJoin(
              "experience",
              "experience.experienceid",
              "tenantstaffs.experienceid"
            )
            .select(
              "tenantstaffs.tenantstaffid",
              "tenantstaffs.tenantstaffname",
              "tenantstaffs.tenantstaffimage",
              "tenantstaffs.email",
              "tenantstaffs.alteremail",
              "tenantstaffs.contact",
              "tenantstaffs.altercontact",
              "tenantstaffs.staffuniqueid",
              "tenantstaffs.locationid",
              "tenantstaffs.experienceid",
              "experience.experiencename",
              "experience.experienceimage"
            )
            .where({ "tenantstaffs.tenantstaffid": staffId })
            .first();

          if (staffDetails && staffDetails.locationid) {
            const branchDetails = await db("app_location")
              .whereIn("applocationid", staffDetails.locationid.split(","))
              .select(
                "applocationid",
                "locationname",
                "locationimage",
                "locationaddress",
                "latitude",
                "longitude"
              );
            staffDetails.branchDetails = branchDetails;
          }

          return staffDetails || {};
        });

        const staffDetails = await Promise.all(staffDetailsPromises);

        // Fetch product details for the lead
        const productDetails = await db("leaddetails")
          .leftJoin("products", "products.productid", "leaddetails.productid")
          .leftJoin(
            "productcategories",
            "productcategories.categoryid",
            "products.productcategoryid"
          )
          .select(
            "leaddetails.leaddetailsid",
            "leaddetails.productid",
            "products.productname",
            "products.productimage",
            "products.productcategoryid",
            "productcategories.categoryname",
            "productcategories.categoryimage"
          )
          .where({
            "leaddetails.leadid": lead.leadid,
            "leaddetails.tenantleadid": lead.tenantleadid,
          });

        lead.productDetails = productDetails || [];

        // Format dates to the server's local timezone
        // const serverTimezone = momenttimezone.tz.guess(); // Get the server's local timezone
        // lead.followupdate = momenttimezone(lead.followupdate)
        //   .tz(serverTimezone)
        //   .format("YYYY-MM-DD hh:mm:ss A");
        // lead.enquirydate = momenttimezone(lead.enquirydate)
        //   .tz(serverTimezone)
        //   .format("YYYY-MM-DD hh:mm:ss A");
        // lead.leaddate = momenttimezone(lead.leaddate)
        //   .tz(serverTimezone)
        //   .format("YYYY-MM-DD hh:mm:ss A");

        return { ...lead, staffDetails };
      })
    );

    return {
      code: 200,
      status: true,
      message: "Successfully retrieved all leads",
      response: updatedResponse,
    };
  } catch (err) {
    console.log("error", err);
    return {
      code: 400,
      status: false,
      message: "Failed to retrieve lead data",
      response: [],
    };
  }
};

module.exports.getAllLeadsCount = async (props) => {
  const { tenantid, offset, limit, from, to, tenantstaffid, leadstatusid } =
    props;
  const db = global.dbConnection;

  try {
    const result = await db.transaction(async (trx) => {
      // Fetch all possible leadstatusid values and their names
      const allStatuses = await trx("app_types").select(
        "apptypeid",
        "typename"
      );

      // Initialize the count object with all leadstatusid set to 0 and names
      const count = allStatuses.reduce((acc, status) => {
        acc[status.apptypeid] = {
          leadstatusid: status.apptypeid,
          leadstatus: status.typename,
          count: 0,
        };
        return acc;
      }, {});

      // Query to get the lead counts
      let leadQuery = trx("leads")
        .join("app_types", "leads.leadstatusid", "app_types.apptypeid")
        .select("leads.leadstatusid", "app_types.typename")
        .orderBy("leads.leadid", "DESC")
        .count("* as count")
        .groupBy("leads.leadstatusid", "app_types.typename")
        .where({ "leads.tenantid": tenantid });

      if (tenantstaffid) {
        leadQuery = leadQuery.where("leads.tenantstaffid", tenantstaffid);
      }

      if (from && to) {
        leadQuery = leadQuery.whereBetween(db.raw("DATE(leads.leaddate)"), [
          from,
          to,
        ]);
      }

      const leads = await leadQuery;

      // Populate the count object with actual counts
      leads.forEach((lead) => {
        count[lead.leadstatusid].count += parseInt(lead.count, 10);
      });

      // Convert the count object into an array
      const resultArray = Object.values(count);

      // Always include the total count
      const totalCount = resultArray.reduce(
        (total, item) => total + item.count,
        0
      );
      const totalCountEntry = {
        leadstatusid: 0,
        leadstatus: "All",
        count: totalCount,
      };

      // Include total count and return result
      return [totalCountEntry, ...resultArray];
    });

    return result;
  } catch (err) {
    console.log(err);
    throw err; // Re-throw error to be handled by the caller
  }
};

module.exports.editLead = async (leadid, updatedProps) => {
  const { leadname, leademail, leadcontact, referraltypeid } = updatedProps; // Get updated fields

  if (!leadid || !leadname || !leademail || !leadcontact || !referraltypeid) {
    return {
      code: 400,
      status: false,
      message: "Lead ID, name, email, contact, and referral type are required",
    };
  }

  const db = global.dbConnection;

  try {
    // Check if lead exists
    const existingLead = await db("leads").where({ leadid }).first();
    if (!existingLead) {
      return {
        code: 404,
        status: false,
        message: "Lead not found",
      };
    }

    // Check if the email is already taken by another lead (if changing email)
    if (existingLead.leademail !== leademail) {
      const existingEmail = await db("leads").where({ leademail }).first();
      if (existingEmail) {
        return {
          code: 400,
          status: false,
          message: "Email already exists",
        };
      }
    }

    // Update the lead record
    await db("leads").where({ leadid }).update({
      leadname,
      leademail,
      leadcontact,
      referraltypeid,
    });

    return {
      code: 200,
      status: true,
      message: "Lead updated successfully",
    };
  } catch (err) {
    console.error("Error updating lead:", err);
    return {
      code: 500,
      status: false,
      message: "Failed to update lead",
    };
  }
};

module.exports.deleteLead = async (leadid) => {
  if (!leadid) {
    return {
      code: 400,
      status: false,
      message: "Lead ID is required",
    };
  }

  const db = global.dbConnection;

  try {
    // Check if lead exists
    const existingLead = await db("leads").where({ leadid }).first();
    if (!existingLead) {
      return {
        code: 404,
        status: false,
        message: "Lead not found",
      };
    }

    // Delete the lead
    await db("leads").where({ leadid }).del();

    return {
      code: 200,
      status: true,
      message: "Lead deleted successfully",
    };
  } catch (err) {
    console.error("Error deleting lead:", err);
    return {
      code: 500,
      status: false,
      message: "Failed to delete lead",
    };
  }
};

module.exports.updateLeadStatus = async (props) => {
  console.log("Received props:", props); // Debugging line

  const { leadid, key } = props;
  const db = global.dbConnection;

  if (!leadid) {
    return { code: 400, status: false, message: "Missing leadid" };
  }

  try {
    // Check if the lead exists
    const checkLeadExist = await db("leads")
      .where({ leadid })
      .select("leadstatus")
      .first();

    if (!checkLeadExist) {
      return { code: 200, status: false, message: "Lead not found" };
    }

    const result = await db.transaction(async (trx) => {
      switch (key) {
        case 1: // Activate Lead
          if (checkLeadExist.leadstatus === 1) {
            return {
              code: 200,
              status: false,
              message: "This lead is already active",
            };
          }

          const activateLead = await trx("leads")
            .update({ leadstatus: 1 })
            .where({ leadid });

          return activateLead > 0
            ? {
                code: 200,
                status: true,
                message: "Lead activated successfully",
              }
            : {
                code: 200,
                status: false,
                message: "Failed to activate lead",
              };

        case 2: // Deactivate Lead
          if (checkLeadExist.leadstatus === 2) {
            return {
              code: 200,
              status: false,
              message: "This lead is already inactive",
            };
          }

          const deactivateLead = await trx("leads")
            .update({ leadstatus: 2 })
            .where({ leadid });

          return deactivateLead > 0
            ? {
                code: 200,
                status: true,
                message: "Lead deactivated successfully",
              }
            : {
                code: 200,
                status: false,
                message: "Failed to deactivate lead",
              };

        default:
          return { code: 400, status: false, message: "Invalid status key" };
      }
    });

    return result;
  } catch (err) {
    console.log("Error updating lead status:", err);
    return {
      code: 500,
      status: false,
      message: "Failed to update lead status",
    };
  }
};
