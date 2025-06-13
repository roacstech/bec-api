const db = require("../../../../utils/knexfile");
const _ = require("lodash");

module.exports.uploadFile = async (props) => {
  const { userid, fileurl, filetype, filename } = props;

  const db = global.dbConnection;

  try {
    const [fileId] = await db("files").insert({
      userid,
      fileurl,
      filetype,
      filename,
    });

    if (!fileId) {
      return {
        code: 500,
        status: false,
        message: "File upload failed.",
      };
    }

    return {
      code: 200,
      status: true,
      message: "File uploaded successfully.",
    };
  } catch (err) {
    console.error("Upload Error:", err);
    return {
      code: 500,
      status: false,
      message: "File upload failed due to a server error.",
    };
  }
};

module.exports.getFile = async (props) => {
  const { userid } = props;

  const db = global.dbConnection;

  try {
    const files = await db("files").where({ userid });

    if (_.isEmpty(files)) {
      return {
        code: 200,
        status: false,
        message: "No files found.",
        response: [],
      };
    }

    return {
      code: 200,
      status: true,
      message: "Files retrieved successfully.",
      response: files,
    };
  } catch (err) {
    console.error("Get File Error:", err);
    return {
      code: 500,
      status: false,
      message: "Failed to retrieve files due to a server error.",
    };
  }
};
