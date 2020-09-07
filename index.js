const express = require("express");
const app = express();
const handlebars = require("express-handlebars");
const db = require("./db");
//const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const csurf = require("csurf");
const bc = require("./bc.js");
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
    res.redirect("/register");
});

app.get("/register", (req, res) => {
    res.render("register", {
        layout: "main",
    });
});

app.post("/register", (req, res) => {
    ///console.log("req.body ", req.body);
    // const { first, last, email, password, created_at } = req.body;
    // bc.hash(password)
    //     .then((hashedPassword) => {
    //         db.addPassword(first, last, email, hashedPassword, created_at);
    //         /////req.session.userId extract from Users id - how?
    //         console.log("POST REGISTER WORKED");
    //         res.redirect("/welcome");
    //     })
    //     .catch((err) => {
    //         console.log("err: ", err);
    //     });
});

app.get("/login", (req, res) => {
    res.render("login", {
        layout: "main",
    });
});
app.post("/login", (req, res) => {});

app.get("/welcome", (req, res) => {
    //  consol(e.log("req.session in welcome: ", req.session);
    res.render("welcome", {
        layout: "main",
    });
});
// use Middleware from EXPRESS, console.log(req.body) use post req//
app.post("/welcome", (req, res) => {
    // console.log("req.body:", req.body);
    const { firstName, lastName, signature } = req.body;
    if (firstName != "" && lastName != "" && signature != "") {
        db.addSigner(firstName, lastName, signature)
            .then((id) => {
                //  console.log("id.rows[0].id", id.rows[0].id);
                // res.cookie("authenticated", true);
                req.session.signed = true;
                req.session.signatureId = id.rows[0].id;
                console.log("id", id.rows[0].id);
                ////////we get the id
                res.redirect("/thanks");
            })
            .catch((err) => {
                console.log("err: ", err);
            });
    }
});

app.get("/thanks", (req, res) => {
    if (req.session.signed) {
        db.getSignature();
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
                let totalNumber = results.rowCount;

                res.render("signers", {
                    allSigners,
                    totalNumber,

                    //res.send(` <h2> And the total number of signers is <script src="index.js">results.rowCount</script></h2>`)
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
