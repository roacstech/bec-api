const _ = require("lodash");

module.exports.createCheckList = async (props) => {
  const { checklistname, universityid, checklist } = props;
  const db = global.dbConnection;

  try {
    const upperChecklistName = checklistname.toLowerCase();

    // Check if the checklist already exists for the given university
    const checkExistCheckList = await db("check_list")
      .where({
        checklistname: upperChecklistName,
        universityid,
      })
      .first();

    if (checkExistCheckList) {
      return {
        code: 200,
        status: false,
        message: "Checklist already exists for this university",
      };
    }

    // Start transaction
    const result = await db.transaction(async (trx) => {
      // Insert the main checklist record
      const [checklistId] = await trx("check_list").insert({
        checklistname: upperChecklistName,
        universityid, // Include universityid here
        checkliststatus: 1, // Default checklist status
      });

      if (!checklistId) {
        throw new Error("Failed to insert checklist");
      }

      // Declare checklistItems as an empty array by default
      let checklistItems = [];

      // Insert checklist items if any
      if (checklist.length > 0) {
        checklistItems = checklist.map(({ documenttypeid, documentid }) => ({
          checklistid: checklistId, // Use the checklistId from the main checklist insert
          documentid, // Document ID from each checklist item
          documenttypeid, // Document type from each checklist item
          checkliststatus: 1, // Default status for each checklist item
        }));

        // Insert all checklist items into the `check_list_items` table
        await trx("check_list_items").insert(checklistItems);
      }

      return {
        code: 201,
        status: true,
        message: "Checklist created successfully with items",
        data: {
          checklistId,
          checklistItems, // Return checklistItems even if it's an empty array
        },
      };
    });

    return result;
  } catch (err) {
    console.error("Error creating checklist:", err.message || err);

    return {
      code: 500,
      status: false,
      message: "An error occurred while creating the checklist",
    };
  }
};

module.exports.getchecklist = async () => {
  const db = global.dbConnection;

  try {
    // Fetch checklist data along with documenttypeid and documentid
    const checkListData = await db("check_list as c")
      .leftJoin("check_list_items as ci", "c.checklistid", "ci.checklistid")
      .select(
        "c.checklistid",
        "c.checklistname",
        "c.universityid",
        "c.checkliststatus",
        "ci.documentid",
        "ci.documenttypeid"
      )
      .orderBy("c.checklistid");

    if (checkListData.length === 0) {
      return {
        code: 200,
        status: false,
        message: "Checklist not found",
      };
    }

    // Group the documents by checklistid
    const groupedChecklists = checkListData.reduce((acc, current) => {
      const {
        checklistid,
        checklistname,
        universityid,
        checkliststatus,
        documentid,
        documenttypeid,
      } = current;

      // Check if the checklist already exists in the accumulator
      let checklist = acc.find((c) => c.checklistid === checklistid);

      // If not, create a new checklist entry
      if (!checklist) {
        checklist = {
          checklistid,
          checklistname,
          universityid,
          checkliststatus,
          documents: [],
        };
        acc.push(checklist);
      }

      // Add the document data to the checklist
      if (documentid && documenttypeid) {
        checklist.documents.push({ documentid, documenttypeid });
      }

      return acc;
    }, []);

    return {
      code: 200,
      status: true,
      message: "Checklist retrieved successfully",
      response: groupedChecklists, // Return grouped checklists with their documents
    };
  } catch (err) {
    console.error("Error fetching all checklist items:", err);
    return {
      code: 500,
      status: false,
      message: "Failed to retrieve checklist items",
      error: err.message,
    };
  }
};

