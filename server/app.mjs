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
    res.status(403).send({ ok: false, msg: "Forbidden" });
  }
  let decoded;
  try {
    decoded = JWT.verify(jwt, secret);
  } catch (err) {
    res.status(403).send({ ok: false, msg: "Forbidden" });
  }

  if (!decoded.email) {
    res.status(403).send({ ok: false, msg: "Forbidden" });
  }

  // add conditional logic to handle what if token expires
  console.log(decoded);
  if (decoded.expireTime < new Date()) {
    res.status(403).send({ ok: false, msg: "Forbidden" });
  }

  res.status(200).json({ ok: true, msg: "done", decoded });
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
  const expireTime = new Date();
  expireTime.setMinutes(new Date().getMinutes() + 5);
  const token = JWT.sign(
    { email: user.email, name: user.name, expireTime },
    secret,
    jwtOptions
  );
  return token;
};

function findUser(email) {
  const results = db.data.users.filter((user) => user.email === email);
  if (results.length === 0) return null;
  return results[0];
}

// app.get("/account", (req, res) => {
//   console.log(req.query.token);
//   // send a JWT back with a msg
//   isAuthenticated(req, res);
// });

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

app.post("/auth/register", async (req, res) => {
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
      // currentUsers.push(user);
      // db.data.users = currentUsers;
      // db.assignwrite();
      const { name, email, password } = user;
      db.data.users.push({ name, email, password });
      await db.write();
      res.send({ ok: true });
    }
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

app.post("/auth/login-google", async (req, res) => {
  // Decode the JWT from Google OAuth login
  let { credential } = req.body;
  credential.credential;
  let token = jwtJsDecode.jwtDecode(credential.credential);

  // Make a user object and pick info from Token's payload
  let user = {
    email: token.payload.email,
    name: token.payload.given_name,
    password: false,
    google: token.payload.aud,
  };

  // Find a existing user if possible
  const userFound = findUser(user.email);

  // check if there is an existing user
  if (userFound) {
    // make a new google prop on the user and set it to the token's aud prop
    user.google = token.payload.aud;
    // save/write it to the db - replaces the entire db with this entire
    await db.write();
    // send a response with non-vulnerable user credentials
    res.send({ ok: true, name: user.name, email: user.email });
  } else {
    const { email, name, password, google } = user;
    // else create a new user in the db
    db.data.users.push({ email, name, password, google });
    await db.write();
  }
});

app.post("/auth/magicLink", async (req, res) => {
  const { email, name } = req.body;
  console.log(req);
  // res.status(201).json({ info: { email, name } });
  try {
    const existingUser = findUser(email);

    const newUser = {
      email,
      name,
      password: false,
    };

    // user inputs email and check if user exists
    if (existingUser) {
      console.log("this is an existing user");
      // send email containing magic link
      const magicToken = generateLoginJWT(existingUser);
      // add a new 5 minute living magicToken prop to an existing user and save to the DB

      // existingUser.magicToken = magicToken;
      db.data.users.push({
        ...existingUser,
        magicToken,
      });
      db.write();

      // const magicLink = `http://localhost:${PORT}/account?jwt=${magicToken}`;

      const magicLink = `http://localhost:${5173}/login?jwt=${magicToken}`;

      const mailOptions = {
        from: `${process.env.EMAIL}`,
        html: emailTemplate({
          username: existingUser.email,
          link: magicLink,
        }),
        subject: "Your Magic Fast Pass for Wizknee land",
        to: existingUser.email,
      };

      return transport.sendMail(mailOptions, (err) => {
        if (err) {
          res.status(404).send();
        } else {
          res.status(200).json({
            msg: "validating user email -  check email for a link from Wizknee",
          });
        }
      });
    } else {
      console.log("new user is being added to db");
      // user is not written into DB

      try {
        db.data.users.push({
          ...newUser,
          magicToken: JWT.sign(
            { email: newUser.email, name: newUser.name },
            secret,
            { expiresIn: "5m" }
          ),
        });
        db.write();
      } catch (error) {
        res.status(404).json({ msg: error.message });
      }

      let { email, magicToken } = db.data.users[0];

      console.log(magicToken);

      // const magicLink = `http://localhost:${PORT}/account?jwt=${magicToken}`;
      const magicLink = `http://localhost:${5173}/login?jwt=${magicToken}`;

      const mailOptions = {
        from: `${process.env.EMAIL}`,
        html: emailTemplate({
          username: email,
          link: magicLink,
        }),
        subject: "Your Magic Fast Pass for Wizknee land",
        to: email,
      };

      return transport.sendMail(mailOptions, (err) => {
        if (err) {
          res.status(404).json({ msg: err.message });
        } else {
          res.status(200).json({
            msg: "Check your email for a link from Wizknee. It may be in spam so be aware",
          });
        }
      });
    }
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

app.get("/account", (req, res) => {
  console.log(req.query.token);
  // send a JWT back with a msg
  isAuthenticated(req, res);
  console.log(isAuthenticated(req, res));
});

app.get("/", (req, res) => {
  console.log("hello");
  res.send("hi");
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
