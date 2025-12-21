import express from "express";
import cors from "cors";
import fs from "fs";
import dotenv from "dotenv";
import basicAuth from "./middleware/basicAuth.js";

dotenv.config();

let products = JSON.parse(
  fs.readFileSync("./products.json", "utf-8")
);

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

app.get("/products", (_, res) =>
  res.render("products", { products })
);

app.get("/products/:slug", (req, res) => {
  const product = products.find(p => p.slug === req.params.slug);
  if (!product) {
    return res.status(404).render("404");
  }
  res.render("product", { product });
});

app.get("/order/:slug", (req, res) => {
  const product = products.find(p => p.slug === req.params.slug);
  if (!product) {
    return res.status(404).render("404");
  }
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

app.use((req, res) => {
  res.status(404).render("404");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("server started on", PORT);
});
