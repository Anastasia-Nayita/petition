const express = require("express");
const app = express();
const handlebars = require("express-handlebars");
const db = require("./db");
const cookieSession = require("cookie-session");
const csurf = require("csurf");

/////⬇︎put in secret to protect before push to github
app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

app.use(
    express.urlencoded({
        extended: false,
    })
);

app.use(csurf());

app.use(function (req, res, next) {
    res.locals.csrfToken = req.csrfToken();
    res.setHeader("x-frame-options", "deny");
    next();
});
//// Clickjacking:

app.engine("handlebars", handlebars());
app.set("view engine", "handlebars");

app.use(express.static("./public"));

app.get("/", (req, res) => {
    //  console.log("get request / just happen");
    //console.log("req.session: ", req.session);
    // req.session === "WHAAT";
    // console.log("req.session after: ", req.session);
    res.redirect("/welcome");
});

app.get("/welcome", (req, res) => {
    //  consol(e.log("req.session in welcome: ", req.session);
    res.render("welcome", {
        layout: "main",
    });
});
// use Middleware from EXPRESS, console.log(req.body) use post req//
app.post("/welcome", (req, res) => {
    console.log("req.body:", req.body);
    const { firstName, lastName, signature } = req.body;
    if (firstName != "" && lastName != "" && signature != "") {
        // res.cookie("");
        db.addSigner(firstName, lastName, signature)
            .then(() => {
                console.log("WORKED");
            })
            .catch((err) => {
                console.log("err:", err);
            });
    }
    //     console.log("all data is here");
    // } else {
    //     res.send(`<h1>there is some data missing</h1>`);
    //     setTimeout(() => res.redirect("/welcome"), 2000);
    // }
});

//////// for get req for /signers //////////
// db.getSigner()
//     .then((results) => {
//         console.log("results: ", results);
//     })
//     .catch((err) => {
//         console.log("err:", err);
//     });
////////////////

// app.get("/cities", (req, res) => {
//     db.getSigner()
//         .then((results) => {
//             console.log("results: ", results);
//         })
//         .catch((err) => {
//             console.log("err:", err);
//         });
// });

//////// to change database we need to POST
// // app.post("/add-city", (req, res) => {
// //     db.addSigner("Quito", 1000, "Ecuador")
// //         .then(() => {
// //             console.log("yey it worked");
// //         })
// //         .catch((err) => {
// //             console.log("err in addCity", err);
// //         });
// // });

app.get("/thanks", (req, res) => {
    res.render("thanks", {
        layout: "main",
    });
});

app.get("/signers", (req, res) => {
    res.render("signers", {
        layout: "main",
    });
});

app.listen(8080, () => console.log("server is running🏃‍♂️..."));
