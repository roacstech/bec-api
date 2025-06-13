const _ = require("lodash");
const bcrypt = require("bcrypt");
const moment = require("moment");
const momenttimezone = require("moment-timezone");

//leads crud api

module.exports.createLead = async (props) => {
  const {
    companyid,
    tenantid,
    priorityid,
    configid,
    cityid,
    stateid,
    countryid,
    leadsourceid,
    leadstageid,
    leadstatusid,
    followupdate,
    userid,
    leadname,
    primaryemail,
    alteremail,
    address,
    leadimage,
    leadcompanyname,
    companyemail,
    companyaddress,
    primarycontact,
    altercontact,
    productid,
    description,
  } = props;

  const currentServerDateTimeUTC = moment()
    .utc()
    .format("YYYY-MM-DDTHH:mm:ss[Z]");
  const formattedFollowupDate = followupdate
    ? moment(followupdate).utc().format("YYYY-MM-DDTHH:mm:ss[Z]")
    : currentServerDateTimeUTC;

  const db = global.dbConnection;
  const upperleadname = leadname.toUpperCase();
  const currentYear = moment().year();

  try {
    // Check if lead email or contact already exists
    const [checkLeadEmailExist, checkLeadContactExist] = await Promise.all([
      db("leads").where({ tenantid, primaryemail, companyid }).first(),
      db("leads").where({ tenantid, primarycontact, companyid }).first(),
    ]);

    if (checkLeadEmailExist) {
      return { code: 200, status: false, message: "Lead email already exists" };
    }

    if (checkLeadContactExist) {
      return {
        code: 200,
        status: false,
        message: "Lead contact number already exists",
      };
    }
    const result = await db.transaction(async (trx) => {
      // Generate new tenant lead ID
      const lastLead = await trx("leads")
        .select("tenantleadid")
        .where({ tenantid })
        .orderBy("tenantleadid", "desc")
        .first();

      const newTenantLeadID = lastLead ? lastLead.tenantleadid + 1 : 1;

      // Insert the new lead
      const [addLeadId] = await trx("leads").insert({
        tenantid,
        companyid,
        leadimage,
        adduserid: userid,
        tenantleadid: newTenantLeadID,
        leadname: upperleadname,
        configid,
        leadsourceid,
        priorityid,
        leadstatusid,
        leadstageid,
        primaryemail,
        alteremail,
        primarycontact,
        altercontact,
        leadcompanyname,
        companyemail,
        companyaddress,
        enquirydate: formattedFollowupDate,
        followupdate: formattedFollowupDate,
        leaddate: currentServerDateTimeUTC,
        productid: productid.join(),
        description,
        address,
        cityid,
        stateid,
        countryid,
      });

      if (!addLeadId) throw new Error("Failed to create lead");

      // Generate unique ID for the lead
      const leadUniqueId = `LMS_LDS-${currentYear}_WT/${tenantid}${String(
        newTenantLeadID
      ).padStart(6, "0")}`;
      const updateUniqueID = await trx("leads")
        .where({ leadid: addLeadId })
        .update({ leaduniqueid: leadUniqueId });

      if (updateUniqueID === 0)
        throw new Error("Failed to update lead unique ID");

      // // Step 1: Find the staff with the least processing leads
      // const staffWithLeastProcessingLeads = await trx("tenantstaffperformance")
      //   .select("tenantstaffid", "processingleads", "completedpercentage")
      //   .where({ tenantid })
      //   .orderBy("processingleads", "asc")
      //   .first();

      // // Step 2: If there are multiple staff members with the same processing leads, choose the one with the lowest completed percentage
      // const staffCandidates = await trx("tenantstaffperformance")
      //   .select("tenantstaffid", "completedpercentage")
      //   .where({
      //     tenantid,
      //     processingleads: staffWithLeastProcessingLeads.processingleads,
      //   })
      //   .orderBy("completedpercentage", "asc");

      // const selectedStaff = staffCandidates[0]; // Staff with the lowest completed percentage

      // if (!selectedStaff) throw new Error("No suitable staff found.");

      // Map products to lead details
      const mapProducts = productid.map((prod) => ({
        productid: prod,
        tenantid,
        companyid,
        // tenantstaffid: selectedStaff.tenantstaffid,
        leadid: addLeadId,
        adduserid: userid,
        tenantleadid: newTenantLeadID,
      }));

      const [insertedLeadOrderId] = await trx("leaddetails").insert(
        mapProducts
      );

      if (!insertedLeadOrderId)
        throw new Error("Failed to create lead details");

      // // Update staff performance
      // const getStaffPerformance = await trx("tenantstaffperformance")
      //   .select("totalleads", "processingleads", "completedleads")
      //   .where({ tenantid, tenantstaffid: selectedStaff.tenantstaffid })
      //   .first();

      // const totalLeads = getStaffPerformance ? getStaffPerformance.totalleads + 1 : 1;
      // const processingLeads = getStaffPerformance ? getStaffPerformance.processingleads + 1 : 1;
      // const completedLeads = getStaffPerformance ? getStaffPerformance.completedleads : 0;

      // const completedPercentage = ((completedLeads / totalLeads) * 100).toFixed(2);

      // const updatedRows = await trx("tenantstaffperformance")
      //   .update({
      //     totalleads: totalLeads,
      //     processingleads: processingLeads,
      //     completedpercentage: completedPercentage,
      //   })
      //   .where({ tenantid, tenantstaffid: selectedStaff.tenantstaffid });

      // if (updatedRows === 0) throw new Error("Failed to update staff performance");

      return { code: 201, status: true, message: "Lead created successfully" };
    });

    return result;
  } catch (err) {
    console.error("Error:", err);
    return { code: 500, status: false, message: "Internal server error" };
  }
};

