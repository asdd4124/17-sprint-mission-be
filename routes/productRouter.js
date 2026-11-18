import express from "express";
import { assert } from "superstruct";
import Product from "../models/product.js";
import { CreateProduct } from "../structs/product.js";

const productRouter = express.Router();

// 3. 상품 생성 (POST /products)
productRouter.post("/", async (req, res) => {
  assert(req.body, CreateProduct); // 형식이 틀리면 StructError → 400
  const product = await Product.create(req.body);
  res.status(201).json(product);
});

export default productRouter;
