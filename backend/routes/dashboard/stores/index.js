// routes/dashboard/stores/index.js
import { Router } from "express";
import addStaff from "../../../controller/stores/add-staff.js";
import getStoreCustomers from "../../../controller/dashboard/stores/customers.js";
import getStoreDashboard from "../../../controller/dashboard/stores/index.js";
import getStoreOrders from "../../../controller/dashboard/stores/orders.js";
import removeStaff from "../../../controller/stores/remove-staff.js";
import updateStore from "../../../controller/stores/update-store.js";
import { isLoggedIn } from "../../../middleware/isLoggedIn.js";
import isStoreDashboardAuth from "../../../middleware/isStoreDashboardAuth.js";
import { isStoreOwner } from "../../../middleware/isStoreOwner.js";
import getStoreStaff from "../../../controller/stores/get-store-staff.js";
import getStoreProducts from "../../../controller/dashboard/stores/products.js";

const router = Router({ mergeParams: true }); // important for :slug access

router.use(isLoggedIn, isStoreDashboardAuth); // apply to all dashboard routes

router.get("/", getStoreDashboard);
router.get("/orders", getStoreOrders);
router.get("/customers", getStoreCustomers);
router.post("/staff", isStoreOwner, addStaff);
router.get("/staff", isStoreOwner, getStoreStaff);
router.delete("/staff/:userId", isStoreOwner, removeStaff);
router.put("/", isStoreOwner, updateStore);
router.get("/products", getStoreProducts);
// router.delete("/", isStoreOwner, deleteStore);

export { router };