module.exports.editLead = async (props) => {
  const {
    leadid,
    leadimage,
    tenantid,
    tenantleadid,
    leadstageid,
    priorityid,
    configid,
    followupdate,
    cityid,
    stateid,
    countryid,
    leadsourceid,
    leadstatusid,
    userid,
    leadname,
    primaryemail,
    alteremail,
    address,
    tenantstaffid,
    leadcompanyname,
    companyemail,
    companyaddress,
    primarycontact,
    altercontact,
    productid,
    description,
  } = props;

  const db = global.dbConnection;
  const upperleadname = leadname.toUpperCase();

  try {
    const productIds =
      productid && productid.length > 0 ? productid.join() : null;
    const tenantstaffIds =
      tenantstaffid && tenantstaffid.length > 0 ? tenantstaffid.join() : 0;
    const currentServerDateTimeUTC = moment().utc().format();

    // Convert followupdate to UTC if provided
    const formattedEnquiryDate = followupdate
      ? moment(followupdate).utc().format()
      : currentServerDateTimeUTC;

    // Create the lead within a transaction
    const result = await db.transaction(async (trx) => {
      const updateLead = await trx("leads")
        .update({
          tenantid,
          leadimage,
          adduserid: userid,
          leadstageid,
          leadname: upperleadname,
          configid,
          leadsourceid,
          priorityid,
          leadstatusid,
          primaryemail,
          alteremail,
          primarycontact,
          altercontact,
          leadcompanyname,
          companyemail,
          companyaddress,
          followupdate: formattedEnquiryDate,
          productid: productIds,
          description,
          address,
          cityid,
          stateid,
          countryid,
          tenantstaffid: tenantstaffIds,
        })
        .where({
          leadid: leadid,
          tenantid: tenantid,
          tenantleadid: tenantleadid,
        });

      if (updateLead <= 0) {
        throw new Error("Failed to update lead");
      }

      // Delete existing lead details before inserting new ones
      await trx("leaddetails")
        .where({
          leadid: leadid,
          tenantleadid: tenantleadid,
          tenantid: tenantid,
        })
        .del();

      if (productid && productid.length > 0) {
        // Map products to lead details
        const mapProducts = productid.map((prod) => ({
          productid: prod,
          tenantid,
          tenantstaffid: tenantstaffIds,
          leadid: leadid,
          adduserid: userid,
          tenantleadid: tenantleadid,
        }));

        await trx("leaddetails").insert(mapProducts);
      }

      return {
        code: 200,
        status: true,
        message: "Lead edited successfully",
      };
    });

    return result;
  } catch (err) {
    console.error("Error:", err);
    return { code: 500, status: false, message: "Failed to edit lead" };
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
        .where({ "leads.tenantid": tenantid })
      

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

module.exports.leadReAssignToStaff = async (props) => {
  const { tenantstaffid, leadid, tenantid, userid } = props;
  const db = global.dbConnection;

  try {
    const checkLeadExist = await db("leaddetails")
      .where({ leadid, tenantid })
      .first();

    if (_.isEmpty(checkLeadExist)) {
      return {
        code: 200,
        status: true,
        message: "Lead data does not exist",
      };
    }

    const result = await db.transaction(async (trx) => {
      // Update the leads table
      const updatedLead = await trx("leads")
        .update({
          tenantstaffid,
          adduserid: userid,
        })
        .where({ tenantid, leadid });

      if (updatedLead === 0) {
        throw new Error("Failed to update leads table");
      }

      // Update the leaddetails table
      const updatedRows = await trx("leaddetails")
        .update({
          tenantstaffid,
          adduserid: userid,
        })
        .where({ tenantid, leadid });

      if (updatedRows === 0) {
        throw new Error("Failed to reassign lead details");
      }

      // Fetch or insert staff performance data
      const getStaffPerformance = await trx("tenantstaffperformance")
        .select("totalleads", "processingleads", "completedleads")
        .where({ tenantid, tenantstaffid })
        .first();

      const totalLeads = (getStaffPerformance?.totalleads || 0) + 1;
      const processingLeads = (getStaffPerformance?.processingleads || 0) + 1;
      const completedLeads = getStaffPerformance?.completedleads || 0;
      const completedPercentage = ((completedLeads / totalLeads) * 100).toFixed(
        2
      );

      if (getStaffPerformance) {
        await trx("tenantstaffperformance")
          .update({
            totalleads: totalLeads,
            processingleads: processingLeads,
            completedpercentage: completedPercentage,
          })
          .where({ tenantid, tenantstaffid });
      } else {
        await trx("tenantstaffperformance").insert({
          tenantid,
          tenantstaffid,
          totalleads: totalLeads,
          processingleads: processingLeads,
          completedleads: completedLeads,
          completedpercentage: completedPercentage,
        });
      }

      return {
        code: 200,
        status: true,
        message: "Successfully reassigned lead to staff",
      };
    });

    return result;
  } catch (err) {
    console.error(err);
    return {
      code: 500,
      status: false,
      message: err.message || "Failed to reassign lead to staff",
    };
  }
};

module.exports.assignLeadToEmployee = async (props) => {
  const { tenantid, leadid, leadorderdate, starttime, tenantstaffid, userid } = props;
  const db = global.dbConnection;

  try {
    // Begin transaction
    const result = await db.transaction(async (trx) => {

      const assign = await trx('leads')
        .update({
          leadstatusid: 2
        })
        .where({
          leadid
        });


      // Insert into leadorders table and return leadorderid
      const [leadorderid] = await trx("leadorders").insert({
        tenantid,
        leadid,
        leadorderdate,
        adduserid: userid,
        starttime: starttime
      });

      // Throw error if leadorderid wasn't created
      if (!leadorderid) {
        throw new Error('leadorderid not created!');
      }

      // Map through tenantstaffid array and assign leads to staff
      await Promise.all(
        tenantstaffid.map(async (staff) => {
          // Fetch staff user details
          const staffusers = await trx('app_users')
            .leftJoin('tenantstaffs', 'tenantstaffs.userid', 'app_users.userid')
            .select('app_users.userid')
            .where({ 'tenantstaffs.tenantstaffid': staff })
            .first();

          // Check if staff user exists
          if (!staffusers) {
            throw new Error(`No staff user found for tenantstaffid: ${staff}`);
          }

          // Insert into leaddeliveries table
          const [leaddeliveryid] = await trx('leaddeliveries').insert({
            leadorderid: leadorderid,
            leadid: leadid,
            tenantstaffid: staff,
            staffuserid: staffusers.userid,
            adduserid: userid,
            starttime: starttime,
          });

          // Throw error if leaddeliveryid wasn't created
          if (!leaddeliveryid) {
            throw new Error('leaddeliveryid not created!');
          }
        })
      );

      // Return success message after transaction completion
      return {
        code: 200,
        status: true,
        message: 'Staff assigned successfully',
      };
    });

    return result;

  } catch (err) {
    console.error('Error assigning lead to staff:', err.message);
    return {
      code: 500,
      status: false,
      message: 'Failed to assign staff',
    };
  }
};


module.exports.getLeadsById = async (props) => {
  const { leadid, tenantid } = props;
  const db = global.dbConnection;

  try {
    // Main query for lead data
    let leaddata = db("leads")
      .leftJoin("app_types", "app_types.apptypeid", "leads.leadstatusid")
      .leftJoin("app_leadstage", "app_leadstage.leadstageid", "leads.leadstageid")
      .leftJoin("countries", "countries.countryid", "leads.countryid")
      .leftJoin("states", "states.stateid", "leads.stateid")
      .leftJoin("cities", "cities.cityid", "leads.cityid")
      .leftJoin("app_priority", "app_priority.priorityid", "leads.priorityid")
      .leftJoin("app_leadsource", "app_leadsource.leadsourceid", "leads.leadsourceid")
      .leftJoin("company", "company.companyid", "leads.companyid")
      .leftJoin("leaddeliveryimages", "leaddeliveryimages.leadid", "leads.leadid")
      .leftJoin("leaddeliveries", "leaddeliveries.leaddeliveryid", "leaddeliveryimages.leaddeliveryid")
      .select(
        "leads.*",
        "company.companyid",
        "company.companyname",
        "countries.countryname",
        "states.statename",
        "cities.cityname",
        "app_leadsource.leadsourcename",
        "app_leadsource.leadsourceimage",
        "app_leadstage.leadstagename",
        "app_leadstage.leadstageimage",
        "app_types.apptypeid as leadstatusid",
        "app_types.typename as leadstatusname",
        "app_types.typeimage as leadstatusimage",
        "app_priority.priorityname",
        "leaddeliveries.remarks"
      )
      .where({ "leads.tenantid": tenantid });

    if (leadid) {
      leaddata = leaddata.andWhere({ "leads.leadid": leadid });
    }

    const response = await leaddata.first();

    if (!response) {
      return {
        code: 200,
        status: true,
        message: "No lead data",
        response: [],
      };
    }

    // Fetch delivery images for the lead as an array
    const deliveryImages = await db("leaddeliveryimages")
      .select("image")
      .where({ leadid: leadid });
    response.deliveryImages = deliveryImages.map(imageurl => imageurl.image);

    // Fetch staff details for the response object
    const staffDetails = await db("leaddeliveries")
      .leftJoin("tenantstaffs", "tenantstaffs.tenantstaffid", "leaddeliveries.tenantstaffid")
      .select(
        "tenantstaffs.*"
      )
      .where({
        "leaddeliveries.leadid": response.leadid
      });
    response.staffDetails = staffDetails || [];

    // Fetch product details for the lead
    const productDetails = await db("leaddetails")
      .leftJoin("products", "products.productid", "leaddetails.productid")
      .leftJoin("productcategories", "productcategories.categoryid", "products.productcategoryid")
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
        "leaddetails.leadid": response.leadid,
        "leaddetails.tenantleadid": response.tenantleadid,
      });
    response.productDetails = productDetails || [];

    return {
      code: 200,
      status: true,
      message: "Successfully retrieved leads data",
      response: response,
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