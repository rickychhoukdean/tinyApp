const { userIDfromEmail } = require("./helpers");
const express = require("express");
const cookieSession = require("cookie-session");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
const bcrypt = require("bcrypt");

app.use(
  cookieSession({
    name: "session",
    keys: ["asdsdasdsadas"], //Random keys

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  })
);

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
//Pulls the correct ID from an object of objects given an email and an object

app.get("/", (req, res) => {
  let templateVars = {
    user: req.session["user_id"]
  };

  if (templateVars.user) {
    res.render("urls_new", templateVars);
  } else res.redirect("/register");
});

//Directs you to the create a new URL page, if not logged in direct you to the register page
app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: req.session["user_id"]
  };

  if (templateVars.user) {
    res.render("urls_new", templateVars);
  } else res.redirect("/register");
});

//Shows you the URLs for your account only
app.get("/urls", (req, res) => {
  let templateVars = {
    user: req.session["user_id"],
    urls: urlsForUser(req.session["user_id"])
  };

  res.render("urls_index", templateVars);
});

//Creates a new shortURL
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console

  let shortURL = generateRandomString();

  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session["user_id"]
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
  if (req.session["user_id"] === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL].userID;
    res.redirect(`/urls/`);
  } else {
    console.log("fail");
    res.send("fail");
  }
});

app.post("/urls/:url/", (req, res) => {
  let shortURL = req.params.url;

  if (req.session["user_id"] === urlDatabase[req.params.shortURL].userID) {
    res.redirect(`/urls/${shortURL}`);
  } else {
    console.log("fail");
    res.send("fail");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    user: req.session["user_id"],
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
    user: req.session["user_id"]
  };
  res.render("urls_register", templateVars);
});

//Login Page
app.get("/login", (req, res) => {
  let templateVars = {
    user: req.session["user_id"]
  };

  res.render("urls_login", templateVars);
});

//Regist route
app.post("/register", (req, res) => {
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (
    !req.body.email ||
    !req.body.password ||
    userIDfromEmail(req.body.email, users)
  ) {
    res.status(400);
    res.send("None shall pass");
  } else {
    let randomID = generateRandomString();
    users[randomID] = {
      id: randomID,
      email: req.body.email,
      password: hashedPassword
    };
    req.session["user_id"] = randomID;
    res.redirect("/urls");
  }
});

//Login route
app.post("/login", (req, res) => {
  let desiredID = userIDfromEmail(req.body["email"], users);
  console.log(userIDfromEmail);
  if (!(userIDfromEmail(req.body["email"]), users)) {
    res.status(403).send("Error 403, email does not exist");
  } else if (
    !bcrypt.compareSync(req.body["password"], users[desiredID]["password"])
  ) {
    res.status(403).send("Error 403, wrong password entered");
  } else {
    req.session["user_id"] = desiredID;
    res.redirect("/urls");
  }
});
//Logout route
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls/");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
