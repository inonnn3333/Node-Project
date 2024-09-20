import express from 'express';
import cors from 'cors';
import moment from 'moment';
import mongoose from 'mongoose';
import chalk from 'chalk';
import path from 'path';
import dotenv from 'dotenv';
import morgan from "morgan";

// טעינה של הספריה שעובדת עם קובץ אי-אנ-וי
dotenv.config();


async function main() {
    try{
        const connection = process.env.NODE_ENV === 'development' ? process.env.MONGO_DB_URL : process.env.ATLAS_URL;
        await mongoose.connect(connection);
        console.log(chalk.black.bgGreen.bold(' Database connected '));
    } catch (err) {
        console.error(chalk.red("Error connecting to database: " + err));
    }
}

main().catch(err => console.error(chalk.red(err)));

export const app = express();

// הדאטה שאני הולך לקלוט יהיה בקובץ ג'ייסון
app.use(express.json());


// ספריית מורגן עבור הלוגים
app.use(morgan(function (tokens, req, res) {
    const status = tokens.status(req, res)
    
        return [
            chalk.blue(tokens.method(req, res)),
            chalk.green(tokens.url(req, res)),
            status >= 200 && status < 400 ? chalk.bgGreen(tokens.status(req, res)) : chalk.bgRed(tokens.status(req, res)),
            chalk.red(moment().format('YYYY-MM-DD HH:mm')), '-',
            chalk.bgBlack(tokens['response-time'](req, res)), 'ms'
        ].join(' ')
    }
));    

// אם לא נמצא ניתוב, הניתוב ילך לתיקיית פאבליק
app.use(express.static("public"));

app.use(cors({
    origin: true,
    credentials: true,
    methods: 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
}));



// באיזה פורט אני משתמש
app.listen(process.env.PORT, () => {
    console.log("Server is running on port 5555");

});


// נקודת קצה בסיסית
app.get('/', (req, res) => {
    res.send({
        messege: "main!"
    });
});

(async () => {
    await import ('./handlers/users/users.mjs');
    await import ('./handlers/users/auth.mjs');
    await import ('./handlers/cards/cards.mjs');
    await import ('./initial data/initial-data.service.mjs');

    app.get('/*', (req, res) => {
        res.sendFile(path.resolve('public/error-page.html'));
    });
})();
