const Joi = require ('joi');
const express = require('express');
const { MongoClient} = require('mongodb');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const mongodb = MongoClient;

const app = express();
app.use(express.json());

const secretKey = process.env.secretKey;

const url = 'mongodb://localhost:27017'
const dbName = 'carRental';
let db;

async function connectToDatabase() {
    try {
      const client = await mongodb.connect(url);
      db = client.db(dbName);
      console.log("Connected to database");
    } catch (err) {
      console.error("Couldn't connect to database: ", err);
    }
  }
  connectToDatabase();

const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization');

    if(!token){
        return res.status(401).send("Unauthorized!");
    }

    jwt.verify(token, secretKey, (err, user) => {
        if(err){
            return res.status(403).send('Unauthorized!');
        }
        req.user = user;
        next();
    });
    
};

const registerSchema = Joi.object({
    fullName: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    username: Joi.string().alphanum().min(3).max(10).required(),
    password: Joi.string().required()
});

const loginSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(10).required(),
    password: Joi.string().required()
});



app.post('/register', async(req, res) => {

    if (!db) {
        return res.status(503).send('Service Unavailable. Try again later.');
    }
    
    const { error } = registerSchema.validate(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    try {
        const { fullName, email, username, password } = req.body;

        const existingUser = await db.collection('users').findOne({
            $or: [{ username: username }, { email: email }],
        });

        if (existingUser) {
            return res.status(409).send('User already exists.');
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = { fullName, email, username, password: hashedPassword};
        await db.collection('users').insertOne(newUser);
        res.status(201).send('User added successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to add user!')
    };
});

app.post('/login', async(req, res) => {

    const { error } = loginSchema.validate(req.body)
    if (error) {
        return res.status(400).send(error.details[0].message)
    }

    try{
        const { username, password } = req.body;
        const user = await db.collection('users').findOne({ username });
        
        if(!user) {
            return res.status(401).send('Unauthorized!')
        }

        const passWordCorrect = await bcrypt.compare(password, user.password);

        if(!passWordCorrect) {
            return res.status(401).send('Unauthorized!');
        }

        const token = jwt.sign({ username: user.username}, secretKey);
        res.json({ token });
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    };
});

app.get('/my-profile', authenticateJWT, async(req, res) => {
    try{
        const username = req.user.username;
        const user = await db.collection("users").findOne({ username }, { projection: { password: 0, _id: 0} });
        
        if(!user){
            res.status(404).send("User not found!");
        }
        res.json(user);
    } catch(err) {
        console.error(err);
        res.sendStatus(500);
    };
});

app.get('/rental-cars', async(req, res) => {
    try{
        const { year, color, steeringType, numberOfSeats } = req.query;
        const query = {};

        if(year) {
            query.year = parseInt(year);
        }

        if(color) {
            query.color = color;
        }

        if(steeringType) {
            query.steering_type = steeringType;
        }

        if(numberOfSeats) {
            query.number_of_seats = parseInt(numberOfSeats);
        }

        const cars = await db.collection("cars").find(query).sort({ price_per_day: 1}).toArray();
        res.json(cars);
    }catch (err) {
        console.error(err);
        res.sendStatus(500);
    };
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
