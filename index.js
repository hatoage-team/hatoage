import express from "express";
import dotenv from "dotenv";

import products from "./routes/products.js";
import order from "./routes/order.js";
import api from "./routes/api.js";
import admin from "./routes/admin.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.static("public"));

app.use("/products", products);
app.use("/order", order);
app.use("/api", api);
app.use("/admin", admin);

// topは静的そのまま
app.get("/", (_, res) => {
  res.sendFile(new URL("./public/index.html", import.meta.url));
});

app.listen(3000, () => {
  console.log("🐦 Hatoage site → http://localhost:3000");
});
