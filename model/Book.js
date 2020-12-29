const mongoose = require("mongoose");

const BookSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    price: {
        type: String,
    }
});

// export model user with UserSchema
module.exports = mongoose.model("book", BookSchema);
