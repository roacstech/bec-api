const _ = require("lodash");

module.exports.addLeadStage = async (props) => {
  const { tenantid, leadstagename, leadstageimage, userid } = props;
  const db = global.dbConnection;
  const upperleadtstagename = leadstagename.toUpperCase();
  try {
    const checkExistLeadStatus = await db("app_leadstage").where({
      leadstagename: upperleadtstagename,
      tenantid: tenantid,
    });
    if (!_.isEmpty(checkExistLeadStatus)) {
      return { code: 200, status: false, message: "Already lead stage exist" };
    }
    const result = db.transaction(async (trx) => {
      const response = await trx("app_leadstage").insert({
        leadstagename: upperleadtstagename,
        leadstageimage: leadstageimage,
        tenantid: tenantid,
        adduserid: userid,
      });

      if (response > 0) {
        return {
          code: 201,
          status: true,
          message: "Sucesfully lead stage created",
        };
      } else {
        await trx.rollback();
        return {
          code: 200,
          status: false,
          message: "Failed to create lead stage",
        };
      }
    });
    return result;
  } catch (err) {
    console.log("err", err);
    return {
      code: 200,
      status: false,
      message: "Failed to create lead stage",
    };
  }
};

module.exports.editLeadStage = async (props) => {
  const { leadstageid, leadstagename, tenantid, leadstageimage, userid } =
    props;
  const db = global.dbConnection;
  const upperleadstagename = leadstagename.toUpperCase();

  try {
    // Check if the lead stage exists
    const checkExist = await db("app_leadstage")
      .where({
        leadstageid: leadstageid,
        tenantid: tenantid,
      })
      .first();

    if (!checkExist) {
      return {
        code: 200,
        status: false,
        message: "This lead stage does not exist",
      };
    }

    // Check if the new lead stage name is already in use
    const nameExists = await db("app_leadstage")
      .where({
        leadstagename: upperleadstagename,
        tenantid: tenantid,
      })
      .andWhereNot({
        leadstageid: leadstageid,
      })
      .first();

    if (nameExists) {
      return {
        code: 200,
        status: false,
        message: "Lead stage name already in use",
      };
    }

    // Update the lead stage if all checks pass
    const result = await db.transaction(async (trx) => {
      try {
        const response = await trx("app_leadstage")
          .update({
            leadstagename: upperleadstagename,
            leadstageimage: leadstageimage,
            adduserid: userid,
          })
          .where({
            leadstageid: leadstageid,
            tenantid: tenantid,
          });

        if (response > 0) {
          return {
            code: 201,
            status: true,
            message: "Lead stage edited successfully",
          };
        } else {
          await trx.rollback();
          return {
            code: 200,
            status: false,
            message: "Failed to edit lead stage",
          };
        }
      } catch (updateError) {
        await trx.rollback();
        throw updateError;
      }
    });

    return result;
  } catch (err) {
    console.error("Error editing lead stage:", err);
    return {
      code: 500,
      status: false,
      message: "Failed to edit lead stage",
    };
  }
};

module.exports.getLeadStage = async (props) => {
  const { key, tenantid, leadstageid } = props;
  const db = global.dbConnection;

  try {
    const result = await db.transaction(async (trx) => {
      let query = trx("app_leadstage")
        .select("leadstageid", "leadstagename", "leadstageimage", "status")
        .where({ tenantid: tenantid });

      switch (key) {
        case 1:
          query = query.where({ status: 1 }); // Active lead stage
          break;
        case 2:
          query = query.where({ status: 2 }); // Inactive lead stage
          break;
        default:
          // No additional filtering on status if key is not 1 or 2
          break;
      }

      if (leadstageid) {
        query = query.where({ leadstageid: leadstageid });
      }

      const response = await query;

      if (!_.isEmpty(response)) {
        return {
          code: 200,
          status: true,
          message: "Successfully fetched lead stage",
          response: response,
        };
      } else {
        return {
          code: 200,
          status: true,
          message: "No lead stage data found",
          response: [],
        };
      }
    });
    return result;
  } catch (err) {
    console.error(err);
    return {
      code: 200,
      status: false,
      message: "Failed to fetch lead stage data",
      response: [],
    };
  }
};

module.exports.updateLeadStageStatus = async (props) => {
  const { tenantid, leadstageid, key } = props;
  const db = global.dbConnection;
  try {
    const checkExist = await db("app_leadstage").where({
      leadstageid: leadstageid,
      tenantid: tenantid,
    });

    if (_.isEmpty(checkExist)) {
      return {
        code: 200,
        status: false,
        message: "This lead stage not exist",
      };
    }
    const result = db.transaction(async (trx) => {
      switch (key) {
        case 1:
          const checkInactive = await trx("app_leadstage")
            .where({
              status: 2,
            })
            .where({
              leadstageid: leadstageid,
              tenantid: tenantid,
            });

          if (_.isEmpty(checkInactive)) {
            return {
              code: 200,
              status: false,
              message: "Already this lead stage active",
            };
          }

          if (!_.isEmpty(checkInactive)) {
            const active = await trx("app_leadstage")
              .update({
                status: 1,
              })
              .where({
                leadstageid: leadstageid,
                tenantid: tenantid,
              });
            if (active > 0) {
              return {
                code: 200,
                status: true,
                message: "Lead stage active successful",
              };
            } else {
              return {
                code: 200,
                status: false,
                message: "Failed to lead stage active",
              };
            }
          }
          break;

        case 2:
          const checkactive = await trx("app_leadstage")
            .where({
              status: 1,
            })
            .where({
              leadstageid: leadstageid,
              tenantid: tenantid,
            });

          if (_.isEmpty(checkactive)) {
            return {
              code: 200,
              status: false,
              message: "Already this lead status inactive",
            };
          }

          if (!_.isEmpty(checkactive)) {
            const inactive = await trx("app_leadstage")
              .update({
                status: 2,
              })
              .where({
                leadstageid: leadstageid,
                tenantid: tenantid,
              });
            if (inactive > 0) {
              return {
                code: 200,
                status: true,
                message: "Lead stage inactive successful",
              };
            } else {
              return {
                code: 200,
                status: false,
                message: "Failed to lead stage unavailable",
              };
            }
          }
          break;
      }
    });

    return result;
  } catch (err) {
    console.log(err);
    return {
      code: 200,
      status: false,
      message: "Failed to lead stage inactive",
    };
  }
};
