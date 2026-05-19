import { Router } from "express";
// import { users } from "../../fakeData/fakeUsers.js";
import { User } from "../../modules/users/user.model.js";
import { supabase } from "../../config/supabase.js";
import {
  getUsers,
  cerateUser,
  updateUser,
  deleteUser,
} from "../../modules/users/users.v2.controller.js";
import { deleteModel } from "mongoose";

export const router = Router();

// MongoDB route (/api/v2/users)

router.get("/", getUsers);

router.post("/", cerateUser);

router.put("/:id", updateUser);

router.delete("/:id", deleteUser);

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
