const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
const bcrypt = require('bcrypt');
const password = "purple-monkey-dinosaur"; // found in the req.params object
const hashedPassword = bcrypt.hashSync(password, 10);

//Random alphanumeric generator for urlDatabase and users
let generateRandomString = function() {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  if (!urlDatabase[result] && !users[result]) {
    return result;
  } else {
    generateRandomString(); //If the randomly generated string already exists then run again
  }
};

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
  test1: { longURL: "https://www.googlea.ca", userID: "test" },
  test2: { longURL: "https://www.googles.ca", userID: "test" }
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

//Function to check if a given value in an object is equivalent to the object inside the user
const getUser = function(users, parameterCheck, parameter) {
  for (let user in users) {
    if (users[user][parameter] === parameterCheck) return users[user];
  }
  return null;
};

//Get the urls for the specific user inputted
const urlsForUser = function(id) {
  let result = {};

  for (let url in urlDatabase) {
    if (id === urlDatabase[url].userID) {
      result[url] = urlDatabase[url];
    }
  }
  return result;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

//Directs you to the create a new URL page, if not logged in direct you to the register page
app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: getUser(users, req.cookies["user_id"], "id")
  };

  if (templateVars.user) {
    res.render("urls_new", templateVars);
  } else res.redirect("/register");
});

//Shows you the URLs for your account only
app.get("/urls", (req, res) => {
  let templateVars = {
    user: getUser(users, req.cookies["user_id"], "id"),
    urls: urlsForUser(req.cookies["user_id"])
  };

  getUser(users, req.cookies["user_id"]);
  res.render("urls_index", templateVars);
});

//Creates a new shortURL
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies["user_id"]
  };

  res.redirect(`/urls/${shortURL}`);
});

// app.post("/urls/:shortURL/Submit", (req, res) => {
//   urlDatabase[req.params.shortURL] = req.body.newURL;
//   res.redirect("/urls");
// }); I think this is useless

//Returns the json file of the page
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Deletes the clicked URL if the correct user is logged in
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.cookies["user_id"] === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL].userID;
    res.redirect(`/urls/`);
  } else {
    console.log("fail");
    res.send("fail");
  }
});

app.post("/urls/:url/", (req, res) => {
  let shortURL = req.params.url;

  if (req.cookies["user_id"] === urlDatabase[req.params.shortURL].userID) {
    res.redirect(`/urls/${shortURL}`);
  } else {
    console.log("fail");
    res.send("fail");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    user: getUser(users, req.cookies["user_id"], "id"),
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]["longURL"]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]["longURL"];
  res.redirect(longURL);
});

//Register Page
app.get("/register", (req, res) => {
  let templateVars = {
    user: getUser(users, req.cookies["user_id"], "id")
  };
  res.render("urls_register", templateVars);
});

//Login Page
app.get("/login", (req, res) => {
  let templateVars = {
    user: getUser(users, req.cookies["user_id"], "id")
  };

  res.render("urls_login", templateVars);
});

//Regist route
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

//Login route
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
//Logout route
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls/");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
