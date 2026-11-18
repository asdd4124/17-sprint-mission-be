import express from "express";
import { assert } from "superstruct";
import Product from "../models/product.js";
import BadRequestError from "../exceptions/BadRequestError.js";
import NotFoundError from "../exceptions/NotFoundError.js";
import { CreateProduct, PatchProduct } from "../structs/product.js";

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

// 2. 상품 상세 조회 (GET /products/{productId})
productRouter.get("/:productId", async (req, res) => {
  const product = await Product.findById(req.params.productId).select(
    "name description price tags createdAt",
  );
  if (!product) {
    throw new NotFoundError("상품을 찾을 수 없습니다.");
  }
  res.json(product);
});

// 3. 상품 생성 (POST /products)
productRouter.post("/", async (req, res) => {
  assert(req.body, CreateProduct); // 형식이 틀리면 StructError → 400
  const product = await Product.create(req.body);
  res.status(201).json(product);
});

// 4. 상품 수정 (PATCH /products/{productId})
productRouter.patch("/:productId", async (req, res) => {
  assert(req.body, PatchProduct); // 형식이 틀리면 StructError → 400
  const product = await Product.findByIdAndUpdate(
    req.params.productId,
    req.body,
    { returnDocument: "after" }, // 수정된 상품을 돌려받기
  );
  if (!product) {
    throw new NotFoundError("상품을 찾을 수 없습니다.");
  }
  res.json(product);
});

// 5. 상품 삭제 (DELETE /products/{productId})
productRouter.delete("/:productId", async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.productId);
  if (!product) {
    throw new NotFoundError("상품을 찾을 수 없습니다.");
  }
  res.sendStatus(204);
});

export default productRouter;
