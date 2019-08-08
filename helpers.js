const userIDfromEmail = function(email, database) {
  for (let user in database) {
    if (email === database[user].email) return user;
  }
};

//Random alphanumeric generator for urlDatabase and users
let generateRandomString = function(data) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  if (!data[result]) {
    return result;
  } else {
    generateRandomString(); //If the randomly generated string already exists then run again
  }
};

//Get the urls for the specific user inputted
const urlsForUser = function(id, database) {
  let result = {};

  for (let url in database) {
    if (id === database[url].userID) {
      result[url] = database[url];
    }
  }
  return result;
};


module.exports = {userIDfromEmail, generateRandomString, urlsForUser };
