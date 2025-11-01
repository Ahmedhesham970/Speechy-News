const { body, params, validationResult } = require("express-validator");

const validateUser = [
  body("email").isEmail().withMessage("Invalid email format"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .isStrongPassword()
    .withMessage(
      "Password must contains Upper,lowercase alphapets ,numbers , and signs"
    ),
    body("birthDate")
    .isDate()
    .withMessage("Invalid date format for birthDate")
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date(); 
      if (birthDate >= today) {
        throw new Error("Birth date must be in the past");
      } 
      return true;
    }).withMessage("Birth date must be in the past"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((err) => err.msg);
      return res.status(400).json(errorMessages);
    }
    next();
  },
];
module.exports = validateUser;
