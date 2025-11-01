const User = require("./userModel");
const Post = require("./postModel");

User.hasMany(Post, { foreignKey: "userId" });
Post.belongsTo(User, { foreignKey: "userId" });

module.exports = { User, Post };
