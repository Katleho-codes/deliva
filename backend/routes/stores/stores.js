"use strict";
import express from "express";
import createStore from "../../controller/stores/create-store.js";
import getAllStores from "../../controller/stores/get-stores.js";
import getStoreByName from "../../controller/stores/get-store-by-name.js";
import { limiter } from "../../utils/limiter.js";
import { isLoggedIn } from "../../middleware/isLoggedIn.js";
import { optionalAuth } from "../../middleware/optionalAuth.js";
import { isStoreOwner } from "../../middleware/isStoreOwner.js";
import getUserOwnedStores from "../../controller/stores/get-user-owned-stores.js";
import deleteStore from "../../controller/stores/delete-store.js";
import { isStoreOwnerCanDelete } from "../../middleware/isStoreOwnerCanDelete.js";
import createReview from "../../controller/stores/create-store-review.js";
import getStoreReviews from "../../controller/stores/get-store-reviews.js";
import getNearbyStores from "../../controller/stores/nearby.js";

const router = express.Router({ mergeParams: true });
router.post("/", limiter, isLoggedIn, createStore);
router.get("/", optionalAuth, getAllStores);
router.get("/my-stores", isLoggedIn, getUserOwnedStores);
router.get("/add", isLoggedIn, getUserOwnedStores);
router.get("/nearby", optionalAuth, getNearbyStores);
router.get("/:slug", isLoggedIn, getStoreByName);
router.delete("/:id", isLoggedIn, isStoreOwnerCanDelete, deleteStore);
router.post("/:slug/reviews", isLoggedIn, createReview);
router.get("/:slug/reviews", optionalAuth, getStoreReviews);
// router.get("/staff", getStoreStaff)

export { router };
