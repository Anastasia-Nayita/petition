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
/////////////////////REGISTER BLOCK
app.get("/register", (req, res) => {
    res.render("register", {
        layout: "main",
    });
});

app.post("/register", (req, res) => {
    //console.log("req.body ", req.body);
    const { first, last, email, password } = req.body;
    if (first != "" && last != "" && email != "" && password != "") {
        /////try to delete
        bc.hash(password)
            .then((hashedPassword) => {
                req.body.password = hashedPassword;
                const HSpassword = req.body.password;
                ///  console.log("HSpassword", HSpassword);
                ///   const { userId } = req.session;
                ///  console.log("userId: ", userId);
                db.addUserData(first, last, email, HSpassword)
                    .then((resultUser) => {
                        //console.log("resultUser: ", resultUser);
                        req.session.registered = true;
                        req.session.userId = resultUser.rows[0].id;
                        res.redirect("/profile");
                    })
                    .catch((err) => {
                        console.log("err in post register: ", err);
                        res.render("register", {
                            error: "something went wrong try one more time",
                        });
                    });
                /// console.log("POST REGISTER WORKED");
            })
            .catch((err) => {
                console.log("err : ", err);
            });
    }
    // res.redirect("/profile");
});
//////////////////////////////////PROFILE BLOCK
app.get("/profile", (req, res) => {
    res.render("profile", {
        layout: "main",
    });
});

app.post("/profile", (req, res) => {
    const { age, city, homepage } = req.body;
    //console.log("req.body", req.body);
    // console.log("req.session", req.session);
    const { userId } = req.session;
    // console.log("req.body", req.body);
    // console.log("req.session.loggedIn", req.session.loggedIn);
    // let user_id = req.session.loggedIn;
    db.addProfile(age, city, homepage, userId)
        .then(() => {
            res.redirect("/welcome");
        })
        .catch((err) => {
            console.log("err: ", err);
        });
});
////////////////////////////////// EDIT BLOCK
app.get("/edit", (req, res) => {
    db.getSignersData().then((results) => {
        let allSigners = results.rows;

        res.render("edit", {
            layout: "main",
            allSigners,
        });
    });
});

app.post("/edit", (req, res) => {});

app.get("/login", (req, res) => {
    if (req.session.loggedIn) {
        res.redirect("/profile");
    } else if (!req.session.registered) {
        res.render("login");
    } else {
        res.redirect("/profile");
    }
});
//////////////////////////////////LOGIN BLOCK
app.post("/login", (req, res) => {
    const { emailLog, passwordLog } = req.body;
    ///console("req body in login", req.body);
    if (emailLog != "" && passwordLog != "") {
        /////try to delete
        db.getUserData(emailLog)
            .then((valid) => {
                if (valid) {
                    bc.compare(passwordLog, valid.rows[0].password).then(
                        (result) => {
                            let userId = valid.rows[0].id;
                            if (result) {
                                req.session.userId = userId;
                                res.redirect("/profile");
                            } else {
                                res.render("login", {
                                    error: "wrong, try again",
                                });
                            }
                        }
                    );
                }
            })
            .catch((err) => {
                console.log("err", err);
                res.render("login", {
                    error: "something went wrong, try again",
                });
            });
    } else {
        res.render("login", {
            error: "try again",
        });
    }
});
////////////////////////////////// WELCOME / PETITIN BLOCK
app.get("/welcome", (req, res) => {
    //  consol(e.log("req.session in welcome: ", req.session);
    res.render("welcome", {
        layout: "main",
    });
});
// use Middleware from EXPRESS, console.log(req.body) use post req//
app.post("/welcome", (req, res) => {
    // console.log("req.body:", req.body);
    const { userId } = req.session;
    const { signature } = req.body;
    if (signature != "") {
        db.addSigner(signature, userId)
            .then((id) => {
                //  console.log("id.rows[0].id", id.rows[0].id);
                // res.cookie("authenticated", true);
                req.session.signed = true;
                req.session.signatureId = id.rows[0].id;
                console.log("id", id.rows[0].id); ////////   id
                ////////we get the id
                res.redirect("/thanks");
            })
            .catch((err) => {
                console.log("err: ", err);
            });
    }
});
////////////////////////////////// THANKS BLOCK
app.get("/thanks", (req, res) => {
    if (req.session.signed) {
        db.getSignature(req.session.signatureId).then((sigResults) => {
            // console.log("sigResults  ", sigResults);
            db.getSigner().then((results) => {
                let sigUrl = sigResults.rows[0].signature;
                let totalNumber = results.rowCount;

                res.render("thanks", {
                    layout: "main",
                    sigUrl,
                    totalNumber,
                });
            });
        });
    } else {
        res.redirect("/welcome");
    }
});
////////////////////////////////// SIGNERS BLOCK
app.get("/signers", (req, res) => {
    if (req.session.signed) {
        db.getSignersData()
            .then((results) => {
                let allSigners = results.rows;
                console.log("allSigners.city", allSigners.city); /////////////////continue here
                //// console.log("allSigners:  ", allSigners);
                let totalNumber = results.rowCount;

                // console.log("req.body: ", req.body);
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
app.get("/signers/:city", (req, res) => {
    if (req.session.signed) {
        db.getSignersData().then((results) => {
            let allSigners = results.rows;
            // console.log("allSigners.city", allSigners[0].city);
            // const { city } = req.params;
            // const selectedCity = allSigners.find(({city}) => )
        });
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

app.listen(process.env.PORT || 8080, () =>
    console.log("server is running🏃‍♂️...")
);
