import { app } from "../../app.mjs";
import { User } from "./users.model.mjs";
import bcrypt from "bcrypt";
import moment from 'moment';
import jwt from "jsonwebtoken"
import { UserLogin } from "./users.joi.mjs";

app.post('/users/login', async (req, res) => {
    const { email, password } = req.body;


    const validate = UserLogin.validate({email, password});
    if (validate.error) {
        console.log(validate.error.details[0].message);
        
        return res.status(403).send(validate.error.details[0].message);

    }
    
    //*שליפת היוזר ע"י חיפוש
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(403).send({"message":"Email or password is inncorect"});
    }
    //* אם אין סיסמא או שאין השוואה בין הסיסמאות
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

    // const validate = UserSignup.validate(req.body, {allowUnknown: true});
    // if (validate.error) {
    //     console.log(validate.error.details[0].message);
        
    //     return res.status(403).send(validate.error.details[0].message);

    // }

    //*אם האימייל כבר קיים, היינו שיש יוזר קיים, אז נחזיר הודעה שגיאה
    if (await User.findOne({ email })) {
        return res.status(403).send({"message":"Email is exist"});
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
    })

    // שמירת נתוני המשתמש החדש במשתנה+ שליחת היוזר החדש לדאטה
    const newUser = await user.save();

    // שליחת רספונס למשתמש
    res.send(newUser);
});
