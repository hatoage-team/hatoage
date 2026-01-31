import express from "express";
import cors from "cors";
import fs from "fs";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import basicAuth from "./middleware/basicAuth.js";

dotenv.config();

const app = express();
app.set("view engine", "ejs");
app.set("trust proxy", 1);
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.set("trust proxy", 1);
process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

const jsonHeaders = () => ({
  "Content-Type": "application/json",
  "Accept": "application/json"
});

app.get("/", (_, res) => res.render("index"));
app.get("/manifest.json", (req, res) => {
  res.type("application/manifest+json");
  res.sendFile(process.cwd() + "/public/manifest.json");
});
const API = "https://hatoage.wata777.workers.dev";

app.get("/products", async (_, res) => {
  const product = await fetch(`${API}`).then(r => r.json());
  res.render("products", { product });
});

app.get("/products/:slug", async (req, res) => {
  const product = await fetch(
    `${API}/item/${req.params.slug}`
  ).then(r => r.json());

  if (!product) return res.status(404).render("404");
  res.render("product", { product });
});

app.get("/order/:slug", async (req, res) => {
  const product = await fetch(
    `${API}/item/${req.params.slug}`
  ).then(r => r.json());

  if (!product) return res.status(404).render("404");
  res.render("order", { product });
});

app.get("/api/products", cors(), (_, res) => {
  res.redirect(301, `${API}`);
  });

const WORKERS_MAIL = "https://hatoage.wata777.workers.dev/mail";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

app.get("/mail", (req, res) => {
  res.render("mail", { state: "input" });
});

app.post("/mail", async (req, res) => {
  try {
    const r = await fetch(WORKERS_MAIL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Key": process.env.INTERNAL_KEY
      },
      body: JSON.stringify(req.body)
    });

    const data = await r.json();

    if (data.state === "otp_issued" && data.otp) {
      let html = fs.readFileSync("./mailer/otp.html", "utf8");
      html = html.replace("{{OTP}}", data.otp);

      await transporter.sendMail({
        to: req.body.email,
        subject: "【はとあげメール】認証コード",
        html
      });
    }

    res.render("mail", data);
  } catch (e) {
    res.render("mail", {
      state: "error",
      message: e.message
    });
  }
});

app.get("/admin", basicAuth, async (req, res) => {
  const product = await fetch(
    `${API}/`
    ).then(r => r.json());

  res.render("admin", { product });
  });
app.use(express.urlencoded({ extended: true }));

app.post("/admin/products", basicAuth, async (req, res) => {
  const r = await fetch(API + "/products", {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(req.body)
  });
  res.status(r.status).send(await r.text());
  setTimeout(() => {
    res.redirect('/admin');
  }, 2500);
});
  
app.put("/admin/products/:slug", basicAuth, async (req, res) => {
  const r = await fetch(API + "/products", {
    method: "PUT",
    headers: jsonHeaders(),
    body: JSON.stringify({
      slug: req.params.slug,
      ...req.body
    })
  });
  res.status(r.status).send(await r.text());
  setTimeout(() => {
    res.redirect('/admin');
  }, 2500);
});

app.patch("/admin/products/:slug", basicAuth, async (req, res) => {
  const r = await fetch(API + "/products", {
    method: "PATCH",
    headers: jsonHeaders(),
    body: JSON.stringify({
      slug: req.params.slug,
      ...req.body
    })
  });
  res.status(r.status).send(await r.text());
  setTimeout(() => {
    res.redirect('/admin');
  }, 2500);
});

app.delete("/admin/products/:slug", basicAuth, async (req, res) => {
  const r = await fetch(API + "/products", {
    method: "DELETE",
    headers: jsonHeaders(),
    body: JSON.stringify({
      slug: req.params.slug
    })
  });
  res.status(r.status).send(await r.text());
  setTimeout(() => {
    res.redirect('/admin');
  }, 2500);
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log("server started on", PORT);
});
