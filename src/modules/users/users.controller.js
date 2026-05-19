import { User } from "./user.model.js";

const userResponse = (doc) => {
  const user = doc.toObject();
  delete user.password;
  return user;
};

export const getUsers = async (req, res) => {
  try {
    const user = await User.find();
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res.status(400).json({ success: false, error: error });
  }
};

export const cerateUser = async (req, res) => {
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
};

export const updateUser = async (req, res) => {
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
};
