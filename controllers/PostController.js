const User = require("../models/userModel.js");
const Post = require("../models/postModel.js");
const { sequelize } = require("../db.js");
const { op } = require("sequelize");

const createPost = async (req, res) => {
  console.log(req.body);
  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId);
    const { title, content } = req.body;
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const newPost = await Post.create({
      title,
      content,
      userId,
    });
    res.status(201).json(newPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
const getAllPosts = async (req, res) => {
  try {
    const allPosts = await Post.findAll({
      include: { model: User },
    });
    res.status(200).json({
      status: "success",
      results: allPosts.length,
      data: allPosts,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

module.exports = { createPost, getAllPosts };
