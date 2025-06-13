const jwt = require("jsonwebtoken");

const verifyToken = async (req, res, next) => {
  const token = req.headers["auth"];
  try {
    if (!token) {
      return res.status(403).send("Access Denied!");
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    req.user = decoded;
  } catch (err) {
    console.log("error", err);
    console.log("access token", token);

    await deleteAccessToken(req);

    return res.status(401).send("Invalid Token");
  }
  return next();
};

module.exports = verifyToken;

const deleteAccessToken = async (req) => {
  const token = req.headers["auth"];
  const db = global.dbConnection;
  try {
    const result = await db.transaction(async (trx) => {
      const deleteToken = await trx("fcmtokens")
        .where({
          accesstoken: token,
        })
        .del();

      console.log(
        "access token against fcmtoken deleted successful",
        deleteToken
      );

      if (deleteToken === 0) {
        await trx.rollback();
        throw new Error("Failed to delete deleted");
      }

      return deleteToken;
    });
    return result;
  } catch (err) {
    console.log("delete Access Token Err", err);
  }
};
