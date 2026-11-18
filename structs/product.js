import {
  array,
  min,
  number,
  object,
  optional,
  size,
  string,
} from "superstruct";

// 상품 생성 값 검사 (프론트 유효성 검사 규칙과 동일)
export const CreateProduct = object({
  name: size(string(), 1, 10),
  description: size(string(), 10, 100),
  price: min(number(), 0),
  tags: optional(array(size(string(), 1, 5))),
});
