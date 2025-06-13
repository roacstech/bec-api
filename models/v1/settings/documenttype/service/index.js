const _ = require("lodash");

//document type
module.exports.addDocumentType = async (props) => {
  const { tenantid, typename, typeimage } = props;
  const db = global.dbConnection;
  const uppertypename = typename.toUpperCase();
  try {
    const checkTypeNameExist = await db("app_documenttype").where({
      typename: uppertypename,
      tenantid: tenantid,
    });

    if (!_.isEmpty(checkTypeNameExist)) {
      return {
        code: 200,
        status: false,
        message: "Already document type name exist",
      };
    }

    const result = db.transaction(async (trx) => {
      const response = await trx("app_documenttype").insert({
        typename: uppertypename,
        typeimage: typeimage,
        tenantid: tenantid,
      });
      if (response > 0) {
        return {
          code: 201,
          status: true,
          message: "Document type added successful",
        };
      } else {
        return {
          code: 200,
          status: false,
          message: "Failed to add document type",
        };
      }
    });
    return result;
  } catch (err) {
    console.log(err);
    return { code: 200, status: false, message: "Failed to add document type" };
  }
};

module.exports.editDocumentType = async (props) => {
  const { tenantid, documenttypeid, typename, typeimage } = props;
  const db = global.dbConnection;
  const uppertypename = typename.toUpperCase();
  try {
    const checkTypeNameExist = await db("app_documenttype").where({
      tenantid: tenantid,
      documenttypeid: documenttypeid,
    });

    if (_.isEmpty(checkTypeNameExist)) {
      return {
        code: 200,
        status: false,
        message: "Document type not exist",
      };
    }

    const result = db.transaction(async (trx) => {
      const response = await trx("app_documenttype")
        .update({
          typename: uppertypename,
          typeimage: typeimage,
        })
        .where({
          documenttypeid: documenttypeid,
          tenantid: tenantid,
        });
      if (response > 0) {
        return {
          code: 201,
          status: true,
          message: "Document type edited successful",
        };
      } else {
        return {
          code: 200,
          status: false,
          message: "Failed to edit document type",
        };
      }
    });
    return result;
  } catch (err) {
    console.log(err);
    return {
      code: 200,
      status: false,
      message: "Failed to edit document type",
    };
  }
};

module.exports.getDocumentType = async (props) => {
  const { tenantid, key, documenttypeid } = props;
  const db = global.dbConnection;

  try {
    const result = db.transaction(async (trx) => {
      let query = trx("app_documenttype").select(
        "documenttypeid",
        "typename",
        "typeimage",
        "status"
      );

      // Base condition for all queries
      query = query.where({
        tenantid: tenantid,
      });

      // Apply key-based logic
      switch (key) {
        case 1: // Active document types
          query = query.where({ status: 1 });
          break;
        case 2: // Inactive document types
          query = query.where({ status: 2 });
          break;
        default: // All document types
          break;
      }

      // Apply documenttypeid filter if provided
      if (documenttypeid) {
        query = query.where({ documenttypeid: documenttypeid });
      }

      const response = await query;

      if (!_.isEmpty(response)) {
        return {
          code: 200,
          status: true,
          message: "Successfully fetched document types",
          response: response,
        };
      } else {
        return {
          code: 200,
          status: true,
          message: "No document types found",
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
      message: "Failed to fetch document types",
      response: [],
    };
  }
};

module.exports.updateDocumentTypeStatus = async (props) => {
  const { tenantid, documenttypeid, key } = props;
  const db = global.dbConnection;
  try {
    const checkDocumentTypeExist = await db("app_documenttype").where({
      documenttypeid: documenttypeid,
      tenantid: tenantid,
    });

    if (_.isEmpty(checkDocumentTypeExist)) {
      return {
        code: 200,
        status: false,
        message: "This document type not exist",
      };
    }
    const result = db.transaction(async (trx) => {
      switch (key) {
        case 1:
          const checkInactive = await trx("app_documenttype")
            .where({
              status: 2,
            })
            .where({
              documenttypeid: documenttypeid,
              tenantid: tenantid,
            });

          if (_.isEmpty(checkInactive)) {
            return {
              code: 200,
              status: false,
              message: "Already this document type available",
            };
          }

          if (!_.isEmpty(checkInactive)) {
            const active = await trx("app_documenttype")
              .update({
                status: 1,
              })
              .where({
                documenttypeid: documenttypeid,
                tenantid: tenantid,
              });
            if (active > 0) {
              return {
                code: 200,
                status: true,
                message: "Document type available successful",
              };
            } else {
              return {
                code: 200,
                status: false,
                message: "Failed to document type available",
              };
            }
          }
          break;

        case 2:
          const checkactive = await trx("app_documenttype")
            .where({
              status: 1,
            })
            .where({
              documenttypeid: documenttypeid,
              tenantid: tenantid,
            });

          if (_.isEmpty(checkactive)) {
            return {
              code: 200,
              status: false,
              message: "Already this document type unavailable",
            };
          }

          if (!_.isEmpty(checkactive)) {
            const inactive = await trx("app_documenttype")
              .update({
                status: 2,
              })
              .where({
                documenttypeid: documenttypeid,
                tenantid: tenantid,
              });
            if (inactive > 0) {
              return {
                code: 200,
                status: true,
                message: "Document type unavailable successful",
              };
            } else {
              return {
                code: 200,
                status: false,
                message: "Failed to document type unavailable",
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
      message: "Failed to document type unavailable",
    };
  }
};



