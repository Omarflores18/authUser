const express = require("express");
const app = express();
const PORT = 5000;
const jwt = require("jsonwebtoken");
const session = require("express-session");
const routes = require("./router/friends.js");

// Configura el middleware para analizar JSON
app.use(express.json());

let users = [];

const doesExist = (username) => {
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  if (userswithsamename.length > 0) {
    return true;
  } else {
    return false;
  }
};

const authenticatedUser = (username, password) => {
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
};

 app.use(session({ secret: "fingerpint" }));



app.use("/friends", function auth(req, res, next) {
  if (req.session.authorization) {
    token = req.session.authorization["accessToken"];
    jwt.verify(token, "access", (err, user) => {
      if (!err) {
        req.user = user;
        next();
      } else {
        return res.status(403).json({ message: "User not authenticated" });
      }
    });
  } else {
    return res.status(403).json({ message: "User not logged in" });
  }
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      {
        data: password,
      },
      "access",
      { expiresIn: 60 * 60 }
    );

    req.session.authorization = {
      accessToken,
      username,
    };
    return res.status(200).send("User successfully logged in");
  } else {
    return res
      .status(208)
      .json({ message: "Invalid Login. Check username and password" });
  }
});

app.get("/", (req, res) => {
 res.status(200).send(users);

});

// curl -X POST -H "Content-Type: application/json" -d '{
//   "username": "Omar",
//   "password": 123456
// }' http://localhost:5000/register
// {"message":"User already exists!"}

app.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  console.log("req" + JSON.stringify(req.body));
  console.log("username", username + "password" + password);

  for (let propiedad in req.body) {
    console.log(propiedad + ": " + req.body[propiedad]);
  }

  if (username && password) {
    if (!doesExist(username)) {
      users.push({ username: username, password: password });
      return res
        .status(200)
        .json({ message: "User successfully registred. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({
    message:
      "Unable to register user." + "User " + username + "password " + password,
  });
});

app.use("/friends", routes);

app.listen(PORT, () => console.log("Server is running on PORT " + PORT));
