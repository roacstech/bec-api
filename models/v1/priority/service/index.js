const _ = require("lodash");


  module.exports.addPriority = async (props) => {
    const { tenantid, priorityname, priorityimage } = props;
    const db = global.dbConnection;
    const upperpriorityename = priorityname.toUpperCase();
    try {
      const checkExist = await db("app_priority").where({
        priorityname: upperpriorityename,
        tenantid: tenantid,
      });
      if (!_.isEmpty(checkExist)) {
        return {
          code: 200,
          status: false,
          message: "Already priority name exist",
        };
      }
      const result = db.transaction(async (trx) => {
        const add = await trx("app_priority").insert({
          priorityname: upperpriorityename,
          priorityimage: priorityimage,
          tenantid: tenantid,
        });
        if (add) {
          return {
            code: 201,
            status: true,
            message: "Priority added successful",
          };
        } else {
          await trx.rollback();
          return {
            code: 200,
            status: false,
            message: "Failed to add priority",
          };
        }
      });
      return result;
    } catch (err) {
      console.log(err);
      await db.rollback();
      return { code: 200, status: false, message: "Failed to add priority" };
    }
  };
  
  module.exports.editPriority = async (props) => {
    const { tenantid, priorityid, priorityname, priorityimage } = props;
    const db = global.dbConnection;
    const upperpriorityname = priorityname.toUpperCase();
  
    try {
      // Check if the priority to be edited exists
      const checkExist = await db("app_priority").where({
        priorityid: priorityid,
        tenantid: tenantid,
      });
  
      if (_.isEmpty(checkExist)) {
        return { code: 200, status: false, message: "Priority does not exist" };
      }
  
      // Check if the new priority name already exists for the given tenant
      const nameExists = await db("app_priority")
        .where({
          priorityname: upperpriorityname,
          tenantid: tenantid,
        })
        .andWhereNot({
          priorityid: priorityid,
        });
  
      if (!_.isEmpty(nameExists)) {
        return {
          code: 200,
          status: false,
          message: "Priority name already in use",
        };
      }
  
      // Proceed with updating the priority
      const result = await db.transaction(async (trx) => {
        try {
          await trx("app_priority")
            .update({
              priorityname: upperpriorityname,
              priorityimage: priorityimage,
            })
            .where({
              tenantid: tenantid,
              priorityid: priorityid,
            });
  
          return {
            code: 200,
            status: true,
            message: "Priority edited successfully",
          };
        } catch (updateError) {
          await trx.rollback();
          throw updateError;
        }
      });
  
      return result;
    } catch (err) {
      console.log(err);
      return { code: 500, status: false, message: "Failed to edit priority" };
    }
  };
  
  module.exports.getPriority = async (props) => {
    const { key, priorityid, tenantid } = props;
    const db = global.dbConnection;
  
    try {
      const result = await db.transaction(async (trx) => {
        let query = trx("app_priority")
          .select("priorityid", "priorityname", "priorityimage", "status")
          .where({ tenantid: tenantid });
  
        switch (key) {
          case 1:
            query = query.where({ status: 1 });
            break;
          case 2:
            query = query.where({ status: 2 });
            break;
          default:
            // No additional filtering on status if key is not 1 or 2
            break;
        }
  
        if (priorityid) {
          query = query.where({ priorityid: priorityid });
        }
  
        const response = await query;
  
        if (!_.isEmpty(response)) {
          return {
            code: 200,
            status: true,
            message: "Priority data fetched successfully",
            response: response,
          };
        } else {
          return {
            code: 200,
            status: true,
            message: "No Priority data fetched",
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
        message: "Failed to fetch priority data",
        response: [],
      };
    }
  };
  
  module.exports.updatePriorityStatus = async (props) => {
    const { tenantid, priorityid, key } = props;
    const db = global.dbConnection;
    try {
      const checkExist = await db("app_priority").where({
        priorityid: priorityid,
        tenantid: tenantid,
      });
  
      if (_.isEmpty(checkExist)) {
        return { code: 200, status: false, message: "This priority not exist" };
      }
      const result = db.transaction(async (trx) => {
        switch (key) {
          case 1:
            const checkInactive = await trx("app_priority")
              .where({
                status: 2,
              })
              .where({
                priorityid: priorityid,
                tenantid: tenantid,
              });
  
            if (_.isEmpty(checkInactive)) {
              return {
                code: 200,
                status: false,
                message: "Already this priority active",
              };
            }
  
            if (!_.isEmpty(checkInactive)) {
              const active = await trx("app_priority")
                .update({
                  status: 1,
                })
                .where({
                  priorityid: priorityid,
                  tenantid: tenantid,
                });
              if (active > 0) {
                return {
                  code: 200,
                  status: true,
                  message: "Priority available successful",
                };
              } else {
                return {
                  code: 200,
                  status: false,
                  message: "Failed to priority available",
                };
              }
            }
            break;
  
          case 2:
            const checkactive = await trx("app_priority")
              .where({
                status: 1,
              })
              .where({
                priorityid: priorityid,
                tenantid: tenantid,
              });
  
            if (_.isEmpty(checkactive)) {
              return {
                code: 200,
                status: false,
                message: "Already this priority inactive",
              };
            }
  
            if (!_.isEmpty(checkactive)) {
              const inactive = await trx("app_priority")
                .update({
                  status: 2,
                })
                .where({
                  priorityid: priorityid,
                  tenantid: tenantid,
                });
              if (inactive > 0) {
                return {
                  code: 200,
                  status: true,
                  message: "Prioriy inactive successful",
                };
              } else {
                return {
                  code: 200,
                  status: false,
                  message: "Failed to priority inactive",
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
        message: "Failed to priority inactive",
      };
    }
  };
  