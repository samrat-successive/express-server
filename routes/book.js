const express = require("express");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const auth = require('../middleware/auth')

const Book = require("../model/Book");

/**
 * @method - POST
 * @param - /create
 * @description - Book create
 */

router.post(
    "/create", auth,
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }
        const {
            name,
            description,
            author,
            price
        } = req.body;
        const userId = req.user.id;
        try {
            let book = await Book.findOne({
                name
            });

            if (book) {
                return res.status(400).json({
                    message: "Book Already Exists"
                });
            }

            book = new Book({
                name,
                userId,
                description,
                author,
                price
            });

            await book.save();
            res.status(200).json({
                book
            });

        } catch (err) {
            console.log(err.message);
            res.status(500).send("Error in Saving");
        }
    }
);

router.get("/all", auth, async (req, res) => {
    try {
        // request.user is getting fetched from Middleware after token authentication
        const userId = req.user.id;
        const books = await Book.find().where('userId').equals(userId);
        res.json(books);

    } catch (e) {
        res.send({ message: "Error in Fetching user" });
    }
});

router.post("/get", auth, async (req, res) => {
    try {
        // request.user is getting fetched from Middleware after token authentication
        const book = await Book.findById(req.body.id);
        res.json(book);

    } catch (e) {
        res.send({ message: "Error in Fetching user" });
    }
});

router.post("/update", auth, async (req, res) => {
    try {
        const {
            id,
            name,
            description,
            author,
            price
        } = req.body;
        let filter = { _id: id }
        let update = {
            name,
            description,
            author,
            price
        };
        const book = await Book.findOneAndUpdate(
            filter, update, { upsert: true }
        );
        res.json(book);

    } catch (e) {
        res.send({ message: "Error in Fetching book" });
    }
});

router.post("/delete", auth, async (req, res) => {
    try {
        // request.user is getting fetched from Middleware after token authentication
        const book = await Book.findOneAndRemove({_id : req.body.id});
        res.json(book);

    } catch (e) {
        res.send({ message: "Error in Fetching user" });
    }
});

module.exports = router;