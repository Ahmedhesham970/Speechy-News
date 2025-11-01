const { DataTypes } = require("sequelize");
const { sequelize } = require("../db");
// const Post = require("../models/postModel");
const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fullName: {
      type: DataTypes.VIRTUAL,
      get() {
        return `${this.firstName} ${this.lastName}`;
      },
      set(value) {
        throw new Error("Do not try to set the `fullName` value!");
      },
    },
    age: {
      type: DataTypes.VIRTUAL,
      get() {
        const birthDate = this.getDataValue("birthDate");
        if (!birthDate) return null;

        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();

        const monthDiff = today.getMonth() - birth.getMonth();
        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birth.getDate())
        ) {
          age--;
        }

        return age;
      },
      set(value) {
        throw new Error(
          "Do not try to set the 'age' value directly. It is calculated from birthDate."
        );
      },
    },
    gender: {
      type: DataTypes.ENUM("male", "female"),
      defaultValue: "male",
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: {
          args: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/,
          msg: "Password must contain at least 8 characters, including uppercase, lowercase, and a number.",
        },
      },
    },
    otp: {
      type: DataTypes.INTEGER,
    },
    otpDuration: {
      type: DataTypes.TIME,
      defaultValue: sequelize.literal("CURRENT_TIME"),
      // createdAt: DataTypes.DATE,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    
    role: {
      type: DataTypes.ENUM("user", "admin"),
      defaultValue: "user",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    birthDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        // notNull: { msg: "Birth date is required" },
        isDate: { msg: "Birth date must be a valid date" },
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "users",
    timestamps: false,
  }
);


// syncDb();
module.exports = User;
