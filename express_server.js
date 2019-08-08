const {
  userIDfromEmail,
  generateRandomString,
  urlsForUser
} = require("./helpers");
const express = require("express");
const cookieSession = require("cookie-session");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
const bcrypt = require("bcrypt");
const methodOverride = require("method-override");

app.use(
  cookieSession({
    name: "session",
    keys: ["asdsdasdsadas"], //Random keys

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  })
);

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
    urlDate: "test",
    clicks: 0
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
    urlDate: "test",
    clicks: 0
  },
  test1: {
    longURL: "https://www.googlea.ca",
    userID: "test",
    urlDate: "test",
    clicks: 0
  },
  test2: {
    longURL: "https://www.googles.ca",
    userID: "test",
    urlDate: "test",
    clicks: 0
  }
};

const users = {
  testID: {
    id: "test",
    email: "test@test.com",
    password: bcrypt.hashSync("test", 10)
  }
};

app.get("/", (req, res) => {
  let templateVars = {
    user: users[req.session["user_id"]]
  };

  if (templateVars.user) {
    res.render("urls_new", templateVars);
  } else res.redirect("/login");
});

//Directs you to the create a new URL page, if not logged in direct you to the register page
app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.session["user_id"]]
  };

  if (templateVars.user) {
    res.render("urls_new", templateVars);
  } else res.redirect("/register");
});

//Shows you the URLs for your account only
app.get("/urls", (req, res) => {
  let templateVars = {
    user: users[req.session["user_id"]],
    urls: urlsForUser(req.session["user_id"], urlDatabase)
  };

  res.render("urls_index", templateVars);
});

//Creates a new shortURL
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console

  let shortURL = generateRandomString(urlDatabase);

  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session["user_id"],
    urlDate: Date(Date.now()).toString(),
    clicks: 0
  };

  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/Submit", (req, res) => {
  urlDatabase[req.params.shortURL]["longURL"] = req.body.newURL;
  res.redirect("/urls");
});

//Returns the json file of the page
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Deletes the clicked URL if the correct user is logged in
app.use(methodOverride("_method"));
app.delete("/urls/:shortURL/delete", (req, res) => {
  console.log(req.params);
  if (req.session["user_id"] === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL].userID;
    res.redirect(`/urls/`);
  } else {
    console.log("fail");
    res.send("fail");
  }
});

app.use(methodOverride("_method"));
//Post request to edit the URL
app.put("/urls/:url/", (req, res) => {
  let shortURL = req.params.url;
  if (req.session["user_id"] === urlDatabase[req.params.url].userID) {
    res.redirect(`/urls/${shortURL}`);
  } else {
    console.log("fail");
    res.send("fail");
  }
});

//Page after the user creates a short URL showing them the new shortURL and the edit button
app.get("/urls/:shortURL", (req, res) => {
  if (!req.session["user_id"]) {
    res.send("You must be logged in to edit a URL!");
  } else if (!urlDatabase[req.params["shortURL"]]) {
    res.send("Url requested does not exist!");
  } else if (
    urlDatabase[req.params["shortURL"]]["userID"] !== req.session["user_id"]
  ) {
    res.send("You cannot edit someone elses URL!");
  } else {
    let templateVars = {
      user: users[req.session["user_id"]],
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL]["longURL"]
    };
    res.render("urls_show", templateVars);
  }
});

//Redirect link to the page of the URL that has been shortened
app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.send("Site DNE");
  } else {
    const longURL = urlDatabase[req.params.shortURL]["longURL"];

    urlDatabase[req.params.shortURL]["clicks"] += 1;

    res.redirect(longURL);
  }
});

//Register Page
app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.session["user_id"]]
  };
  res.render("urls_register", templateVars);
});

//Login Page
app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.session["user_id"]]
  };

  res.render("urls_login", templateVars);
});

//Register route
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
    let randomID = generateRandomString(users);
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
