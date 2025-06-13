const _ = require("lodash");

//quantity type
module.exports.addQuantityType = async (props) => {
  const { tenantid, quantitytypename } = props;
  const db = global.dbConnection;
  try {
    const checkQuantityTypeNameExist = await db("quantitytype").where({
      quantitytypename: quantitytypename,
      tenantid: tenantid,
    });

    if (!_.isEmpty(checkQuantityTypeNameExist)) {
      return {
        code: 200,
        status: false,
        message: "Already quantity type name exist",
      };
    }

    const result = db.transaction(async (trx) => {
      const response = await trx("quantitytype").insert({
        quantitytypename: quantitytypename,
        tenantid: tenantid,
      });
      if (response > 0) {
        return {
          code: 201,
          status: true,
          message: "Quantity type added successful",
        };
      } else {
        return {
          code: 200,
          status: false,
          message: "Failed to add quantity type",
        };
      }
    });
    return result;
  } catch (err) {
    console.log(err);
    return { code: 200, status: false, message: "Failed to add quantity type" };
  }
};

module.exports.editQuantityType = async (props) => {
  const { tenantid, quantitytypeid, quantitytypename } = props;
  const db = global.dbConnection;
  try {
    const checkquantityTypeNameExist = await db("quantitytype").where({
      tenantid: tenantid,
      quantitytypeid: quantitytypeid,
    });

    if (_.isEmpty(checkquantityTypeNameExist)) {
      return {
        code: 200,
        status: false,
        message: "Quantity type not exist",
      };
    }

    const result = db.transaction(async (trx) => {
      const response = await trx("quantitytype")
        .update({
          quantitytypename: quantitytypename,
        })
        .where({
          quantitytypeid: quantitytypeid,
          tenantid: tenantid,
        });
      if (response > 0) {
        return {
          code: 201,
          status: true,
          message: "Quantity type edited successful",
        };
      } else {
        return {
          code: 200,
          status: false,
          message: "Failed to edit quantity type",
        };
      }
    });
    return result;
  } catch (err) {
    console.log(err);
    return {
      code: 200,
      status: false,
      message: "Failed to edit quantity type",
    };
  }
};

module.exports.getQuantityType = async (props) => {
  const { tenantid, key, quantitytypeid } = props;
  const db = global.dbConnection;

  try {
    const result = db.transaction(async (trx) => {
      let query = trx("quantitytype").select(
        "quantitytypeid",
        "quantitytypename",
        "quantitytypestatus"
      ).where({
        tenantid: tenantid,
      });

      switch (key) {
        case 1: // Active quantity types
          query = query.where({ quantitytypestatus: 1 });
          break;
        case 2: // Inactive quantity types
          query = query.where({ quantitytypestatus: 2 });
          break;
        default: // All quantity types
          break;
      }

      // Apply quantitytypeid filter if provided
      if (quantitytypeid) {
        query = query.where({ quantitytypeid: quantitytypeid });
      }

      const response = await query;

      if (!_.isEmpty(response)) {
        return {
          code: 200,
          status: true,
          message: "Successfully fetched quantity types",
          response: response,
        };
      } else {
        return {
          code: 200,
          status: true,
          message: "No quantity types found",
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
      message: "Failed to fetch quantity types",
      response: [],
    };
  }
};

module.exports.updateQuantityTypeStatus = async (props) => {
  const { tenantid, quantitytypeid, key } = props;
  const db = global.dbConnection;
  try {
    const checkQuantityTypeExist = await db("quantitytype").where({
      quantitytypeid: quantitytypeid,
      tenantid: tenantid,
    });

    if (_.isEmpty(checkQuantityTypeExist)) {
      return {
        code: 200,
        status: false,
        message: "This quantity type not exist",
      };
    }
    const result = db.transaction(async (trx) => {
      switch (key) {
        case 1:
          const checkInactive = await trx("quantitytype")
            .where({
              quantitytypestatus: 2,
            })
            .where({
              quantitytypeid: quantitytypeid,
              tenantid: tenantid,
            });

          if (_.isEmpty(checkInactive)) {
            return {
              code: 200,
              status: false,
              message: "Already this quantity type available",
            };
          }

          if (!_.isEmpty(checkInactive)) {
            const active = await trx("quantitytype")
              .update({
                quantitytypestatus: 1,
              })
              .where({
                quantitytypeid: quantitytypeid,
                tenantid: tenantid,
              });
            if (active > 0) {
              return {
                code: 200,
                status: true,
                message: "Quantity type available successful",
              };
            } else {
              return {
                code: 200,
                status: false,
                message: "Failed to quantity type available",
              };
            }
          }
          break;

        case 2:
          const checkactive = await trx("quantitytype")
            .where({
              quantitytypestatus: 1,
            })
            .where({
              quantitytypeid: quantitytypeid,
              tenantid: tenantid,
            });

          if (_.isEmpty(checkactive)) {
            return {
              code: 200,
              status: false,
              message: "Already this quantity type unavailable",
            };
          }

          if (!_.isEmpty(checkactive)) {
            const inactive = await trx("quantitytype")
              .update({
                quantitytypestatus: 2,
              })
              .where({
                quantitytypeid: quantitytypeid,
                tenantid: tenantid,
              });
            if (inactive > 0) {
              return {
                code: 200,
                status: true,
                message: "Quantity type unavailable successful",
              };
            } else {
              return {
                code: 200,
                status: false,
                message: "Failed to quantity type unavailable",
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
      message: "Failed to quantity type unavailable",
    };
  }
};



