const _ = require("lodash");

module.exports.addLeadStatus = async (props) => {
  const { tenantid, leadstatusname, leadstatusimage } = props;
  const db = global.dbConnection;
  const upperleadtstatusname = leadstatusname.toUpperCase();
  try {
    const checkExistLeadStatus = await db("app_types").where({
      typename: upperleadtstatusname,
      tenantid: tenantid,
    });
    if (!_.isEmpty(checkExistLeadStatus)) {
      return { code: 200, status: false, message: "Already lead status exist" };
    }
    const result = db.transaction(async (trx) => {
      const response = await trx("app_types").insert({
        typename: upperleadtstatusname,
        typeimage: leadstatusimage,
        tenantid: tenantid,
      });

      if (response > 0) {
        return {
          code: 201,
          status: true,
          message: "Sucesfully lead status created",
        };
      } else {
        await trx.rollback();
        return {
          code: 200,
          status: false,
          message: "Failed to create lead status",
        };
      }
    });
    return result;
  } catch (err) {
    console.log("err", err);
    await db.rollback();
    return {
      code: 200,
      status: false,
      message: "Failed to create lead status",
    };
  }
};

module.exports.editLeadStatus = async (props) => {
  const { apptypeid, leadstatusname, tenantid, leadstatusimage } = props;
  const db = global.dbConnection;
  const upperleadstatusname = leadstatusname.toUpperCase();

  try {
    // Check if the lead status exists
    const checkExist = await db("app_types")
      .where({
        apptypeid: apptypeid,
        tenantid: tenantid,
      })
      .first();

    if (!checkExist) {
      return {
        code: 200,
        status: false,
        message: "This lead status does not exist",
      };
    }

    // Check if the new lead status name is already in use
    const nameExists = await db("app_types")
      .where({
        typename: upperleadstatusname,
        tenantid: tenantid,
      })
      .andWhereNot({
        apptypeid: apptypeid,
      })
      .first();

    if (nameExists) {
      return {
        code: 200,
        status: false,
        message: "Lead status name already in use",
      };
    }

    // Update the lead status if all checks pass
    const result = await db.transaction(async (trx) => {
      try {
        const response = await trx("app_types")
          .update({
            typename: upperleadstatusname,
            typeimage: leadstatusimage,
          })
          .where({
            apptypeid: apptypeid,
            tenantid: tenantid,
          });

        if (response > 0) {
          return {
            code: 201,
            status: true,
            message: "Lead status edited successfully",
          };
        } else {
          await trx.rollback();
          return {
            code: 200,
            status: false,
            message: "Failed to edit lead status",
          };
        }
      } catch (updateError) {
        await trx.rollback();
        throw updateError;
      }
    });

    return result;
  } catch (err) {
    console.error("Error editing lead status:", err);
    return {
      code: 500,
      status: false,
      message: "Failed to edit lead status",
    };
  }
};

module.exports.getLeadStatus = async (props) => {
  const { key, tenantid, apptypeid } = props;
  const db = global.dbConnection;

  try {
    const result = await db.transaction(async (trx) => {
      let query = trx("app_types")
        .select(
          "apptypeid",
          "typename as leadstatusname",
          "typeimage as leadstatusimage",
          "status"
        )
        .where({ tenantid: tenantid });

      switch (key) {
        case 1:
          query = query.where({ status: 1 }); // Active lead status
          break;
        case 2:
          query = query.where({ status: 2 }); // Inactive lead status
          break;
        default:
          // No additional filtering on status if key is not 1 or 2
          break;
      }

      if (apptypeid) {
        query = query.where({ apptypeid: apptypeid });
      }

      const response = await query;

      if (!_.isEmpty(response)) {
        return {
          code: 200,
          status: true,
          message: "Successfully fetched lead status",
          response: response,
        };
      } else {
        return {
          code: 200,
          status: true,
          message: "No lead status data found",
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
      message: "Failed to fetch lead status data",
      response: [],
    };
  }
};

module.exports.updateLeadStatus = async (props) => {
  const { tenantid, apptypeid, key } = props;
  const db = global.dbConnection;
  try {
    const checkCategoryExist = await db("app_types").where({
      apptypeid: apptypeid,
      tenantid: tenantid,
    });

    if (_.isEmpty(checkCategoryExist)) {
      return {
        code: 200,
        status: false,
        message: "This lead status not exist",
      };
    }
    const result = db.transaction(async (trx) => {
      switch (key) {
        case 1:
          const checkInactive = await trx("app_types")
            .where({
              status: 2,
            })
            .where({
              apptypeid: apptypeid,
              tenantid: tenantid,
            });

          if (_.isEmpty(checkInactive)) {
            return {
              code: 200,
              status: false,
              message: "Already this lead status available",
            };
          }

          if (!_.isEmpty(checkInactive)) {
            const active = await trx("app_types")
              .update({
                status: 1,
              })
              .where({
                apptypeid: apptypeid,
                tenantid: tenantid,
              });
            if (active > 0) {
              return {
                code: 200,
                status: true,
                message: "Lead status available successful",
              };
            } else {
              return {
                code: 200,
                status: false,
                message: "Failed to lead status available",
              };
            }
          }
          break;

        case 2:
          const checkactive = await trx("app_types")
            .where({
              status: 1,
            })
            .where({
              apptypeid: apptypeid,
              tenantid: tenantid,
            });

          if (_.isEmpty(checkactive)) {
            return {
              code: 200,
              status: false,
              message: "Already this lead status unavailable",
            };
          }

          if (!_.isEmpty(checkactive)) {
            const inactive = await trx("app_types")
              .update({
                status: 2,
              })
              .where({
                apptypeid: apptypeid,
                tenantid: tenantid,
              });
            if (inactive > 0) {
              return {
                code: 200,
                status: true,
                message: "Lead status unavailable successful",
              };
            } else {
              return {
                code: 200,
                status: false,
                message: "Failed to lead status unavailable",
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
