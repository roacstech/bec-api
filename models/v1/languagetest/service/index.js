const _ = require("lodash");

module.exports.createLanguageTest = async (props) => {
  const { languagetestname } = props; // Get referral type name

  const db = global.dbConnection;

  try {
    // Check if referral type already exists
    const existingReferral = await db("language_tests")
      .where({ languagetestname })
      .first();

    if (existingReferral) {
      return {
        code: 200,
        status: false,
        message: "Referral type already exists",
      };
    }

    // Insert new record into `language_tests` table
    const [insertedId] = await db("language_tests").insert({
      languagetestname,
    });

    if (insertedId == 0) {
      return {
        code: 200,
        status: false,
        message: "Referral type added failed",
      };
    }

    return {
      code: 201,
      status: true,
      message: "Referral type added successfully",
    };
  } catch (err) {
    console.error("Error inserting referral type:", err);
    return {
      code: 500,
      status: false,
      message: "Failed to insert referral type",
    };
  }
};

module.exports.getLanguageTests = async () => {
  try {
    const db = global.dbConnection;

    // Fetch all referral types from the `language_tests` table
    const languagetestsData = await db("language_tests").select("*");

    if (languagetestsData.length === 0) {
      return {
        code: 404,
        status: false,
        message: "No referral types found",
      };
    }

    return {
      code: 200,
      status: true,
      message: "Language test Fetched Successfully",
      response: languagetestsData,
    };
  } catch (err) {
    console.error("Error fetching referral types:", err);
    return {
      code: 500,
      status: false,
      message: "Server error",
    };
  }
};

module.exports.editLanguageTest = async (props) => {
  const { languagetestname, languagetestid } = props;

  const db = global.dbConnection;

  try {
    // Check if referral type exists
    const existingReferral = await db("language_tests")
      .where({ languagetestid })
      .first();

    if (!existingReferral) {
      return {
        code: 404,
        status: false,
        message: "Referral Type not found",
      };
    }

    // Update the referral type record
    await db("language_tests").where({ languagetestid }).update({
      languagetestname,
    });

    return {
      code: 200,
      status: true,
      message: "Referral Type updated successfully",
    };
  } catch (err) {
    console.error("Error updating referral type:", err);
    return {
      code: 500,
      status: false,
      message: "Failed to update referral type",
    };
  }
};

module.exports.updateLanguageTestStatus = async (props) => {
  const { languagetestid, key } = props;
  const db = global.dbConnection;

  try {
    const checkLanguageTestExist = await db("language_tests")
      .where({ languagetestid })
      .select("languagetestStatus")
      .first();

    if (!checkLanguageTestExist) {
      return { code: 200, status: false, message: "Language test not found" };
    }

    const result = await db.transaction(async (trx) => {
      switch (key) {
        case 1:
          if (checkLanguageTestExist.languagetestStatus === 1) {
            return {
              code: 200,
              status: false,
              message: "This language test is already active",
            };
          }

          const activateLanguageTest = await trx("language_tests")
            .update({ languagetestStatus: 1 })
            .where({ languagetestid });

          return activateLanguageTest > 0
            ? {
                code: 200,
                status: true,
                message: "Language test activated successfully",
              }
            : {
                code: 200,
                status: false,
                message: "Failed to activate language test",
              };

        case 2:
          if (checkLanguageTestExist.languagetestStatus === 2) {
            return {
              code: 200,
              status: false,
              message: "This language test is already inactive",
            };
          }

          const deactivateLanguageTest = await trx("language_tests")
            .update({ languagetestStatus: 2 })
            .where({ languagetestid });

          return deactivateLanguageTest > 0
            ? {
                code: 200,
                status: true,
                message: "Language test deactivated successfully",
              }
            : {
                code: 200,
                status: false,
                message: "Failed to deactivate language test",
              };

        default:
          return { code: 400, status: false, message: "Invalid status key" };
      }
    });

    return result;
  } catch (err) {
    console.log("Error updating language test status:", err);
    return {
      code: 500,
      status: false,
      message: "Failed to update language test status",
    };
  }
};
