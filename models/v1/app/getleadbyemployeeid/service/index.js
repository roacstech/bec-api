const _ = require("lodash");
const bcrypt = require("bcrypt");
const moment = require("moment");

module.exports.getLeadByEmployeeId = async (props) => {
  const { userid, tenantstaffid } = props;
  const db = global.dbConnection;

  try {
    // Retrieve leads associated with the tenantstaff
    const leadData = await db("leads")
      .leftJoin("leadorders", "leadorders.leadid", "leads.leadid")
      .leftJoin(
        "leaddeliveries",
        "leaddeliveries.leadorderid",
        "leadorders.leadorderid"
      )
      .select(
        "leads.*",
        "leadorders.leadorderid",
        "leaddeliveries.leaddeliveryid",
        "leaddeliveries.tenantstaffid"
      )
      .where({
        "leaddeliveries.tenantstaffid": tenantstaffid,
      });

    // Fetch delivery images and attach them to each lead
    const leadsWithImages = await Promise.all(
      leadData.map(async (lead) => {
        const deliveryImages = await db("leaddeliveryimages")
          .select("image")
          .where({
            "leaddeliveryimages.leaddeliveryid": lead.leaddeliveryid,
          });

        // Attach images to the current lead
        lead.deliveryimages = deliveryImages.length ? deliveryImages : [];

        return lead;
      })
    );

    return {
      code: 200,
      status: true,
      message: "Successfully retrieved tenantstaff and lead data",
      response: {
        leads: leadsWithImages,
        tenantstaffid: tenantstaffid, // Returning tenantstaffid for reference
      },
    };
  } catch (err) {
    console.error("Error retrieving data:", err);
    return {
      code: 500,
      status: false,
      message: "Failed to retrieve data",
    };
  }
};

module.exports.employeeSiteVisit = async (props) => {
  const {
    tenantstaffid,
    remarks,
    leadid,
    leadorderid,
    tenantid,
    leaddeliveryid,
    siteimages,
  } = props;
  const db = global.dbConnection;

  try {
    // Begin transaction
    const result = await db.transaction(async (trx) => {
      // Update remarks in leaddeliveries table
      const staffVisitUpdate = await trx("leaddeliveries")
        .update({ remarks })
        .where({ tenantstaffid, leaddeliveryid });

      // Ensure the staff visit update was successful
      if (staffVisitUpdate === 0) {
        throw new Error("Failed to update staff visit remarks!");
      }

      // Insert site images into leaddeliveryimages table if any
      if (!_.isEmpty(siteimages)) {
        const imageInsertions = siteimages.map((img) => {
          return trx("leaddeliveryimages").insert({
            image: img,
            leadid,
            leadorderid,
            leaddeliveryid,
            tenantid,
            type: 1,
          });
        });

        await Promise.all(imageInsertions); // Wait for all insertions to complete
      }

      // Return success after transaction completes
      return {
        code: 200,
        status: true,
        message: "Site visit and images recorded successfully!",
      };
    });

    return result;
  } catch (err) {
    console.error("Error during employee site visit:", err.message || err);
    return { code: 500, status: false, message: "Site visit failed!" };
  }
};

module.exports.getLeadSiteVisitDetails = async (props) => {
  const db = global.dbConnection;
  const { leaddeliveryid } = props;
  try {
    // Use 'await' to properly wait for the transaction to complete
    const result = await db.transaction(async (trx) => {
      const data = await trx("leaddeliveries")
        .leftJoin(
          "leadorders",
          "leadorders.leadorderid",
          "leaddeliveries.leadorderid"
        )
        .leftJoin("leads", "leads.leadid", "leadorders.leadid")
        .where({
          "leaddeliveries.leaddeliveryid": leaddeliveryid,
        });
      // Loop through and add delivery images for each data entry
      await Promise.all(
        data.map(async (img) => {
          const deliveryimages = await trx("leaddeliveryimages")
            .select(
              "leaddeliveryimages.leaddeliveryimageid",
              "leaddeliveryimages.image"
            )
            .where({
              "leaddeliveryimages.leaddeliveryid": img.leaddeliveryid,
            });
          // Assign an empty array if no images are found
          img.deliveryimages = deliveryimages.length > 0 ? deliveryimages : [];
        })
      );
      // Check if data is empty and return an appropriate response
      if (_.isEmpty(data)) {
        return {
          code: 200,
          status: true,
          message: "Successfully retrieved no data",
          response: [],
        };
      } else {
        return {
          code: 200,
          status: true,
          message: "Successfully retrieved",
          response: data,
        };
      }
    });
    // Return the transaction result
    return result;
  } catch (err) {
    console.error(err);
    // Return a failed response in case of an error
    return {
      code: 500,
      status: false,
      message: "Failed to fetch site visit data",
      error: err.message,
    };
  }
};
