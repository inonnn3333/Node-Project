import mongoose ,{ Schema } from "mongoose";

const Name = new Schema({
    first: String,
    middle: String,
    last: String
});

const Address = new Schema({
    state: String,
    country: String,
    city: String,
    street: String,
    houseNumber: Number,
    zip: Number
});

const Image = new Schema({
    url: String,
    alt: String
});



const schema = new Schema({
    name: Name,
    phone: Number,
    email: {
        type: String,
        unique: true,
    },
    password: String,
    image: Image,
    address: Address,
    isAdmin: {
        type: Boolean,
        default: false
    },
    isBussiness: {
        type: Boolean,
        default: false
    },
    createAt: String,
});

export const User = mongoose.model("users", schema);
