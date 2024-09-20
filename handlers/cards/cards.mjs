import { app } from "../../app.mjs";
import { bussinessGuard, guard, guardUserOfCard, guardUserOfCardOrAdmin } from "../../guard.mjs";
import { Card } from "./cards.model.mjs";
import { getUser } from "../../guard.mjs";
import { cardSchema } from "./cards.joi.mjs";

//* מביא את כל הכרטיסים
app.get('/cards', async (req, res) => {
    res.send(await Card.find());

});


//* הכרטיסים שלי - השייכים לאותו יוזר
app.get('/cards/my-cards', guard, async (req, res) => {
    const user = getUser(req);
    res.send(await Card.find({user_id: user._id}));

});


//* הצגת כרטיס יחיד
app.get('/cards/:id', async (req, res) => {
    try {
        const card = await Card.findById(req.params.id);
        if (!card) {
            return res.status(404).send("Card not found");
        }
        res.send(card);
    } catch (err) {
        res.status(500).send("Oops. An error occurred.");
    }
});


app.post('/cards', bussinessGuard, async (req, res) => {
    try {
        const item = req.body;
        const card = new Card({
            title: item.title,
            subtitle: item.subtitle,
            description: item.description,
            phone: item.phone,
            email: item.email,
            address: {
                state: item.address.state,
                country: item.address.country,
                city: item.address.city,
                street: item.address.street,
                houseNamber: item.address.houseNamber,
                zip: item.address.zip,
            },
            image: {
                url: item.image.url,
                alt: item.image.alt,
            },
            web: item.web,
            user_id: getUser(req)?._id,
        });

        const validate = cardSchema.validate(req.body);

        if (validate.error) {
            return res.status(403).send(validate.error.details[0].message);
        }
        if (await Card.findOne({ title: card.title })) {
            return res.status(403).send({"message": "Card is exist"});
        }

        const newCard = await card.save(); // שמירת הכרטיס בדאטהבייס
        res.send(newCard); // שליחת הכרטיס שנשמר כתגובה
    } catch (error) {
        console.error('Error creating card:', error);
        res.status(500).send('Failed to create card');
    }
});



//* שינוי כרטיס
app.put('/cards/:id', guardUserOfCard, async (req, res) => {
    try {
        const {
            title,
            subtitle,
            description,
            phone,
            email,
            web,
            image: {
                url,
                alt,
            },
            address: {
                state,
                country,
                city,
                street,
                houseNumber,
                zip,
            },
        } = req.body;

        const card = await Card.findById(req.params.id);

        const validate = cardSchema.validate(req.body);

        if (validate.error) {
            return res.status(403).send(validate.error.details[0].message);
        }
        // אם כרטיס לא נמצא בדאטה
        if (!card) {
            return res.status(404).send({ "message": "Card not found" });
        }

        // עדכון השדות בכרטיס
        card.title = title || card.title;
        card.subtitle = subtitle || card.subtitle;
        card.description = description || card.description;
        card.phone = phone || card.phone;
        card.email = email || card.email;
        card.web = web || card.web;
        card.image = {
            url: url || card.image.url,
            alt: alt || card.image.alt
        };
        card.address = {
            state: state || card.address.state,
            country: country || card.address.country,
            city: city || card.address.city,
            street: street || card.address.street,
            houseNumber: houseNumber || card.address.houseNumber,
            zip: zip || card.address.zip
        };

        await card.save();
        res.send(card);

    } catch (error) {
        console.error('Error updating card:', error);
        res.status(500).send({ message: 'Failed to update card' });
    }
});



//* לייק
app.patch("/cards/:id", guard, async (req, res) => {
    try {
        const card = await Card.findById(req.params.id);
        const user = getUser(req);

        if (!card) {
            return res.status(404).send("Card not found");
        }

        const find = card.likes.includes(user._id);

        if (!find) {
            card.likes.push(user._id);
        } else {
            const index = card.likes.indexOf(user._id);
            if (index !== -1) {
                card.likes.splice(index, 1);
            }
        }

        const updateCard = await card.save();
        res.send(updateCard);
    } catch (error) {
        console.error('Error updating likes:', error);
        res.status(500).send({ message: "Failed to update card likes" });
    }
});



//* מחיקת כרטיס
app.delete('/cards/:id', guardUserOfCardOrAdmin, async (req, res) => {
    try {
        const card = await Card.findByIdAndDelete(req.params.id);

        if (!card) {
            return res.status(404).send({ "message": "Card not found" });
        }

        res.send({ "message": "Card is deleted" });
    } catch (error) {
        console.error('Error deleting card:', error);
        res.status(500).send({ "message": "Failed to delete card" });
    }
});
