const express = require("express");
const router = express.Router();
const db = require("./db");

//////////////////////////////////pROFILE BLOCK
router.get("/profile", (req, res) => {
    res.render("profile", {
        layout: "main",
    });
});

router.post("/profile", (req, res) => {
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
router.get("/edit", (req, res) => {
    /// req.session.userId = userId;
    const { userId } = req.session;

    db.getSignersData(userId).then((results) => {
        console.log("req.session", req.session);
        let allSigners = results.rows;
        console.log("allSigners", allSigners);
        res.render("edit", {
            layout: "main",
            allSigners,
        });
    });
});

router.post("/edit", (req, res) => {});

exports.router = router;
