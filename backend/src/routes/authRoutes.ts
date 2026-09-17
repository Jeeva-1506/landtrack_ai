import { Router } from "express";
import { register, login, me, updateProfile, changePassword, updatePreferences } from "../controllers/authController";
import { authenticateJWT } from "../middleware/authMiddleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", me);
router.put("/profile", updateProfile);
router.post("/profile", updateProfile);
router.post("/change-password", changePassword);
router.put("/preferences", updatePreferences);
router.post("/preferences", updatePreferences);

export default router;
