const _ = require("lodash");

module.exports.createReferralType = async (props) => {
  const { referraltypename } = props; // Get referral type name

  const db = global.dbConnection;

  try {
    // Check if referral type already exists
    const existingReferral = await db("referral_types")
      .where({ referraltypename })
      .first();

    if (existingReferral) {
      return {
        code: 200,
        status: false,
        message: "Referral type already exists",
      };
    }

    // Insert new record into `referral_types` table
    const [insertedId] = await db("referral_types").insert({
      referraltypename,
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

module.exports.getReferralTypes = async () => {
  try {
    const db = global.dbConnection;

    // Fetch all referral types from the `referral_types` table
    const referralTypesData = await db("referral_types").select("*");

    if (referralTypesData.length === 0) {
      return {
        code: 404,
        status: false,
        message: "No referral types found",
      };
    }

    return {
      code: 200,
      status: true,
      message: "Referral Type Fetched Successfully",
      response: referralTypesData,
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

module.exports.editReferralType = async (props) => {
  const { referraltypename, referralTypeId } = props;

  const db = global.dbConnection;

  try {
    // Check if referral type exists
    const existingReferral = await db("referral_types")
      .where({ referralTypeId })
      .first();

    if (!existingReferral) {
      return {
        code: 404,
        status: false,
        message: "Referral Type not found",
      };
    }

    // Update the referral type record
    await db("referral_types").where({ referralTypeId }).update({
      referraltypename,
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

module.exports.updateReferralTypeStatus = async (props) => {
  const { referralTypeId, key } = props;
  const db = global.dbConnection;

  try {
    // Check if the referral type exists
    const checkReferralExist = await db("referral_types")
      .where({ referralTypeId })
      .select("referralTypeStatus")
      .first();

    if (!checkReferralExist) {
      return { code: 200, status: false, message: "Referral type not found" };
    }

    const result = await db.transaction(async (trx) => {
      switch (key) {
        case 1: // Activate Referral Type
          if (checkReferralExist.referralTypeStatus === 1) {
            return {
              code: 200,
              status: false,
              message: "This referral type is already active",
            };
          }

          const activateReferral = await trx("referral_types")
            .update({ referralTypeStatus: 1 })
            .where({ referralTypeId });

          return activateReferral > 0
            ? {
                code: 200,
                status: true,
                message: "Referral type activated successfully",
              }
            : {
                code: 200,
                status: false,
                message: "Failed to activate referral type",
              };

        case 2: // Deactivate Referral Type
          if (checkReferralExist.referralTypeStatus === 2) {
            return {
              code: 200,
              status: false,
              message: "This referral type is already inactive",
            };
          }

          const deactivateReferral = await trx("referral_types")
            .update({ referralTypeStatus: 2 })
            .where({ referralTypeId });

          return deactivateReferral > 0
            ? {
                code: 200,
                status: true,
                message: "Referral type deactivated successfully",
              }
            : {
                code: 200,
                status: false,
                message: "Failed to deactivate referral type",
              };

        default:
          return { code: 400, status: false, message: "Invalid status key" };
      }
    });

    return result;
  } catch (err) {
    console.log("Error updating referral type status:", err);
    return {
      code: 500,
      status: false,
      message: "Failed to update referral type status",
    };
  }
};
