const {
  register,
  getAll,
  updateUser,
  gettt,
  getOne,
  verifyOtp,
} = require("../controllers/userController.js");
const authToken = require("../middlewares/verifyToken.js");
const  validateUser = require("../middlewares/validators.js");
const express = require("express");
const router = express.Router();

router.route("/user").post(validateUser,register).get(getAll)
router.post("/user/verify-otp",authToken, verifyOtp);
router.route("/user/:id").put(updateUser).get(getOne);
router.route("/userss").get(gettt);

module.exports = router;
