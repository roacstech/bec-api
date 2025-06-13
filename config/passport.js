// // passport.js
// const passport = require("passport");
// const GoogleStrategy = require("passport-google-oauth20").Strategy;
// const dbConnection = global.dbConnection;

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID, // Ensure this matches the client ID in Google Cloud Console
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Ensure this matches the client secret in Google Cloud Console
//       callbackURL: "http://localhost:6178/auth/google/callback", // Ensure this matches the authorized redirect URI
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         // Check if the user already exists in the database
//         let user = await dbConnection("users")
//           .where({ googleId: profile.id })
//           .first();
//         if (!user) {
//           // If the user doesn't exist, create a new user
//           [user] = await dbConnection("users")
//             .insert({
//               googleId: profile.id,
//               email: profile.emails[0].value,
//               name: profile.displayName,
//             })
//             .returning("*");
//         }
//         done(null, user);
//       } catch (error) {
//         done(error, null);
//       }
//     }
//   )
// );

// module.exports = passport;

const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
require("dotenv").config(); // Ensure environment variables are loaded

const dbConnection = global.dbConnection;

// Load private key for signing JWT
const privateKeyPath = path.join(__dirname, "private.key");
const publicKeyPath = path.join(__dirname, "public.key");

let privateKey, publicKey;

try {
  privateKey = fs.readFileSync(privateKeyPath, "utf8");
} catch (error) {
  console.error("❌ Private key file is missing! JWT signing will fail.");
  process.exit(1);
}

try {
  publicKey = fs.readFileSync(publicKeyPath, "utf8");
} catch (error) {
  console.error("❌ Public key file is missing! JWT verification will fail.");
  process.exit(1);
}

// ✅ Function to generate JWT using PRIVATE key
const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, privateKey, {
    algorithm: "RS256",
    expiresIn: "1h",
  });
};

// ✅ Function to verify JWT using PUBLIC key
const verifyToken = (token) => {
  try {
    return jwt.verify(token, publicKey, { algorithms: ["RS256"] });
  } catch (error) {
    console.error("❌ Invalid Token:", error.message);
    return null;
  }
};

// ✅ Setup Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        "http://localhost:6178/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await dbConnection("app_users")
          .where({ googleId: profile.id })
          .first();

        if (!user) {
          [user] = await dbConnection("app_users")
            .insert({
              googleId: profile.id,
              email: profile.emails[0].value,
              name: profile.displayName,
              profilePic: profile.photos?.[0]?.value || null,
            })
            .returning("*");
        }

        // Generate JWT token
        const token = generateToken(user);
        done(null, { user, token });
      } catch (error) {
        console.error("❌ Authentication error:", error);
        done(error, null);
      }
    }
  )
);

module.exports = { passport, generateToken, verifyToken };

// const passport = require("passport");
// const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
// const jwt = require("jsonwebtoken");
// const dbConnection = global.dbConnection;
// const { createUser } = require("../services/userService");
// const { config } = require("./utils");

// const serverCallBackUrl = config.get("oAuth.serverCallBackUrl");

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: serverCallBackUrl || "http://localhost:6178/auth/google/callback",
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         // Check if the user already exists in the database
//         let user = await dbConnection("app_users")
//           .where({ email: profile.emails[0].value })
//           .first();

//         if (!user) {
//           // Create a new user if they don't exist
//           user = await createUser({
//             googleId: profile.id,
//             email: profile.emails[0].value,
//             firstName: profile.name.givenName,
//             lastName: profile.name.familyName,
//             profilePic: profile.photos[0]?.value,
//           });
//         }

//         console.log("User Before Callback:", user);
//         done(null, user);
//       } catch (error) {
//         done(error, null);
//       }
//     }
//   )
// );

// // Serialize user into the session
// passport.serializeUser((user, done) => {
//   done(null, user.appUserId);
// });

// // Deserialize user from the session
// passport.deserializeUser(async (id, done) => {
//   try {
//     const user = await dbConnection("app_users").where({ appUserId: id }).first();
//     done(null, user);
//   } catch (error) {
//     done(error, null);
//   }
// });

// // Generate JWT token using RS256
// const fs = require("fs");
// const privateKey = fs.readFileSync("private.key", "utf8");

// const generateToken = (user) => {
//   return jwt.sign(
//     { id: user.appUserId, email: user.email },
//     privateKey,
//     {
//       algorithm: "RS256", // Use RS256 instead of HS256
//       expiresIn: "1h",
//     }
//   );
// };

// module.exports = { passport, generateToken };
