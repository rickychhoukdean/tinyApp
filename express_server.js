const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

let generateRandomString = function() {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  if (!urlDatabase[result] && !users[result]) {
    //If the randomly generated string already exists then run again
    return result;
  } else {
    generateRandomString();
  }
};

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {};

//Function to check if email exists in the users object, return false if it doesn't else return true
const emailChecker = function(users, checkEmail) {
  let result = false;

  for (let user in users) {
    users[user].email === checkEmail ? (result = true) : null;
  }
  return result;
};

const getUser = function(users, userID) {
  for (let user in users) {
    if (users[user].id === userID) return users[user];
  }
  return null;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: getUser(users, req.cookies["user_id"])
  };
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = {
    user: getUser(users, req.cookies["user_id"]),
    urls: urlDatabase
  };
  console.log(getUser(users, req.cookies["user_id"]), "hi");
  getUser(users, req.cookies["user_id"]);
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`); // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:shortURL/Submit", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.newURL;
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls/`);
});

app.post("/urls/:url/", (req, res) => {
  let shortURL = req.params.url;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    user: getUser(users, req.cookies["user_id"]),
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  let templateVars = {
    user: getUser(users, req.cookies["user_id"])
  };
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = {
    user: getUser(users, req.cookies["user_id"])
  };

  if (!getUser(users, req.body["user_id"])) {
    // return console.log("email does not exist");
    res.status(400);
    res.send("None shall pass");
  } else if (
    getUser(users, req.body["user_id"].password !== req.body["password"])
  ) {
    // return console.log("password does not match");
    res.status(400);
    res.send("None shall pass");
  } else {
    res.redirect("/urls");
  }

  res.render("urls_login", templateVars);
});

app.post("/register", (req, res) => {
  if (
    !req.body.email ||
    !req.body.password ||
    emailChecker(users, req.body.email)
  ) {
    res.status(400);
    res.send("None shall pass");
  } else {
    let randomID = generateRandomString();
    users[randomID] = {
      id: randomID,
      email: req.body.email,
      password: req.body.password
    };
    console.log(users);
    res.cookie("user_id", randomID);
    res.redirect("/urls");
  }
});

app.post("/login", (req, res) => {
  // res.cookie("username", req.body.username);
  res.redirect("/urls/");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls/");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
