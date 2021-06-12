import express from "express";
let app = express();
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { nanoid } from "nanoid";
import lodash from "lodash";
const idLength = 8;

// import db from './db.js';
// import userRoute from './routes/user.route.js';

// app.use('/', userRoute);

import { LowSync, JSONFileSync } from "lowdb";
const db = new LowSync(new JSONFileSync("db.json"));

db.read();

if (!db.data) {
  db.data = { users: [] };
  db.write();
}

let port = 3000;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// parse application/json
app.use(bodyParser.json());

app.set("view engine", "pug");
app.set("views", "./views");

app.get("/", function (req, res) {
  res.render("index");
});

// app.get('/test', function(req, res) {
// 	res.render('user/logIn');
// });

app.get("/users/signUp", function (req, res) {
  res.render("user/create");
});

app.post("/users/signUp", function (req, res) {
  req.body.id = nanoid(idLength);
  // console.log(req.body);
  let errors = [];
  if (!req.body.email) {
    errors.push("Email is required");
  }

  if (!req.body.password) {
    errors.push("Password is required");
  }

  if (!req.body.repass) {
    errors.push("You have to repeat password");
  }

  if (!req.body.nick) {
    errors.push("Nickname is required");
  }

  if (errors.length) {
    res.render("user/create", {
      errors: errors,
      values: req.body,
    });
    return;
  }

  // console.log('bas');

  if (req.body.password === req.body.repass) {
    db.data.users.push(req.body);
    db.write();
    res.send(
      '<script>alert("Sign Up successfully !"); window.location.href = "/users/signIn";</script>'
    );
  } else {
    errors.push("The repeated password is not correct");
    res.render("user/create", {
      errors: errors,
      values: req.body,
    });
    return;
  }
});

app.get("/users/signIn", function (req, res) {
  res.render("user/signIn");
});

app.post("/users/signIn", function (req, res) {
  let errors = [];
  let email = req.body.email;
  let password = req.body.password;

  if (!email) {
    errors.push("Email is required");
  }

  if (!password) {
    errors.push("Password is required");
  }

  if (errors.length) {
    res.render("user/signIn", {
      errors: errors,
      values: req.body,
    });
    return;
  }

  let user = db.data.users.find(function (user) {
    return user.email === email;
  });

  if (!user) {
    // Wrong email
    errors.push("User not found!");
    res.render("user/signIn", {
      errors: errors,
      values: req.body,
    });
    return;
  } else {
    if (user.password !== password) {
      // Wrong password
      errors.push("Wrong password");
      res.render("user/signIn", {
        errors: errors,
        values: req.body,
      });
      return;
    } else {
      // found user
      res.send(
        '<script>alert("Log In successfully !"); window.location.href = "/users/signIn";</script>'
      );
    }
  }
});

app.get("/play", function (req, res) {
  const user = {
    name: "Nam Do",
  };

  res.render("game/play", { ...user });
});

app.get("/leaderboard", (req, res) => {
  res.render("game/leaderboard");
});

app.get("/update-user-info", (req, res) => {
  res.render("user/update-user");
});

app.listen(port, function () {
  console.log("Server listening on port " + port);
});
