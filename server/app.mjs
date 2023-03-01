import express from "express";
import morgan from "morgan";
import cors from "cors";
import { join, dirname } from "node:path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import * as jwtJsDecode from "jwt-js-decode";
// import https from "node:https";
// import fs from "node:fs";
import { config } from "dotenv";
import JWT from "jsonwebtoken";
import nodeMailer from "nodemailer";

config();
const filePath = dirname(fileURLToPath(import.meta.url));
const file = join(filePath, "db.json");
const adapter = new JSONFile(file);
const db = new Low(adapter);

db.data ||= { users: [] };

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const secret = process.env.SECRET;
const jwtOptions = {
  expiresIn: "5m",
};

// gets user's token from the front-end and calls auth fxn

const isAuthenticated = (req, res) => {
  const { jwt } = req.query;
  console.log(req.query);
  if (!jwt) {
    return res.status(403).send("Forbidden");
  }
  let decoded;
  try {
    decoded = JWT.verify(jwt, secret);
  } catch (err) {
    return res.status(403).send("Forbidden");
  }

  if (!decoded.email) {
    return res.status(403).send("Forbidden");
  }

  // add conditional logic to handle what if token expires
  if (decoded.expireTime < new Date()) {
    return res.status(403).send("Forbidden");
  }

  res.status(200).send("User valildated");
};

//set up email
const transport = nodeMailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: `${process.env.EMAIL}`,
    pass: `${process.env.APP_SECRET}`,
  },
});

// Make email template for magic link
const emailTemplate = ({ username, link }) => `
 <h2>${username}</h2>
 <p>Here's the login link you just requested: </p>
 <p>${link}</p>
`;

const generateLoginJWT = (user) => {
  const expireTime = Date.now();
  expireTime.setMinutes(new Date().getMinutes + 5);
  const token = JWT.sign({ email: user.email, expireTime }, secret, jwtOptions);
  return token;
};

function findUser(email) {
  const results = db.data.users.filter((user) => user.email === email);
  if (results.length === 0) return null;
  return results[0];
}

app.post("/auth/login", (req, res) => {
  try {
    const user = findUser(req.body.email);
    if (user) {
      if (bcrypt.compareSync(req.body.password, user.password)) {
        res.send({
          ok: true,
          email: user.email,
          name: user.name,
          statusCode: 200,
        });
      } else {
        res.send({ ok: false, message: "Data is invalid" });
      }
    }
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

app.post("/auth/register", (req, res) => {
  try {
    const salt = bcrypt.genSaltSync(10);
    console.log(req.body);
    const hash = bcrypt.hashSync(req.body.password, salt);

    const user = {
      name: req.body.name,
      email: req.body.email,
      password: hash,
    };

    const userFound = findUser(req.body.email);

    if (userFound) {
      res.send({ ok: false, message: "User already exists" });
    } else {
      db.data.users.push(user);
      db.write();
      res.send({ ok: true });
    }
  } catch (e) {
    res.status(500).send();
  }
});

app.post("/auth/login-google", (req, res) => {
  // Decode the JWT from Google OAuth login
  let { credential } = req.body;
  credential.credential;
  let token = jwtJsDecode.jwtDecode(credential.credential);

  // Make a user object and pick info from Token's payload
  let user = {
    email: token.payload.email,
    name: token.payload.given_name,
    password: false,
  };

  // Find a existing user if possible
  const userFound = findUser(user.email);

  // check if there is an existing user
  if (userFound) {
    // make a new google prop on the user and set it to the token's aud prop
    user.google = token.payload.aud;
    // save/write it to the db
    db.write();
    // send a response with non-vulnerable user credentials
    res.send({ ok: true, name: user.name, email: user.email });
  } else {
    // else create a new user in the db
    db.data.users.push({
      // copy the user object
      ...user,
      // add a google key with aud from the jwt as its value
      google: token.payload.aud,
    });
  }
});

app.post("/auth/magicLink", async (req, res) => {
  try {
    const existingUser = findUser(req.body.email);

    const newUser = {
      email: req.body.email,
      name: req.body.name,
      password: false,
    };

    // user inputs email and check if user exists
    if (existingUser) {
      // send email containing magic link
      const magicToken = generateLoginJWT(existingUser);
      // add a new 5 minute living magicToken prop to an existing user and save to the DB
      existingUser.magicToken = magicToken;
      db.write();

      const magicLink = `http://localhost:${PORT}/account?jwt=${magicToken}`;

      const mailOptions = {
        from: `${process.env.EMAIL}`,
        html: emailTemplate({
          username: existingUser.email,
          link: magicLink,
        }),
        subject: "Your Magic Fast Pass for Wizknee land",
        to: existingUser.email,
      };

      res.send(magicToken);

      return transport.sendMail(mailOptions, (err) => {
        if (err) {
          res.status(404).send();
        } else {
          res.status(200).send(`Magic Link Sent to ${magicLink}`);
        }
      });
    } else {
      console.log("new user is being added");

      db.data.users.push({
        ...newUser,
        magicToken: JWT.sign({ email: newUser.email }, secret, {
          expiresIn: "5m",
        }),
      });
      // db.write();

      let { email, magicToken } = db.data.users[0];

      const magicLink = `http://localhost:${PORT}/account?jwt=${magicToken}`;

      const mailOptions = {
        from: "kheyyon.parker@gmail.com",
        html: emailTemplate({
          username: email,
          link: magicLink,
        }),
        subject: "Your Magic Fast Pass for Wizknee land",
        to: email,
      };

      return transport.sendMail(mailOptions, (err) => {
        if (err) {
          res.status(404).send();
        } else {
          res.status(200).send(`Magic Link Sent to ${magicLink}`);
        }
      });
    }
  } catch (e) {
    res.status(500).send();
  }
});

app.get("/account", (req, res) => {
  console.log(req.query.token);
  isAuthenticated(req, res);
});

app.get("/", (req, res) => {
  console.log("hello");
  res.send("hi");
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
