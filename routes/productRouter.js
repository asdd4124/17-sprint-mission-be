import express from "express";
import { assert } from "superstruct";
import Product from "../models/product.js";
import BadRequestError from "../exceptions/BadRequestError.js";
import { CreateProduct } from "../structs/product.js";

const productRouter = express.Router();

// 1. 상품 목록 조회 (GET /products)
productRouter.get("/", async (req, res) => {
  const page = Number(req.query.page ?? 1);
  const pageSize = Number(req.query.pageSize ?? 10);
  const keyword = String(req.query.keyword ?? "");

  // 1 이상의 정수인지 확인
  const isPositiveInteger = (value) => Number.isInteger(value) && value >= 1;
  if (!isPositiveInteger(page) || !isPositiveInteger(pageSize)) {
    throw new BadRequestError("page와 pageSize는 1 이상의 정수여야 합니다.");
  }

  // 검색어의 특수문자를 일반 글자로 취급 (예: "c++")
  const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const keywordRegex = new RegExp(escapedKeyword, "i"); // 대소문자 구분 없음

  // 이름 또는 설명에 검색어 포함 (검색어가 없으면 전체)
  const filter = {
    $or: [{ name: keywordRegex }, { description: keywordRegex }],
  };

  const [list, totalCount] = await Promise.all([
    Product.find(filter)
      .sort({ createdAt: -1 }) // 최신순 (recent)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .select("name price createdAt"),
    Product.countDocuments(filter),
  ]);

  res.json({ list, totalCount });
});

// 3. 상품 생성 (POST /products)
productRouter.post("/", async (req, res) => {
  assert(req.body, CreateProduct); // 형식이 틀리면 StructError → 400
  const product = await Product.create(req.body);
  res.status(201).json(product);
});

export default productRouter;
