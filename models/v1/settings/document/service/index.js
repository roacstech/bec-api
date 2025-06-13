const _ = require("lodash");

//document
module.exports.addDocument = async (props) => {
  const { tenantid, documentname, documenttypeid, documentimage } = props;
  const db = global.dbConnection;
  const upperdocumentname = documentname.toUpperCase();
  try {
    const checkDocumentNameExist = await db("app_document").where({
      documentname: upperdocumentname,
      tenantid: tenantid,
    });

    if (!_.isEmpty(checkDocumentNameExist)) {
      return {
        code: 200,
        status: false,
        message: "Already document name exist",
      };
    }

    const result = db.transaction(async (trx) => {
      const response = await trx("app_document").insert({
        documentname: upperdocumentname,
        documenttypeid: documenttypeid,
        documentimage: documentimage,
        tenantid: tenantid,
      });
      if (response > 0) {
        return {
          code: 201,
          status: true,
          message: "Document added successful",
        };
      } else {
        return {
          code: 200,
          status: false,
          message: "Failed to add document",
        };
      }
    });
    return result;
  } catch (err) {
    console.log(err);
    return { code: 200, status: false, message: "Failed to add document" };
  }
};

module.exports.editDocument = async (props) => {
  const { tenantid, documentid, documenttypeid, documentname, documentimage } =
    props;
  const db = global.dbConnection;
  const upperdocumentname = documentname.toUpperCase();
  try {
    const checkDocumentNameExist = await db("app_document").where({
      tenantid: tenantid,
      documentid: documentid,
    });

    if (_.isEmpty(checkDocumentNameExist)) {
      return {
        code: 200,
        status: false,
        message: "Document not exist",
      };
    }

    const result = db.transaction(async (trx) => {
      const response = await trx("app_document")
        .update({
          documentname: upperdocumentname,
          documenttypeid: documenttypeid,
          documentimage: documentimage,
        })
        .where({
          documenttypeid: documenttypeid,
          tenantid: tenantid,
        });
      if (response > 0) {
        return {
          code: 201,
          status: true,
          message: "Document edited successful",
        };
      } else {
        return {
          code: 200,
          status: false,
          message: "Failed to edit document",
        };
      }
    });
    return result;
  } catch (err) {
    console.log(err);
    return {
      code: 200,
      status: false,
      message: "Failed to edit document",
    };
  }
};

module.exports.getDocument = async (props) => {
  const { tenantid, key, documenttypeid, documentid } = props;
  const db = global.dbConnection;

  try {
    const result = db.transaction(async (trx) => {
      let query = trx("app_document")
        .leftJoin(
          "app_documenttype",
          "app_documenttype.documenttypeid",
          "app_document.documenttypeid"
        )
        .select(
          "app_document.documentid",
          "app_document.documentname",
          "app_document.documentimage",
          "app_document.documenttypeid",
          "app_documenttype.typename",
          "app_documenttype.typeimage",
          "app_document.status"
        )
        .orderBy("app_document.documentid", "DESC")
        .where({
          "app_document.tenantid": tenantid,
          "app_documenttype.tenantid": tenantid
        });

      // Base condition for all queries
      query = query.where({
        "app_document.tenantid": tenantid,
        "app_documenttype.tenantid": tenantid,
      });

      // Apply key-based logic
      switch (key) {
        case 1: // Active document types
          query = query.where({
            "app_document.status": 1,
            "app_documenttype.status": 1,
          });
          break;
        case 2: // Inactive document types
          query = query.where({
            "app_document.status": 2,
            "app_documenttype.status": 2,
          });
          break;
        default: // All document types
          break;
      }

      // Apply documentid filter if provided
      if (documentid) {
        query = query.where({
          "app_document.documentid": documentid,
        });
      }

      if (documenttypeid) {
        query = query.where({
          "app_document.documenttypeid": documenttypeid,
        });
      }

      if (documentid && documenttypeid) {
        query = query.where({
          "app_document.documentid": documentid,
          "app_document.documenttypeid": documenttypeid,
        });
      }

      const response = await query;

      if (!_.isEmpty(response)) {
        return {
          code: 200,
          status: true,
          message: "Successfully fetched document",
          response: response,
        };
      } else {
        return {
          code: 200,
          status: true,
          message: "No document found",
          response: [],
        };
      }
    });
    return result;
  } catch (err) {
    console.log(err);
    return {
      code: 200,
      status: false,
      message: "Failed to fetch document",
      response: [],
    };
  }
};

module.exports.updateDocumentStatus = async (props) => {
  const { tenantid, documentid, key } = props;
  const db = global.dbConnection;
  try {
    const checkDocumentExist = await db("app_document").where({
      documentid: documentid,
      tenantid: tenantid,
    });

    if (_.isEmpty(checkDocumentExist)) {
      return {
        code: 200,
        status: false,
        message: "This document not exist",
      };
    }
    const result = db.transaction(async (trx) => {
      switch (key) {
        case 1:
          const checkInactive = await trx("app_document")
            .where({
              status: 2,
            })
            .where({
              documentid: documentid,
              tenantid: tenantid,
            });

          if (_.isEmpty(checkInactive)) {
            return {
              code: 200,
              status: false,
              message: "Already this document available",
            };
          }

          if (!_.isEmpty(checkInactive)) {
            const active = await trx("app_document")
              .update({
                status: 1,
              })
              .where({
                documentid: documentid,
                tenantid: tenantid,
              });
            if (active > 0) {
              return {
                code: 200,
                status: true,
                message: "Document available successful",
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
          const checkactive = await trx("app_document")
            .where({
              status: 1,
            })
            .where({
              documentid: documentid,
              tenantid: tenantid,
            });

          if (_.isEmpty(checkactive)) {
            return {
              code: 200,
              status: false,
              message: "Already this document unavailable",
            };
          }

          if (!_.isEmpty(checkactive)) {
            const inactive = await trx("app_document")
              .update({
                status: 2,
              })
              .where({
                documentid: documentid,
                tenantid: tenantid,
              });
            if (inactive > 0) {
              return {
                code: 200,
                status: true,
                message: "Document unavailable successful",
              };
            } else {
              return {
                code: 200,
                status: false,
                message: "Failed to document unavailable",
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
      message: "Failed to document unavailable",
    };
  }
};



