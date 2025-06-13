const router = require("express").Router();
const controller = require("../controller/index");
// const verifyToken = require("../../../../middleware/auth")

const passport = require("passport");

// Initialize passport
router.use(passport.initialize());

router.post("/login", controller.login);

// router.post("/loginApi", controller.loginApi); 

router.post("/logout", controller.logout);

router.post("/registration", controller.registration);

router.post("/validateUserEmail", controller.validateUserEmail);

router.post("/validateUserOTP", controller.validateUserOTP);

router.post("/setNewPassword", controller.setNewPassword);

router.post("/getUserByID", controller.getUserByID);

router.post("/editUserProfile", controller.editUserProfile);

// Google OAuth2 Routes
router.get("/google", controller.googleLogin); // Initiate Google OAuth2 login (keep this as GET)
router.post("/google/callback", controller.googleCallback); // Handle Google OAuth2 callback (change to POST)

// router.get("/me", controller.me);
// router.get("/google", controller.googleAuth);
// router.get(
//   "/google/callback",
//   passport.authenticate("google", {
//     failureRedirect: "/login",
//     session: false,
//   }),
//   controller.googleAuthCallback
// );

module.exports = router;
