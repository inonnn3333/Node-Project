import { app } from "../../app.mjs";
import { adminGuard, applyGuardOrAdminGuard, getUser, registeredGuard } from "../../guard.mjs";
import { User } from "./users.model.mjs";
import bcrypt from "bcrypt";


//* מקבלים את כל היוזרים שלנו
app.get('/users', adminGuard, async (req, res) => {
    res.send(await User.find());

});

//* הצגת משתמש יחיד
app.get('/users/:id', applyGuardOrAdminGuard, async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return res.status(403).send({message: "User not found"});
    }

    if (getUser(req).isAdmin || user.id == getUser(req)._id) {
        res.send(user);
    } else {
        res.status(401).send({message: "User is not authorized"});
    }
});


//* שינוי משתמש
app.put('/users/:id', registeredGuard, async (req, res) => {
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

    const user = await User.findById(req.params.id);

    // אם משתמש לא נמצא בדאטה
    if (!user) {
        return res.status(403).send({"message": "User not found"});
    };

    user.name = {
        first: first || user.name.first,
        middle: middle || user.name.middle,
        last: last || user.name.last
    };
    user.phone = phone || user.phone;
    user.email = email || user.email;
    user.password = await bcrypt.hash(password, 10) || user.password;
    user.image = {
        url: url || user.image.url,
        alt: alt || user.image.alt
    };
    user.address = {
        state: state || user.address.state,
        country: country || user.address.country,
        city: city || user.address.city,
        street: street || user.address.street,
        houseNumber: houseNumber || user.address.houseNumber,
        zip: zip || user.address.zip
    };
    user.isAdmin = isAdmin !== undefined ? isAdmin : user.isAdmin;
    user.isBussiness = isBussiness !== undefined ? isBussiness : user.isBussiness;
    user.createAt = createAt || user.createAt;
    
    
    await user.save();
    res.send(user);
});

app.patch("/users/:id", registeredGuard, async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(403).send("User not found");

    user.isBussiness = !user.isBussiness;
    await user.save();

    res.send(user);
});

//* מחיקת משתמש
app.delete('/users/:id', applyGuardOrAdminGuard, async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.send({"meassage": "User is deleted"});
    
});