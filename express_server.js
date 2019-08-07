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

const users = {
  testID: { id: "test", email: "test@test.com", password: "test" }
};

//Function to check if email exists in the users object, return false if it doesn't else return true
const emailChecker = function(users, checkEmail) {
  let result = false;

  for (let user in users) {
    users[user].email === checkEmail ? (result = true) : null;
  }
  return result;
};

const getUser = function(users, parameterCheck, parameter) {
  for (let user in users) {
    if (users[user][parameter] === parameterCheck) return users[user];
  }
  return null;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: getUser(users, req.cookies["user_id"], "id")
  };

  if (templateVars.user) {
    res.render("urls_new", templateVars);
  } else res.redirect("/register");
});

app.get("/urls", (req, res) => {
  let templateVars = {
    user: getUser(users, req.cookies["user_id"], "id"),
    urls: urlDatabase
  };
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
    user: getUser(users, req.cookies["user_id"], "id"),
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
    user: getUser(users, req.cookies["user_id"], "id")
  };
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = {
    user: getUser(users, req.cookies["user_id"], "id")
  };

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
    res.cookie("user_id", randomID);
    res.redirect("/urls");
  }
});

app.post("/login", (req, res) => {
  if (!getUser(users, req.body["email"], "email")) {
    res.status(403).send("Error 403, email does not exist");
  } else if (!getUser(users, req.body["password"], "password")) {
    res.status(403).send("Error 403, wrong password entered");
  } else {
    res.cookie(
      "user_id",
      getUser(users, req.body["password"], "password")["id"]
    );

    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls/");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
