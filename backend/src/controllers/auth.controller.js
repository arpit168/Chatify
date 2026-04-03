import User from "../models/User.js";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 character" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.text(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await User.findOne({email});
    if(user) return res.status(400).json({message:"Email already exists"})
  } catch (error) {}
};
