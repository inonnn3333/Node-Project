import { app } from "../../app.mjs";
import { User } from "./users.model.mjs";
import bcrypt from "bcrypt";
import moment from 'moment';
import jwt from "jsonwebtoken"
import { UserSignup } from "./users.joi.mjs";

app.post('/users/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(403).send({"message":"Email or password is inncorect"});
    }
    if (!user.password || !await bcrypt.compare(password, user.password)) {
        return res.status(403).send({"message":"Email or password is inncorect"});
    }

    const token = jwt.sign({
        _id: user._id,
        firstName: user.name.first,
        lastName: user.name.last,
        isBussiness: user.isBussiness,
        isAdmin: user.isAdmin
    }, process.env.JWT_SECRET, {expiresIn: '1h'})

    res.send(token);
});



app.post('/users', async (req, res) => {
    try {
        const {
            name: {first, middle, last},
            phone,
            email,
            password,
            image: {url, alt},
            address: {state, country, city, street, houseNumber, zip},
            isAdmin,
            isBussiness,
            createAt,
        } = req.body;

        const validate = UserSignup.validate(req.body);
        if (validate.error) {
            return res.status(400).send({"ValidateError": validate.error.details[0].message.replace(/"/g, '')});
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(403).send({"message": "Email already exists"});
        }

        const user = new User({
            name: {first, middle, last},
            phone,
            email,
            password: await bcrypt.hash(password, 10),
            image: {url, alt},
            address: {state, country, city, street, houseNumber, zip},
            isAdmin,
            isBussiness,
            createAt: moment().format('YYYY-MM-DD HH:mm'),
        });

        const newUser = await user.save();

        res.send(newUser);
    } catch (err) {
        console.error(err);
        res.status(500).send({"message": "Internal Server Error"});
    }
});

