const express = require("express");
const bodyParser = require("body-parser");
const user = require("./routes/user");
const book = require("./routes/book");
const InitiateMongoServer = require("./config/db");

// Initiate Mongo Server
InitiateMongoServer();

const app = express();

// PORT
const PORT = process.env.PORT || 5001;

// Middleware
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.json({ message: "API Working" });
});

/**
 * Router Middleware
 * Router - /user/*
 * Method - *
 */
app.use("/user", user);
app.use("/book", book);

app.listen(PORT, (req, res) => {
    console.log(`Server Started at PORT ${PORT}`);
});