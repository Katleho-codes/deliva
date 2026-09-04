import express from "express";
import search from "../../controller/search/search.js";

const router = express.Router();
router.get("/", search);
export { router };
