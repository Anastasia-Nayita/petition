const express = require("express");
const app = express();
const handlebars = require("express-handlebars");
const db = require("./db");

app.engine("handlebars", handlebars());
app.set("view engine", "handlebars");

app.use(express.static("./public"));

app.get("/", (req, res) => {
    //  console.log("get request / just happen");
    res.render("welcome", {
        layout: "main",
    });
});

// use Middleware from EXPRESS, console.log(req.body) use post req//

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

// app.get("/cities", (req, res) => {
//     db.getCities()
//         .then((results) => {
//             console.log("results: ", results);
//         })
//         .catch((err) => {
//             console.log("err:", err);
//         });
// });

// //////// to change database we need to POST
// app.post("/add-city", (req, res) => {
//     db.addCity("Quito", 1000, "Ecuador")
//         .then(() => {
//             console.log("yey it worked");
//         })
//         .catch((err) => {
//             console.log("err in addCity", err);
//         });
// });

app.listen(8080, () => console.log("server is running🏃🏻‍♀️..."));
