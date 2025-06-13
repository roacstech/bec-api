const _ = require("lodash");

module.exports.createLeadSource = async (props) => {
  const { tenantid, leadsourcename, leadsourceimage } = props;
  const db = global.dbConnection;
  const upperleadsourcename = leadsourcename.toUpperCase();

  try {
    const checkExist = await db("app_leadsource").where({
      leadsourcename: upperleadsourcename,
      tenantid: tenantid,
    });

    if (!_.isEmpty(checkExist)) {
      return {
        code: 200,
        status: false,
        message: "Already exist lead source name",
      };
    }
    const result = db.transaction(async (trx) => {
      const response = await trx("app_leadsource").insert({
        leadsourcename: upperleadsourcename,
        leadsourceimage: leadsourceimage,
        tenantid: tenantid,
      });
      if (response > 0) {
        return {
          code: 201,
          status: true,
          message: "Lead source added successful",
        };
      } else {
        await trx.rollback();
        return {
          code: 200,
          status: true,
          message: "Failed to add lead source",
        };
      }
    });
    return result;
  } catch (err) {
    console.log("err", err);
    await db.rollback();
    return { code: 200, status: true, message: "Failed to add lead source" };
  }
};

module.exports.editLeadSource = async (props) => {
  const { tenantid, leadsourceid, leadsourcename, leadsourceimage } = props;
  const db = global.dbConnection;
  const upperleadsourcename = leadsourcename.toUpperCase();

  try {
    // Check if the new lead source name is already in use
    const nameExists = await db("app_leadsource")
      .where({
        leadsourcename: upperleadsourcename,
        tenantid: tenantid,
      })
      .andWhereNot({
        leadsourceid: leadsourceid,
      })
      .first();

    if (nameExists) {
      return {
        code: 200,
        status: false,
        message: "Lead source name already in use",
      };
    }

    const result = await db.transaction(async (trx) => {
      try {
        const response = await trx("app_leadsource")
          .update({
            leadsourcename: upperleadsourcename,
            leadsourceimage: leadsourceimage,
          })
          .where({
            leadsourceid: leadsourceid,
            tenantid: tenantid,
          });

        if (response > 0) {
          return {
            code: 201,
            status: true,
            message: "Lead source edited successfully",
          };
        } else {
          await trx.rollback();
          return {
            code: 200,
            status: false,
            message: "Failed to edit lead source",
          };
        }
      } catch (updateError) {
        await trx.rollback();
        throw updateError;
      }
    });

    return result;
  } catch (err) {
    console.error("Error editing lead source:", err);
    return {
      code: 500,
      status: false,
      message: "Failed to edit lead source",
    };
  }
};

module.exports.getLeadSource = async (props) => {
  const { key, leadsourceid, tenantid } = props;
  const db = global.dbConnection;

  try {
    const result = await db.transaction(async (trx) => {
      let source = trx("app_leadsource")
        .select("leadsourceid", "leadsourcename", "leadsourceimage", "status")
        .where({ tenantid: tenantid });

      switch (key) {
        case 1:
          source = source.where({ status: 1 });
          break;
        case 2:
          source = source.where({ status: 2 });
          break;
        default:
          // No additional filtering on status if key is not 1 or 2
          break;
      }

      if (leadsourceid) {
        source = source.where({ leadsourceid: leadsourceid });
      }

      const response = await source;

      if (!_.isEmpty(response)) {
        return {
          code: 200,
          status: true,
          message: "Lead source data fetched successfully",
          response: response,
        };
      } else {
        return {
          code: 200,
          status: true,
          message: "No Lead source data fetched",
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
      message: "Failed to fetch lead source data",
      response: [],
    };
  }
};

module.exports.updateLeadSourceStatus = async (props) => {
  const { tenantid, leadsourceid, key } = props;
  const db = global.dbConnection;
  try {
    const checkCategoryExist = await db("app_leadsource").where({
      leadsourceid: leadsourceid,
      tenantid: tenantid,
    });

    if (_.isEmpty(checkCategoryExist)) {
      return {
        code: 200,
        status: false,
        message: "This lead source not exist",
      };
    }
    const result = db.transaction(async (trx) => {
      switch (key) {
        case 1:
          const checkInactive = await trx("app_leadsource")
            .where({
              status: 2,
            })
            .where({
              leadsourceid: leadsourceid,
              tenantid: tenantid,
            });

          if (_.isEmpty(checkInactive)) {
            return {
              code: 200,
              status: false,
              message: "Already this lead source available",
            };
          }

          if (!_.isEmpty(checkInactive)) {
            const active = await trx("app_leadsource")
              .update({
                status: 1,
              })
              .where({
                leadsourceid: leadsourceid,
                tenantid: tenantid,
              });
            if (active > 0) {
              return {
                code: 200,
                status: true,
                message: "Lead source available successful",
              };
            } else {
              return {
                code: 200,
                status: false,
                message: "Failed to lead source available",
              };
            }
          }
          break;

        case 2:
          const checkactive = await trx("app_leadsource")
            .where({
              status: 1,
            })
            .where({
              leadsourceid: leadsourceid,
              tenantid: tenantid,
            });

          if (_.isEmpty(checkactive)) {
            return {
              code: 200,
              status: false,
              message: "Already this lead source unavailable",
            };
          }

          if (!_.isEmpty(checkactive)) {
            const inactive = await trx("app_leadsource")
              .update({
                status: 2,
              })
              .where({
                leadsourceid: leadsourceid,
                tenantid: tenantid,
              });
            if (inactive > 0) {
              return {
                code: 200,
                status: true,
                message: "Lead source unavailable successful",
              };
            } else {
              return {
                code: 200,
                status: false,
                message: "Failed to lead source unavailable",
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
      message: "Failed to lead source unavailable",
    };
  }
};
