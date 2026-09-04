import express from "express";
import addToCart from "../../controller/cart/add-to-cart.js";
import getUserCart from "../../controller/cart/get-user-cart.js";
import updateCart from "../../controller/cart/update-cart.js";
import clearCart from "../../controller/cart/clear-cart.js";
import { limiter } from "../../utils/limiter.js";
import { isLoggedIn } from "../../middleware/isLoggedIn.js";
import removeFromCart from "../../controller/cart/remove-item.js";
const router = express.Router();

router.post("/", limiter, isLoggedIn, addToCart);
router.get("/", isLoggedIn, getUserCart);
router.put("/", limiter, isLoggedIn, updateCart);
router.delete("/item/:id", limiter, isLoggedIn, removeFromCart);
router.delete("/clear", limiter, isLoggedIn, clearCart);
export { router };
