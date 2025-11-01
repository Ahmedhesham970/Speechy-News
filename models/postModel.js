const { DataTypes } = require("sequelize");
const { sequelize } = require("../db");

const Post = sequelize.define("Post", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { notEmpty: true, len: [5, 100] },
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: { notEmpty: true, len: [20, 5000] },
  },
});

module.exports = Post;
