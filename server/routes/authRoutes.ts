import { Router } from "express";
import authService from "../services/auth";

const authRoutes = Router();

authRoutes.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    const result = await authService.signIn(email, password);
    return res.json(result);
  } catch (error: any) {
    return res
      .status(500)
      .json({ success: false, message: "Server error: " + error.message });
  }
});

export default authRoutes;
