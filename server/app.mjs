import express from "express";
import morgan from "morgan";
import cors from "cors";
import { join, dirname } from "node:path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import https from "node:https";
import fs from "node:fs";

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

function findUser(email) {
  const results = db.data.users.filter((user) => user.email === email);
  if (results.length === 0) return null;
  return results[0];
}

app.post("/auth/login", (req, res) => {
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
});

app.post("/auth/register", (req, res) => {
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
});

app.get("/", (req, res) => {
  console.log("hello");
  res.send("hi");
});

const options = {
  key: fs.readFileSync("localhost-key.pem"),
  cert: fs.readFileSync("localhost.pem"),
};

https.createServer(options, app).listen(PORT, () => {
  console.log(`https://localhost:${PORT}`);
});
