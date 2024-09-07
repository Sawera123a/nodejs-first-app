// // const http = require("http");
// // import http from "http";
// // import gfName ,{gfName1 , gfName2} from "./features.js";
// // // import {gfName1 , gfName2} from "./features.js";

// // console.log(gfName);

// //Agr ye object me le

// // import http from "http";
// // import * as myObj from "./features.js";
// // console.log(myObj);

// //kisi ek ko b acess kr skte h object mese

// // import http from "http";
// // import * as myObj from "./features.js";
// // console.log(myObj.gfName1);

// import http from "http";
// import {generateLovePercent} from "./features.js";
// // console.log(generateLovePercent());

// //fs is moduke
// import fs from "fs";
// // const home = fs.readFile("./index.html", () =>{
// //     console.log("File Read");
// // })
// // console.log(home);

// //its also like this
// // const home = fs.readFileSync("./index.html");
// // console.log(home);

// //path is also module
// import path from "path";

// console.log(path.extname("/home/random/index.html"))//random path likha or isne extension generate ki
// console.log(path.dirname("/home/random/index.html"))//random path likha or isne directry generate ki

// const server = http.createServer((req, res) =>{

//     // console.log("req.url");
//     if(req.url === "/about"){
//         res.end(`<h1> Love is ${generateLovePercent()}<h1>`); 
//     }
//     else if(req.url === "/"){
//     //    fs.readFile("./index.html", (err,home) =>{
//             // console.log("File Read");
//             res.end(home);
//         // })

//     }
//     else if(req.url === "/contact"){
//         res.end("<h1>Contact Page</h1>");
//     }
//     else{
//         res.end("<h1>Page not found</h1>");
//     }
// });

// server.listen(5000, () =>{
//     console.log("Server is working");
// });

import express from 'express';
import path from 'path';
import mongoose from "mongoose";
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt  from 'bcrypt';


mongoose.connect("mongodb://localhost:27017", {
    dbName: "backend",
}).then(() => console.log("Database Connected"))
    .catch((e) => console.log(e));

//schema define(data kis structure me ho ga)
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
});

//module
const User = mongoose.model("user", userSchema);

const app = express();

// //array for database
// const people = [];


// Middleware functions have access to the request (req) and response (res) objects, as well as the next() function, which passes control to the next middleware function in the stack. Middleware is typically used in frameworks like Express.js to handle tasks such as authentication, logging, parsing, and more.
//using middleware
app.use(express.static(path.join(path.resolve(), "public")));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//Setting  up view engine
app.set("view engine", "ejs");

//midddleware
const isAuthenticated = async (req, res, next) => {
    const { token } = req.cookies;
    if (token) {
        const decoded = jwt.verify(token, "abcdefghijkl");

        req.user = await User.findById(decoded._id);

        next();
    }
    else {
        res.redirect("/login");
    }
}

app.get("/", isAuthenticated, (req, res) => {
    // res.sendStatus(400);//500 means internel server error , //404 means not found, 400 bad request
    // res.json({
    //    success:true,
    //    product : [],
    // })//agr fetch kr rae hon ya koi library use kr rae hon

    // res.status(400).json("Meri mrzi");

    // const pathlocation = path.resolve();
    // console.log(path.join(pathlocation,"nice"));
    // console.log(path.join(pathlocation,"./index.html"));

    // res.sendFile("index.html");

    // console.log(req.cookies);
    // const {token} = req.cookies;

    // if (token){
    //     res.render("logout");
    // }
    // else{
    //     res.render("login");
    // }
    // console.log(req.user);
    res.render("logout", { name: req.user.name });
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/login", async(req,res)=>{

    const { email, password } = req.body;

    let user = await User.findOne({ email });
    if (!user) {
        return res.redirect("/register")
    }

    const isMAtch = await bcrypt.compare(password, user.password);
    if(!isMAtch) return res.render("login", { email, message:"Incorrect Password"});
    const token = jwt.sign({ _id: user._id }, "abcdefghijkl");

    res.cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 60 * 1000),
    });
    res.redirect("/");
});



app.post("/register", async (req, res) => {
    // console.log(req.body);
    const { name, email, password } = req.body;

    let user = await User.findOne({ email })
    if (user) {
        return res.redirect("/login")
    }

    const hashPassword = await bcrypt.hash(password,10);

    user = await User.create({
        name,
        email,
        password: hashPassword,
    });

    const token = jwt.sign({ _id: user._id }, "abcdefghijkl");

    res.cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 60 * 1000),
    });
    res.redirect("/");
});

app.get("/logout", (req, res) => {     //login k lye islye post kia qk wha pe email wgera dalni hoti h jbk logout pe kuch ni krna hota islye uspe get likha
    res.cookie("token", "null", {
        httpOnly: true,
        expires: new Date(Date.now()),
    });
    res.redirect("/");
});

//success routing
// app.get("/success", (req,res)=>{
//     res.render("success");
// })

//api
// app.post("/contact", async (req,res)=>{
// console.log(req.body);

// const messageData = {username , email};
// console.log(messageData);

// res.render("success");

// await Message.create({name: req.body.name, email: req.body.email});
//we can also do like this for cleaness
//     const {name, email} = req.body;
//     await Message.create({name, email});
//     res.redirect("/success");
// });


app.listen(5000, () => {
    console.log("Server is working");
});