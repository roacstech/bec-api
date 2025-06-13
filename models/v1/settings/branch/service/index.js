const _ = require("lodash");

module.exports.addBranch = async (props) => {
  const {
    tenantid,
    branchname,
    branchimage,
    branchaddress,
    gstno,
    latitude,
    longitude,
  } = props;
  const db = global.dbConnection;
  const upperbranchname = branchname.toUpperCase();

  try {
    const checkExist = await db("app_location").where({
      locationname: upperbranchname,
      tenantid: tenantid,
    });

    if (!_.isEmpty(checkExist)) {
      return {
        code: 200,
        status: false,
        message: "Already exist branch name",
      };
    }
    const result = await db.transaction(async (trx) => {
      const response = await trx("app_location").insert({
        locationname: upperbranchname,
        locationimage: branchimage,
        tenantid: tenantid,
        locationaddress: branchaddress,
        longitude: longitude,
        latitude: latitude,
        gstno: gstno,
      });
      if (response > 0) {
        return { code: 201, status: true, message: "Branch added successful" };
      } else {
        await trx.rollback();
        return { code: 200, status: false, message: "Failed to add branch" };
      }
    });
    return result;
  } catch (err) {
    console.log(err);
    await db.rollback();
    return { code: 200, status: false, message: "Failed to add branch" };
  }
};

module.exports.editBranch = async (props) => {
  const {
    tenantid,
    branchid,
    branchname,
    branchimage,
    branchaddress,
    gstno,
    latitude,
    longitude,
  } = props;
  const db = global.dbConnection;

  try {
    // Convert branch name to uppercase for consistency
    const upperBranchName = branchname.toUpperCase();

    // Check if the new branch name is already in use
    const nameExists = await db("app_location")
      .where({
        locationname: upperBranchName,
        tenantid: tenantid,
      })
      .andWhereNot({
        applocationid: branchid,
      })
      .first();

    if (nameExists) {
      return {
        code: 200,
        status: false,
        message: "Branch name already in use",
      };
    }

    // Check if the branch exists
    const checkExist = await db("app_location")
      .where({
        tenantid: tenantid,
        applocationid: branchid,
      })
      .first();

    if (!checkExist) {
      return {
        code: 200,
        status: false,
        message: "Branch does not exist",
      };
    }

    // Update the branch if all checks pass
    const result = await db.transaction(async (trx) => {
      try {
        const response = await trx("app_location")
          .update({
            locationname: upperBranchName,
            locationimage: branchimage,
            locationaddress: branchaddress,
            longitude: longitude,
            latitude: latitude,
            gstno: gstno,
          })
          .where({
            tenantid: tenantid,
            applocationid: branchid,
          });

        if (response > 0) {
          return {
            code: 201,
            status: true,
            message: "Branch edited successfully",
          };
        } else {
          await trx.rollback();
          return {
            code: 200,
            status: false,
            message: "Failed to edit branch",
          };
        }
      } catch (updateError) {
        await trx.rollback();
        throw updateError;
      }
    });

    return result;
  } catch (err) {
    console.error("Error editing branch:", err);
    return {
      code: 500,
      status: false,
      message: "Failed to edit branch",
    };
  }
};

module.exports.getBranch = async (props) => {
  const { tenantid, key, branchid } = props;
  const db = global.dbConnection;

  try {
    const result = await db.transaction(async (trx) => {
      let query = trx("app_location")
        .select(
          "applocationid",
          "locationname",
          "locationimage",
          "locationaddress",
          "gstno",
          "latitude",
          "longitude",
          "tenantid",
          "status"
        )
        .orderBy("applocationid", "DESC")
        .where({ tenantid });

      switch (key) {
        case 1:
          query = query.where({ status: 1 });
          break;
        case 2:
          query = query.where({ status: 2 });
          break;
        default:
          break;
      }

      if (branchid) {
        query = query.where({ applocationid: branchid });
      }

      const response = await query;

      if (!_.isEmpty(response)) {
        return {
          code: 200,
          status: true,
          message: "Successfully fetched branches data",
          response,
        };
      } else {
        return {
          code: 200,
          status: false,
          message: "No branches data",
          response: [],
        };
      }
    });

    return result;
  } catch (err) {
    console.log(err);
    return {
      code: 500,
      status: false,
      message: "Failed to fetch branches data",
      response: [],
    };
  }
};

module.exports.updateBranchStatus = async (props) => {
  const { tenantid, branchid, key } = props;
  const db = global.dbConnection;
  try {
    const checkBranchExist = await db("app_location").where({
      applocationid: branchid,
      tenantid: tenantid,
    });

    if (_.isEmpty(checkBranchExist)) {
      return {
        code: 200,
        status: false,
        message: "This branch not exist",
      };
    }
    const result = db.transaction(async (trx) => {
      switch (key) {
        case 1:
          const checkInactive = await trx("app_location")
            .where({
              status: 2,
            })
            .where({
              applocationid: branchid,
              tenantid: tenantid,
            });

          if (_.isEmpty(checkInactive)) {
            return {
              code: 200,
              status: false,
              message: "Already this branch active",
            };
          }

          if (!_.isEmpty(checkInactive)) {
            const active = await trx("app_location")
              .update({
                status: 1,
              })
              .where({
                applocationid: branchid,
                tenantid: tenantid,
              });
            if (active > 0) {
              return {
                code: 200,
                status: true,
                message: "Branch active successful",
              };
            } else {
              return {
                code: 200,
                status: false,
                message: "Failed to branch active",
              };
            }
          }
          break;

        case 2:
          const checkactive = await trx("app_location")
            .where({
              status: 1,
            })
            .where({
              applocationid: branchid,
              tenantid: tenantid,
            });

          if (_.isEmpty(checkactive)) {
            return {
              code: 200,
              status: false,
              message: "Already this branch inactive",
            };
          }

          if (!_.isEmpty(checkactive)) {
            const inactive = await trx("app_location")
              .update({
                status: 2,
              })
              .where({
                applocationid: branchid,
                tenantid: tenantid,
              });
            if (inactive > 0) {
              return {
                code: 200,
                status: true,
                message: "Branch inactive successful",
              };
            } else {
              return {
                code: 200,
                status: false,
                message: "Failed to branch inactive",
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
      message: "Failed to branch inactive",
    };
  }
};



