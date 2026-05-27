import { User } from "./user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userResponse = (doc) => {
  const user = doc.toObject();
  delete user.password;
  return user;
};

export const getUsers = async (req, res, next) => {
  try {
    const user = await User.find();
    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const cerateUser = async (req, res, next) => {
  const { username, email, password, role } = req.body || {};
  if (!username || !email || !password) {
    const err = new Error("username, email, and password are required");
    err.name = "ValidationError";
    err.status = 400;
    // return res.status(400).json({ sucess: false, error: err });
    next(err);
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
    // return res.status(400).json({ success: false, error: err });
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  const { username, email, password, role } = req.body || {};
  const updates = {};

  if (username !== undefined) updates.username = username;
  if (email !== undefined) updates.email = email;
  if (password !== undefined) updates.password = await bcrypt.hash(password, 11);
  if (role !== undefined) updates.role = role;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      error: "At least one field is required to update",
    });
  }

  try {
    const doc = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    return res.status(200).json({ success: true, data: doc });
  } catch (err) {
    // return res.status(400).json({ success: false, error: err });
    err.status = 400;
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const doc = await User.findByIdAndDelete(req.params.id);

    if (!doc) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    return res.status(200).json({ success: true, data: doc });
  } catch (err) {
    // return res.status(400).json({ success: false, error: err });
    next(err);
  }
};

export const createUserHash = async (req, res, next) => {
  const { password, email, username, role } = req.body || {};

  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "username, email, and password are required",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (user) {
      return res
        .status(401)
        .json({ message: "email already used.", success: false });
    }
    const newUser = new User({
      email,
      username,
      password,
      role,
    });

    const doc = await newUser.save();

    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
};

export const userLogin = async (req, res, next) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "email and password are required",
    });
  }

  try {
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "email or password is not correct",
      });
    }

    const isMatched = await bcrypt.compare(password, user.password);

    if (isMatched) {
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h", // 1 hour expiration
      });

      const isProd = process.env.NODE_ENV === "production";

      res.cookie("accessToken", token, {
        httpOnly: true,
        secure: isProd, // only send over HTTPS in production
        sameSite: isProd ? "none" : "lax",
        path: "/",
        maxAge: 60 * 60 * 1000, // 1 hour
      });
      return res.status(200).json({
        success: true,
        message: "Login successful",
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "email or password is not correct",
      });
    }
  } catch (err) {
    next(err);
  }
};
