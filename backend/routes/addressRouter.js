import { Router } from "express";
import { createAddress, deleteAddress, deleteAllAddressesByUserId, getAllAddressesByUserId, getDefaultAddress,  setAddressToDefault,  updateAddress } from "../controllers/adressController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
const router = Router();

router.use(authenticateUser);

router.post("/", createAddress)

router.get("/get-all-addresses", getAllAddressesByUserId)
router.get("/get-default-address", getDefaultAddress)

router.patch("/set-default-address", setAddressToDefault)
router.patch("/update-address", updateAddress)

router.delete("/delete-address", deleteAddress)
router.delete("/delete-all-addresses", deleteAllAddressesByUserId)

export default router

