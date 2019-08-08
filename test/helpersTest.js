const { assert } = require("chai");

const {
  userIDfromEmail,
  generateRandomString,
  urlsForUser
} = require("../helpers.js");

const testUsers = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

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
    userID: "userRandomID",
    urlDate: "test",
    clicks: 0
  },
  test2: {
    longURL: "https://www.googles.ca",
    userID: "userRandomID",
    urlDate: "test",
    clicks: 0
  }
};

describe("getUserByEmail", function() {
  it("should return a user with valid email", function() {
    const user = userIDfromEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput);
  });
  it("should return undefined if given an email that is not in our database", function() {
    const user = userIDfromEmail("userdsadasd@example.com", testUsers);
    assert.isUndefined(user, "Not defined");
  });
});

describe("urlsForUser", function() {
  it("should return the correct urls for the given user and database", function() {
    const urls = urlsForUser("userRandomID", urlDatabase);
    const expectedOutput = {
      test1: {
        longURL: "https://www.googlea.ca",
        userID: "userRandomID",
        urlDate: "test",
        clicks: 0
      },
      test2: {
        longURL: "https://www.googles.ca",
        userID: "userRandomID",
        urlDate: "test",
        clicks: 0
      }
    };
    assert.deepEqual(urls, expectedOutput);
  });
  it("should return an empty object if the the user has no urls", function() {
    const urls = urlsForUser("doesntexist", urlDatabase);
    const expectedOutput = {};
    assert.deepEqual(urls, expectedOutput);
  });
});

describe("generateRandomString", function() {
  it("should return a string with the length of 5", function() {
    let str = generateRandomString(urlDatabase);
    let length = str.length;
    const expectedOutput = 6;
    assert.equal(length, expectedOutput);
  });
});
