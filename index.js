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
  db.data.records = [];
  db.write();
}

let port = 3000;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

// parse application/json
app.use(bodyParser.json());

app.set("view engine", "pug");
app.set("views", "./views");
app.locals.basedir = "./views/components";

function auth(req, res, next) {
  if (!req.cookies.userId) {
    res.redirect("/users/signIn");
    return;
  }

  let user = db.data.users.find(function (user) {
    return user.id === req.cookies.userId;
  });

  if (!user) {
    res.redirect("/users/signIn");
    return;
  }

  next();
}

app.post("/save-game", function (req, res) {
  const score = req.body.score;
  let date = new Date().toLocaleString();
  req.body.date = date;
  req.body.userId = req.cookies.userId;
  // console.log(req.body);

  db.data.records.push(req.body);
  db.write();
});

app.get("/", function (req, res) {
  res.render("index");
});

app.get("/users/signUp", function (req, res) {
  if (req.cookies.userId) {
    res.clearCookie("userId");
  }
  res.render("user/create");
});

app.post("/users/signUp", function (req, res) {
  req.body.id = nanoid(idLength);
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
  if (req.cookies.userId) {
    res.clearCookie("userId");
  }
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
      res.cookie("userId", user.id);
      res.render("index");
    }
  }
});

app.get("/play", auth, function (req, res) {
  let user = db.data.users.find(function(user) {
    return user.id = req.cookies.userId;
  });

  // const user = {
  //   name: "Nam Do",
  // };

  res.render("game/play", {
    name: user.nick
  });
});

app.get("/leaderboard", auth, (req, res) => {
  res.render("game/leaderboard");
});

app.get("/update-user-info", auth, (req, res) => {
  res.render("user/update-user");
});

app.get("/play-history", auth, (req, res) => {
  res.render("user/play-history");
});

app.listen(port, function () {
  console.log("Server listening on port " + port);
});
