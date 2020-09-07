const express = require("express");
const app = express();
const handlebars = require("express-handlebars");
const db = require("./db");
//const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const csurf = require("csurf");
const bc = require("/bc.js");
/////⬇︎put in secret to protect before push to github
app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);
//app.use(cookieParser());
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

        // console.log("req.cookies : ", req.cookies);
        // console.log("res.cookies : ", res.cookies);
        db.addSigner(firstName, lastName, signature)
            .then((id) => {
                //  console.log("id.rows[0].id", id.rows[0].id);
                // res.cookie("authenticated", true);
                req.session.signed = true;
                res.redirect("/thanks");
                console.log("WORKED");
            })
            .catch((err) => {
                console.log("err:", err);
            });
    }
});

app.get("/thanks", (req, res) => {
    if (req.session.signed) {
        res.render("thanks", {
            layout: "main",
        });
    } else {
        res.redirect("/welcome");
    }
});

app.get("/signers", (req, res) => {
    if (req.session.signed) {
        db.getSigner()
            .then((results) => {
                let allSigners = results.rows;

                console.log("results.rowCount", results.rowCount); /////total number
                res.render("signers", {
                    allSigners,
                });
            })
            .catch((err) => {
                console.log("err:", err);
            });
    } else {
        res.redirect("/welcome");
    }
});
//////// for get req for /signers //////////

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

app.listen(8080, () => console.log("server is running🏃‍♂️..."));
