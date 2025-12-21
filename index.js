import express from "express";
import cors from "cors";
import fs from "fs";
import dotenv from "dotenv";
import basicAuth from "./middleware/basicAuth.js";
import products from "./products.json" assert { type: "json" };

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

// 商品追加
app.post("/admin/add", basicAuth, async (req, res) => {
  const { slug, name, amount, price, image } = req.body;

  try {
    const response = await fetch(
      `https://api.github.com/repos/hatoage-team/hatoage/actions/workflows/main.yml/dispatches`,
      {
        method: "POST",
        headers: {
          "Accept": "application/vnd.github+json",
          "Authorization": `token ${process.env.GITHUB_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ref: "main",
          inputs: {
            action: "add",
            slug,
            name,
            amount,
            price,
            image
          }
        })
      }
    );

    if (!response.ok) {
      console.error(await response.text());
      return res.status(500).send("Failed to trigger GitHub workflow");
    }

    res.send("Product add triggered! Render will redeploy shortly.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error triggering workflow");
  }
});

// 商品削除
app.post("/admin/delete/:slug", basicAuth, async (req, res) => {
  const slug = req.params.slug;

  try {
    const response = await fetch(
      `https://api.github.com/repos/hatoage-team/hatoage/actions/workflows/main.yml/dispatches`,
      {
        method: "POST",
        headers: {
          "Accept": "application/vnd.github+json",
          "Authorization": `token ${process.env.GITHUB_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ref: "main",
          inputs: {
            action: "delete",
            slug
          }
        })
      }
    );

    if (!response.ok) {
      console.error(await response.text());
      return res.status(500).send("Failed to trigger GitHub workflow");
    }

    res.send("Product delete triggered! Render will redeploy shortly.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error triggering workflow");
  }
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log("server started on", PORT);
});
