const { createPost,getAllPosts } = require("../controllers/PostController.js");
const express = require("express");
const router = express.Router();

router.route("/create/:id").post(createPost);
router.route("/allPosts").get(getAllPosts);
module.exports = router;
