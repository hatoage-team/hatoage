import express from "express";
import products from "./products.json" assert { type: "json" };
import basicAuth from "./middleware/basicAuth.js";

const app = express();
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.static("public"));

app.get("/", (_, res) => res.render("index"));
app.get("/mail", (_, res) => res.render("mail"));

app.get("/religion/:page?", (req, res) => {
  const page = req.params.page ?? "index";
  res.render(`religion/${page}`);
});

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

app.get("/api/products", (_, res) => res.json(products));

app.get("/admin", basicAuth, (req, res) => {
  res.render("admin", { products });
  });
app.listen(3000);
