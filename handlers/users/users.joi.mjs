import Joi from "joi";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d{4})(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{9,30}$/;


export const UserLogin = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required().regex(passwordRegex),
});



//!לעבוד על זה


export const UserSignup = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required().regex(passwordRegex),
})