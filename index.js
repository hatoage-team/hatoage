import express from "express";
import cors from "cors";
import fs from "fs";
import dotenv from "dotenv";
import products from "./products.json" with { type: "json" };
import basicAuth from "./middleware/basicAuth.js";

dotenv.config();

const app = express();
app.set("view engine", "ejs");
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.get("/", (_, res) => res.render("index"));
app.get("/mail", (_, res) => res.render("mail"));

app.get("/products", (_, res) =>
  res.render("products", { products })
);

app.get("/products/:name", (req, res) => {
  const product = products.find(p => p.name === req.params.name);
  if (!product) return res.status(404).send("Not found");
  res.render("product", { product });
});

app.get("/order/:item", (req, res) => {
  const product = products.find(p => p.name === req.params.item);
  if (!product) return res.status(404).send("Not found");
  res.render("order", { product });
});

app.get("/api/products", cors(), (_, res) => res.json(products));

app.get("/admin", basicAuth, (req, res) => {
  res.render("admin", { products });
  });
app.use(express.urlencoded({ extended: true }));

app.post("/admin/add", basicAuth, (req, res) => {
  const { slug, name, amount, price, image } = req.body;

  products.push({
    slug,
    name,
    amount,
    price: Number(price),
    image
  });

  fs.writeFileSync("products.json", JSON.stringify(products, null, 2));
  res.redirect("/admin");
});

app.post("/admin/delete/:slug", basicAuth, (req, res) => {
  const slug = req.params.slug;
  products = products.filter(p => p.slug !== slug);

  fs.writeFileSync("products.json", JSON.stringify(products, null, 2));
  res.redirect("/admin");
});

app.listen(3000);
