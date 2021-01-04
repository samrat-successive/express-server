const express = require("express");
const { check, validationResult } = require('express-validator');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const auth = require('../middleware/auth')

const User = require("../model/User");

/**
 * @method - POST
 * @param - /signup
 * @description - User SignUp
 */

router.post(
    "/signup", [
    check('name')
        .not()
        .isEmpty()
        .withMessage('Name is required'),
    check('email', 'Email is required')
        .isEmail(),
    check('password', 'Password is required')
        .isLength({ min: 1 })
],
    async (req, res) => {
        const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
            // Build your resulting errors however you want! String, object, whatever - it works!
            let errorMessages = [];
            errorMessages.push(msg)
            return `[${param}]: ${msg}`;
            // return `${location}[${param}]: ${msg}`;
        };
        const errors = validationResult(req).formatWith(errorFormatter);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: errors.array()
            });
        }
        const {
            name,
            email,
            password
        } = req.body;
        try {
            let user = await User.findOne({
                email
            });

            if (user) {
                return res.status(400).json({
                    message: "User Already Exists"
                });
            }

            user = new User({
                name,
                email,
                password
            });

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            await user.save();

            const payload = {
                user: {
                    id: user._id
                }
            };

            jwt.sign(
                payload,
                "app-book", {
                expiresIn: 10000
            },
                (err, token) => {
                    if (err) throw err;
                    res.status(200).json({
                        token
                    });
                }
            );
        } catch (err) {
            console.log(err.message);
            res.status(500).send("Error in Saving");
        }
    }
);

router.post(
    "/login", [
    check('email', 'Email is required')
        .isEmail(),
    check('password', 'Password is required')
        .isLength({ min: 1 })
],
    async (req, res) => {
        const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
            // Build your resulting errors however you want! String, object, whatever - it works!
            let errorMessages = [];
            errorMessages.push(msg)
            return `[${param}]: ${msg}`;
            // return `${location}[${param}]: ${msg}`;
        };
        const errors = validationResult(req).formatWith(errorFormatter);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: errors.array()
            });
        }

        const { email, password } = req.body;
        try {
            let user = await User.findOne({
                email
            });
            if (!user)
                return res.status(400).json({
                    message: "User Not Exist"
                });

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch)
                return res.status(400).json({
                    message: "Incorrect Password !"
                });

            const payload = {
                user: {
                    id: user._id
                }
            };

            jwt.sign(
                payload,
                "app-book",
                {
                    expiresIn: 3600
                },
                (err, token) => {
                    if (err) throw err;
                    res.status(200).json({
                        token
                    });
                }
            );
        } catch (e) {
            console.error(e);
            res.status(500).json({
                message: "Server Error"
            });
        }
    }
);

router.get("/me", auth, async (req, res) => {
    try {
        // request.user is getting fetched from Middleware after token authentication
        const user = await User.findById(req.user.id);
        res.json(user);
    } catch (e) {
        res.send({ message: "Error in Fetching user" });
    }
});

module.exports = router;