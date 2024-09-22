import jwt from "jsonwebtoken";
import { Card } from "./handlers/cards/cards.model.mjs";


export const guard =  (req, res, next) => {
    jwt.verify(req.headers.authorization, process.env.JWT_SECRET, (err, data) => {
        if (err) {
            return res.status(401).send({message: "User is not authorized"});
        } else next();
    })
};


export const adminGuard =  (req, res, next) => {
    jwt.verify(req.headers.authorization, process.env.JWT_SECRET, (err, data) => {
        if (err || !data.isAdmin) {
            return res.status(401).send({message: "User is not authorized"});
        }
    
        next()
    })
};


export const bussinessGuard = (req, res, next) => {
    try {
        const token = req.headers.authorization;
        
        if (!token) {
            return res.status(401).send({ message: "Authorization token is missing" });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
            if (err) {
                return res.status(401).send({ message: "Invalid token" });
            }
            
            if (!data.isBussiness) {
                return res.status(403).send({ message: "User is not authorized as a business" });
            }
    
            next();
        });
    } catch (error) {
        console.error("Error in business guard:", error);
        res.status(500).send({ message: "Internal server error" });
    }
};



export const applyGuardOrAdminGuard = (req, res, next) => {
    const user = getUser(req);

    if (user === null || user.isAdmin === null) {
        return res.status(403).send("Please log in.");
    }

    if (user.isAdmin) {
        return adminGuard(req, res, next);
    }

    if (req.params.id == user._id) {
        return guard(req, res, next);
    } 
    
    else {
        return res.status(401).send({message: "User is not authorized"});
    }
};



export const guardUserOfCardOrAdmin = async (req, res, next) => {

    try{
        const user = getUser(req);        
        const cardId = req.params.id;
    
        const card = await Card.findById(cardId);
        
        if (user === null || user.isAdmin === null) {
            return res.status(403).send({message: "Please log in."});
        }

        if (user.isAdmin || card.user_id.toString() === user._id.toString()) {
            return next();
        } else {
            return res.status(403).send({message: "You are not authorized to modify this card"});
        }

    } catch(err) {
        console.error({message: `Error finding card:, ${err.message}`});
        res.status(500).send({message: "An error occurred while trying to authorize the user."});
    }
    
};

export const guardUserOfCard = async (req, res, next) => {

    try{
        const user = getUser(req);
        const cardId = req.params.id;
    
        const card = await Card.findById(cardId);

        if (!card) {
            return res.status(404).send({message: "Card not found"});
        }
    
        if (user === null) {
            return res.status(403).send({message: "Please log in."});
        }
        
        if (card.user_id.toString() !== user._id.toString()) {
            return res.status(403).send({message: "You are not authorized to modify this card"});
        }

        next();
    } catch(err) {
        console.error({message: `Error finding card:, ${err.message}`});
        res.status(500).send({message: "An error occurred while trying to authorize the user."});
    }
    
};



export const registeredGuard = (req, res, next) => {
    const user = getUser(req);

    if (user === null || user.isAdmin === null) {
        return res.status(403).send("Please log in.");
    }

    if (req.params.id == user._id) {
        return guard(req, res, next);
    } 
    
    else {
        return res.status(401).send({message: "User is not authorized"});

    }
};


export const getUser = (req) => {
    if (!req.headers.authorization) {
        return null;
    }

    const user = jwt.decode(req.headers.authorization, process.env.JWT_SECRET);

    if (!user) {
        return null;
    }

    return user;
}