import { Router } from "express";
// import { users } from "../../fakeData/fakeUsers.js";
import { User } from "../../modules/users/user.model.js";
import { supabase } from "../../config/supabase.js";

export const router = Router();

const userResponse = (doc) => {
  const user = doc.toObject();
  delete user.password;
  return user;
};

router.get("/", async (req, res) => {
  try {
    const user = await User.find();
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res.status(400).json({ success: false, error: error });
  }
});

router.post("/", async (req, res) => {
  const { username, email, password, role } = req.body || {};
  if (!username || !email || !password) {
    const err = new Error("username, email, and password are required");
    err.name = "ValidationError";
    err.status = 400;
    return res.status(400).json({ sucess: false, error: err });
  }

  try {
    const doc = await User.create({
      username: username,
      email: email,
      password: password,
      role: role,
    });
    return res.status(201).json({ success: true, date: userResponse(doc) });
  } catch (err) {
    return res.status(400).json({ success: false, error: err });
  }
});

router.put("/:id", async (req, res) => {
  const user = users.find((u) => u.id === req.params.id);

  if (!user) {
    return res.status(404).json({ error: "User not found!" });
  }

  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ error: "username, email and password are required!" });
  }

  user.username = username;
  user.email = email;
  user.password = password;

  res.status(200).json(user);
});

// router.delete("/:id",async (req,res)=>{});

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
