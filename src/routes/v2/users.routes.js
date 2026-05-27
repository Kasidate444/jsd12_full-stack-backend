import { Router } from "express";
// import jwt
// import { users } from "../../fakeData/fakeUsers.js";
import { User } from "../../modules/users/user.model.js";
import { supabase } from "../../config/supabase.js";
import {
  getUsers,
  cerateUser,
  updateUser,
  deleteUser,
  createUserHash,
  userLogin,
} from "../../modules/users/users.v2.controller.js";
import { deleteModel } from "mongoose";
import { authUser } from "../../middlewares/auth.js";

export const router = Router();

// MongoDB route (/api/v2/users)

// Read all users
router.get("/", getUsers);

// Create a user by bcrypt hash
router.post("/", createUserHash);

// Login a user
router.post("/login", userLogin);

router.put("/:id", updateUser);

router.delete("/:id", deleteUser);

// Check user session/token
router.get("/auth/me", authUser, async (req, res, next) => {
  try {
    const userId = req.user.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found!",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Logout a user
router.post("/auth/logout", (req, res) => {
  const isProd = process.env.NODE_ENV === "production";

  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: isProd, // only send over HTTPS in production
    sameSite: isProd ? "none" : "lax",
    path: "/",
  });
  return res.status(200).json({
    success: true,
    message: "Logged out seccessfully!",
  });
});

// Supabase / PostgreSQL route

const PG_SELECT = "id, username, email, role, created_at, updated_at";

router.get("/pg", async (req, res) => {
  try {
    const { data, error } = await supabase.from("users").select(PG_SELECT);
    if (error) throw error;

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

router.post("/pg", async (req, res) => {
  const { username, email, password, role } = req.body || {};
  if (!username || !email || !password) {
    return res.status(400).json({
      sucess: false,
      error: "username, email, and password are required",
    });
  }

  try {
    const { data, error } = await supabase
      .from("users")
      .insert({ username, email, password, role: role || "user" })
      .select(PG_SELECT)
      .single();

    if (error) throw error;

    return res.status(201).json({ success: true, data });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

// router.put("/pg/:id")