module.exports.editCheckList = async (props) => {
  const { checklistid, checklistname, universityid, checklist } = props;
  const db = global.dbConnection;

  try {
    const upperChecklistName = checklistname.toLowerCase();

    // Check if the checklist exists
    const existingCheckList = await db("check_list")
      .where({
        checklistid,
        universityid,
      })
      .first();

    if (!existingCheckList) {
      return {
        code: 404,
        status: false,
        message: "Checklist not found for the specified university",
      };
    }

    // Validate checklist items - ensure documenttypeid and documentid are present
    if (checklist.length > 0) {
      for (let item of checklist) {
        if (!item.documenttypeid || !item.documentid) {
          return {
            code: 400,
            status: false,
            message:
              "Document Type ID and Document ID are required for each checklist item",
          };
        }
      }
    }

    // Start transaction
    const result = await db.transaction(async (trx) => {
      // Update the main checklist record
      await trx("check_list")
        .where({
          checklistid,
          universityid,
        })
        .update({
          checklistname: upperChecklistName,
          checkliststatus: 1, // You can modify this depending on the logic
        });

      // Declare checklistItems as an empty array by default
      let checklistItems = [];

      // Insert checklist items if any
      if (checklist.length > 0) {
        // Delete old checklist items before inserting the new ones
        await trx("check_list_items").where("checklistid", checklistid).del();

        checklistItems = checklist.map(({ documenttypeid, documentid }) => ({
          checklistid, // Use the checklistId from the main checklist update
          documentid, // Document ID from each checklist item
          documenttypeid, // Document type from each checklist item
          checkliststatus: 1, // Default status for each checklist item
        }));

        // Insert all checklist items into the `check_list_items` table
        await trx("check_list_items").insert(checklistItems);
      }

      // Fetch the updated checklist to return it
      const updatedCheckList = await trx("check_list")
        .where({ checklistid })
        .first();

      return {
        code: 200,
        status: true,
        message: "Checklist updated successfully with items",
        data: {
          checklistid,
          checklistname: updatedCheckList.checklistname, // Return updated checklist name
          checklistItems, // Return updated checklistItems
        },
      };
    });

    return result;
  } catch (err) {
    console.error("Error editing checklist:", err.message || err);

    return {
      code: 500,
      status: false,
      message: "An error occurred while updating the checklist",
    };
  }
};

module.exports.updateChecklistStatus = async (props) => {
  const { checklistid, key } = props;
  const db = global.dbConnection;

  try {
    // Check if the checklist exists
    const checkListExist = await db("check_list").where({
      checklistid: checklistid,
    });

    if (_.isEmpty(checkListExist)) {
      return {
        code: 200,
        status: false,
        message: "This checklist does not exist",
      };
    }

    const result = await db.transaction(async (trx) => {
      switch (key) {
        case 1: // Make the checklist active
          const checkInactive = await trx("check_list")
            .where({ checkliststatus: 2 })
            .where({ checklistid });

          if (_.isEmpty(checkInactive)) {
            return {
              code: 200,
              status: false,
              message: "This checklist is already active",
            };
          }

          const activateChecklist = await trx("check_list")
            .update({ checkliststatus: 1 })
            .where({ checklistid });

          if (activateChecklist > 0) {
            return {
              code: 200,
              status: true,
              message: "Checklist activated successfully",
            };
          } else {
            return {
              code: 200,
              status: false,
              message: "Failed to activate checklist",
            };
          }
          break;

        case 2: // Make the checklist inactive
          const checkActive = await trx("check_list")
            .where({ checkliststatus: 1 })
            .where({ checklistid });

          if (_.isEmpty(checkActive)) {
            return {
              code: 200,
              status: false,
              message: "This checklist is already inactive",
            };
          }

          const deactivateChecklist = await trx("check_list")
            .update({ checkliststatus: 2 })
            .where({ checklistid });

          if (deactivateChecklist > 0) {
            return {
              code: 200,
              status: true,
              message: "Checklist deactivated successfully",
            };
          } else {
            return {
              code: 200,
              status: false,
              message: "Failed to deactivate checklist",
            };
          }
          break;

        default:
          return {
            code: 400,
            status: false,
            message: "Invalid status key",
          };
      }
    });

    return result;
  } catch (err) {
    console.log("Error updating checklist status:", err);
    return {
      code: 500,
      status: false,
      message: "Failed to update checklist status",
    };
  }
};
