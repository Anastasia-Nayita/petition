const express = require("express");
const app = express();
const handlebars = require("express-handlebars");
const db = require("./db");
//const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const csurf = require("csurf");
const redis = require("./redis");
const bc = require("./bc.js");
/////⬇︎put in secret to protect before push to github

app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

app.get("/redis-fun", (req, res) => {
    redis
        .setex(
            "hero",
            30,
            JSON.stringify({
                super_hero: "storm",
                super_power: "weather",
            })
        )
        .then(() => {
            res.redirect("/get-from-redis");
        })
        .catch((err) => console.log("err:", err));
});

app.get("/get-from-redis", (req, res) => {
    redis.get("hero").then((data) => {
        console.log("data from redis: ", JSON.parse(data));
        res.sendStatus(200);
    });
});
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
    // const regExpression = /^[a-zA-Z\s]*$/;
    // const inputAllowed = regExpression.test(first, last, email, password);
    console.log(req.body);
    // if (!inputAllowed) {
    //     res.render("register", {
    //         error: "invalid input", ////  🧐 Can not see error 🧨🧨🧨
    //     });
    // } else {
    if (first != "" && last != "" && email != "" && password != "") {
        /////try to delete
        bc.hash(password)
            .then((hashedPassword) => {
                req.body.password = hashedPassword;
                // console.log("req.body.password", req.body.password);
                ///   const { userId } = req.session;
                ///  console.log("userId: ", userId);
                db.addUserData(first, last, email, hashedPassword)
                    .then((resultUser) => {
                        //console.log("resultUser: ", resultUser);
                        req.session.registered = true;
                        req.session.userId = resultUser.rows[0].id;
                        res.redirect("/profile");
                    })
                    .catch((err) => {
                        console.log("err in post register: ", err);
                        res.send("something went wrong, try one more time");
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
    // } else {
    //     res.redirect("/welcome");
    // }
});
////////////////////////////////// EDIT BLOCK
app.get("/edit", (req, res) => {
    /// req.session.userId = userId;
    const { userId } = req.session;
    db.getSignerData(userId)
        .then((results) => {
            console.log("req.session", req.session);
            let allSigners = results.rows;
            console.log("allSigners", allSigners);
            res.render("edit", {
                layout: "main",
                allSigners,
            });
        })
        .catch((err) => {
            console.log("err in getSigner", err);
        });
});

app.post("/edit", (req, res) => {
    const { userId } = req.session;
    console.log("userId before IF", userId);
    const { first, last, email, password, age, city, homepage } = req.body;
    if (!password) {
        console.log("in the if !pass");
        db.updateUsers(first, last, email, userId)
            .then(() => {
                // res.redirect("/welcome");
                // console.log("userId", userId);
                db.updateProfile(age, city, homepage, userId)
                    .then(() => {
                        res.redirect("/welcome");
                    })
                    .catch((err) => {
                        console.log("err: ", err);
                    });
            })
            .catch((err) => {
                console.log("err upUs: ", err);
            });
    } else {
        console.log("in the else");
        bc.hash(password)
            .then((hashedPassword) => {
                req.body.password = hashedPassword;
                db.updateUsersChangePSW(
                    first,
                    last,
                    email,
                    hashedPassword,
                    userId
                )
                    .then(() => {
                        db.updateProfile(age, city, homepage, userId) ////  🧐 UPDATE IS NOT HAPPENNING 🧨🧨🧨
                            .then(() => {
                                res.redirect("/welcome");
                            })
                            .catch((err) => {
                                console.log("err: ", err);
                            });
                    })
                    .catch((err) => {
                        console.log("err in updWpsw", err);
                    });
            })
            .catch((err) => {
                console.log("err: ", err);
            });
    }
});

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

app.get("/logout", (req, res) => {
    res.render("logout", {
        layout: "main",
    });
});

app.post("/logout", (req, res) => {
    req.session = null;
    console.log("req.body: ", req.body);
    res.redirect("register");
});

////////////////////////////////////////// WELCOME / PETITION BLOCK

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
                //console.log("id", id.rows[0].id); ////////   id
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

app.post("/thanks", (req, res) => {
    const { userId } = req.session;
    //  console.log("user id", req.session.userId);
    // console.log("req.body.signature BEFORE: ", req.body.signature);
    //console.log("req.session.signature Id BEFORE : ", req.session.signatureId);
    db.deleteSig(userId)
        .then(() => {
            req.session.signatureId = null;
            res.redirect("/welcome");
            console.log(
                "req.session.signatureId AFTER: ",
                req.session.signatureId
            );
            console.log(
                "req.body.signature AFTER DELETE: ",
                req.body.signature
            );
        })
        .catch((err) => {
            console.log("err:", err);
        });
});
////////////////////////////////// SIGNERS BLOCK

app.get("/signers", (req, res) => {
    if (req.session.signed) {
        db.getSignersList()
            .then((results) => {
                let allSigners = results.rows;
                ////console.log("allSigners[0].city", allSigners[0].city);
                ////   console.log("results:  ", results);
                let totalNumber = results.rowCount;
                ///// 🧨🧨🧨 COME BACK HERE - FOR SOME REASON IT"S NOT RENDERING LIST OF USERS - DB-QUERY CHECKED
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

///////////////////////////  SIGNERS BY CITY

app.get("/signers/:city", (req, res) => {
    if (req.session.signed) {
        const { city } = req.params;
        db.getSignersByCity(city)
            .then((results) => {
                let allSigners = results.rows;
                //console.log("allSigners", allSigners);
                res.render("signerByCity", {
                    layout: "main",
                    city,
                    allSigners,
                });
            })
            .catch((err) => {
                console.log("err:", err);
            });
    } else {
        //////user didn't sign send ERROR status code permission denied
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

app.listen(process.env.PORT || 8080, () => console.log("server is running..."));
