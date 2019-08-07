const { assert } = require("chai");

const { userIDfromEmail } = require("../helpers.js");

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
