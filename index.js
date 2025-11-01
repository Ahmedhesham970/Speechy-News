const express = require("express");
const { sequelize, connectDB } = require("./db");
// const User = require("./models/userModel");
// const Post = require("./models/postModel");
const user = require("./routers/userRouter");
const post = require("./routers/postRouter");
const { User, Post } = require("./models/relations");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
app.use(morgan("dev"));
app.use(express.json());
app.use("/api", user);
app.use("/posts", post);
connectDB();


app.get("/helllo", (req, res) => {
  res.send("hello world");
}
)

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Can't find ${req.originalUrl} on this server!`
  });
});


app.listen(3001, () => {
  console.log("connected on server sucsessfully");
});
