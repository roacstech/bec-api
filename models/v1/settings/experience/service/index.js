const _ = require("lodash");


module.exports.addExperience = async (props) => {
  const { tenantid, experiencename, experienceimage } = props;
  const db = global.dbConnection;
  const upperexperiencename = experiencename.toUpperCase();
  try {
    const checkExist = await db("experience").where({
      experiencename: upperexperiencename,
      tenantid: tenantid,
    });
    if (!_.isEmpty(checkExist)) {
      return {
        code: 200,
        status: false,
        message: "Already experience name exist",
      };
    }
    const result = db.transaction(async (trx) => {
      const add = await trx("experience").insert({
        experiencename: upperexperiencename,
        experienceimage: experienceimage,
        tenantid: tenantid,
      });
      if (add) {
        return {
          code: 201,
          status: true,
          message: "Experience added successful",
        };
      } else {
        await trx.rollback();
        return {
          code: 200,
          status: false,
          message: "Failed to add experience",
        };
      }
    });
    return result;
  } catch (err) {
    console.log(err);
    await db.rollback();
    return { code: 200, status: false, message: "Failed to add experience" };
  }
};

module.exports.editExperience = async (props) => {
  const { tenantid, experienceid, experiencename, experienceimage } = props;
  const db = global.dbConnection;
  const upperexperiencename = experiencename.toUpperCase();

  try {
    // Check if the experience to be edited exists
    const checkExist = await db("experience").where({
      experienceid: experienceid,
      tenantid: tenantid,
    });

    if (_.isEmpty(checkExist)) {
      return { code: 200, status: false, message: "Experience does not exist" };
    }

    // Check if the new experience name already exists for the given tenant
    const nameExists = await db("experience")
      .where({
        experiencename: upperexperiencename,
        tenantid: tenantid,
      })
      .andWhereNot({
        experienceid: experienceid,
      });

    if (!_.isEmpty(nameExists)) {
      return {
        code: 200,
        status: false,
        message: "Experience name already in use",
      };
    }

    // Proceed with updating the experience
    const result = await db.transaction(async (trx) => {
      try {
        await trx("experience")
          .update({
            experiencename: upperexperiencename,
            experienceimage: experienceimage,
          })
          .where({
            tenantid: tenantid,
            experienceid: experienceid,
          });

        return {
          code: 200,
          status: true,
          message: "Experience edited successfully",
        };
      } catch (updateError) {
        await trx.rollback();
        throw updateError;
      }
    });

    return result;
  } catch (err) {
    console.log(err);
    return { code: 500, status: false, message: "Failed to edit experience" };
  }
};

module.exports.getExperience = async (props) => {
  const { key, experienceid, tenantid } = props;
  const db = global.dbConnection;

  try {
    const result = await db.transaction(async (trx) => {
      let query = trx("experience")
        .select("experienceid", "experiencename", "experienceimage", "status")
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

      if (experienceid) {
        query = query.where({ experienceid: experienceid });
      }

      const response = await query;

      if (!_.isEmpty(response)) {
        return {
          code: 200,
          status: true,
          message: "Experience data fetched successfully",
          response: response,
        };
      } else {
        return {
          code: 200,
          status: true,
          message: "No Experience data fetched",
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
      message: "Failed to experience source data",
      response: [],
    };
  }
};

module.exports.updateExperienceStatus = async (props) => {
  const { tenantid, experienceid, key } = props;
  const db = global.dbConnection;
  try {
    const checkExist = await db("experience").where({
      experienceid: experienceid,
      tenantid: tenantid,
    });

    if (_.isEmpty(checkExist)) {
      return { code: 200, status: false, message: "This experience not exist" };
    }
    const result = db.transaction(async (trx) => {
      switch (key) {
        case 1:
          const checkInactive = await trx("experience")
            .where({
              status: 2,
            })
            .where({
              experienceid: experienceid,
              tenantid: tenantid,
            });

          if (_.isEmpty(checkInactive)) {
            return {
              code: 200,
              status: false,
              message: "Already this experience available",
            };
          }

          if (!_.isEmpty(checkInactive)) {
            const active = await trx("experience")
              .update({
                status: 1,
              })
              .where({
                experienceid: experienceid,
                tenantid: tenantid,
              });
            if (active > 0) {
              return {
                code: 200,
                status: true,
                message: "Experience available successful",
              };
            } else {
              return {
                code: 200,
                status: false,
                message: "Failed to experience available",
              };
            }
          }
          break;

        case 2:
          const checkactive = await trx("experience")
            .where({
              status: 1,
            })
            .where({
              experienceid: experienceid,
              tenantid: tenantid,
            });

          if (_.isEmpty(checkactive)) {
            return {
              code: 200,
              status: false,
              message: "Already this experience unavailable",
            };
          }

          if (!_.isEmpty(checkactive)) {
            const inactive = await trx("experience")
              .update({
                status: 2,
              })
              .where({
                experienceid: experienceid,
                tenantid: tenantid,
              });
            if (inactive > 0) {
              return {
                code: 200,
                status: true,
                message: "Experience unavailable successful",
              };
            } else {
              return {
                code: 200,
                status: false,
                message: "Failed to experience unavailable",
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
      message: "Failed to experience unavailable",
    };
  }
};    



