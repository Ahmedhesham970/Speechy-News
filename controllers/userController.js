const User = require("../models/userModel.js");
const { sequelize } = require("../db.js");
const { op } = require("sequelize");
const signToken = require("../middlewares/tokenConfiguration");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const calculateAge = require("../utils/calculateAge.js");
const sendVerificationMail = require("../utils/emailVerification.js");
const generateOTP = require("../utils/OTP-Generator.js");
const Post = require("../models/postModel.js");
let now = new Date();
let hours = now.getHours();
let minutes = now.getMinutes();
let seconds = now.getSeconds();
const {
  success,
  created,
  badRequest,
  notFound,
  internalServerError,
} = require("../utils/statusCodes.js");
const { stack } = require("sequelize/lib/utils");
const { JsonWebTokenError } = require("jsonwebtoken");

/**
 * @desc    Register a new user
 * @route   POST /api/users/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  try {
    // 1. Destructure request body
    const { firstName, lastName, email, password, birthDate, role } = req.body;

    // 2. Check if user already exists
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      // Use 'return' to send response and exit function
      return res.status(badRequest.code).json({
        status: badRequest.message,
        message: "Email already in use",
      });
    }

    // 3. Hash the password
    const salt = await bcrypt.genSalt(8);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create new user instance (in memory)
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      birthDate,
      otp: generateOTP,
      otpDuration: `${hours + 0}:${minutes + 10}:${seconds}`,
      role: role ? "admin" : "user",
    });

    // 5. Send verification email (before saving user)
    try {
      await sendVerificationMail({ email: newUser.email });
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError.message);
      // MUST return here to prevent "Cannot set headers" error
      return res.status(internalServerError.code).json({
        status: internalServerError.message,
        error:
          "Failed to send verification email. Please try registering again.",
      });
    }
    await newUser.save();
    // 6. Sign JWT tokens
    const registeredUser = await signToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      otp: newUser.otp,
    });

    if (!registeredUser) {
      console.error("Token generation failed for user:", newUser.email);
      // Send a proper error response
      return res.status(internalServerError.code).json({
        status: internalServerError.message,
        error: "An unexpected error occurred. Please try again.",
      });
    }

    // 7. Save the new user to the database
    await newUser.save();
    // req.user = newUser;
    // 8. Respond with success
    res.status(created.code).json({
      status: created.message,
      msg: "User registered successfully. Please verify your email.",
      data: {
        newUser,
        token: registeredUser,
      },
    });
  } catch (error) {
    // 9. Catch all other errors (e.g., database connection, validation)
    console.error("User registration failed:", error.message);

    // Prepare a safe error response
    const errorResponse = {
      status: internalServerError.message,
      error: `An internal server error occurred ${error}`, // Generic message for client
    };

    // Only send detailed errors in development. Never leak stack traces in production!
    if (process.env.NODE_ENV === "development") {
      errorResponse.error = error.message;
      errorResponse.stack = error.stack;
    }

    res.status(internalServerError.code).json(errorResponse);
  }
});

/**
 * @desc    verify the OTP code
 * @route   POST /api/users/
 * @access  Public
 */

const verifyOtp = asyncHandler(async (req, res) => {
  const user = req.user;
  console.log("req.user:", req.user);

  //1. get the otp from req body
  const { otp } = req.body;
  const findUser = await User.findByPk(user.id);
  const otpDuration = findUser.otpDuration;
  const currentTime = `${hours}:${minutes}:${seconds}`;
  //check if the otp is expired
  if (currentTime > otpDuration) {
    return res.status(badRequest.code).json({
      status: badRequest.message,
      message: "OTP code has expired",
    });
  }
  //2. check if the otp is correct
  if (parseInt(otp) !== findUser.otp) {
    return res.status(badRequest.code).json({
      status: badRequest.message,
      message: "Invalid OTP code",
    });
  }
  await User.update(
    { isVerified: true, otp: null, otpDuration: null },
    { where: { id: user.id } }
  );

  return res.status(success.code).json({
    status: success.message,
    message: "Email verified successfully",
  });
});

// const login = asyncHandler(async (req, res) => {
//   const { email, password } = req.body;
// });

const getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const allUsers = await User.findAll({
      limit: limit || 10,
      offset: offset,
      include: {
        model: Post,
        attributes: ["title", "content"],
      },
      attributes: {
        exclude: ["password", "role", "createdAt", "isActive"],
      },
    });
    const user = allUsers.map((user) => {
      let age = calculateAge(user.dataValues.birthDate);
      age = user.dataValues.age;

      return user;
    });
    return res.status(success.code).json({
      status: success.message,
      results: user.length,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      status: " error",
      error: error.message,
    });
  }
  // console.log(allUsers[].dataValues);
};
const getOne = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
    });
    let birth = user.dataValues.birthDate;

    let age = calculateAge(birth);
    age = user.dataValues.age;

    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }
    res.status(200).json({ status: "success", data: user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateUser = async (req, res) => {
  const id = req.params.id;
  const { firstName, lastName, email, password, age } = req.body;
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    } else {
      await User.update(req.body, { where: { id } });
      res
        .status(200)
        .json({ status: "success", message: "User updated successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const gettt = async (req, res) => {
  const allUsers = await User.findAll();
  const usersData = await allUsers.map((u) => u.fullName);
  console.log(usersData);
  res.status(200).json(usersData);
};

module.exports = { updateUser, register, getAll, gettt, getOne, verifyOtp };
