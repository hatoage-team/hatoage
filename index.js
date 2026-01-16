import express from "express";
import cors from "cors";
import fs from "fs";
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


app.get("/", (_, res) => res.render("index"));
app.get("/mail", (_, res) => res.render("mail"));
app.get("/manifest.json", (req, res) => {
  res.type("application/manifest+json");
  res.sendFile(process.cwd() + "/public/manifest.json");
});
const API = "https://hatoage.wata777.workers.dev";

app.get("/products", async (_, res) => {
  const products = await fetch(`${API}/items`).then(r => r.json());
  res.render("products", { products });
});

app.get("/products/:slug", async (req, res) => {
  const product = await fetch(
    `${API}/item/${req.params.slug}`
  ).then(r => r.json());

  if (!product) return res.status(404).render("404");
  res.render("product", { product });
});

app.get("/order/:slug", (req, res) => {
  const product = await fetch(
    `${API}/item/${req.params.slug}`
  ).then(r => r.json());

  if (!product) return res.status(404).render("404");
  res.render("order", { product });
});

app.get("/api/products", cors(), (_, res) => {
  res.redirect(301, ${API});

app.get("/admin", basicAuth, (req, res) => {
  res.render("admin", { products });
  });
app.use(express.urlencoded({ extended: true }));

app.post("/admin/products", basicAuth, async (req, res) => {
  const r = await fetch(API + "/products", {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(req.body)
  });
  res.status(r.status).send(await r.text());
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
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log("server started on", PORT);
});
