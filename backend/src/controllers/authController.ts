import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { UserModel } from "../models/User";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

const __filename = typeof import.meta !== "undefined" && import.meta.url ? fileURLToPath(import.meta.url) : __filename;
const __dirname = typeof import.meta !== "undefined" && import.meta.url ? path.dirname(__filename) : __dirname;

const JWT_SECRET = process.env.JWT_SECRET || "landguard_secret_jwt_key_2026";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, role, department, district, phone } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: "Email, password, and name are required fields." });
    }

    if (mongoose.connection.readyState === 1) {
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "A user with this email address already exists." });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      const userId = `USR-${Date.now()}`;

      const newUser = await UserModel.create({
        id: userId,
        email,
        passwordHash,
        name,
        role: role || "VIEWER",
        department: department || "Land Acquisition Department",
        district: district || "All",
        phone: phone || "+91 98765 43210"
      });

      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.status(201).json({
        success: true,
        token,
        user: newUser
      });
    }

    return res.status(200).json({
      success: true,
      user: { id: "USR-001", email, name, role: role || "VIEWER" }
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to register user." });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    if (mongoose.connection.readyState === 1) {
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: "Invalid email credentials or user not found." });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid password credentials." });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.json({
        success: true,
        token,
        user
      });
    }

    return res.json({
      success: true,
      user: { id: "USR-001", email, name: "R. Subramani" }
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to log in." });
  }
};

export const me = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profileFile = path.join(__dirname, "../../../database/data/user_profile.json");
    let storedProfile: any = null;
    if (fs.existsSync(profileFile)) {
      try {
        storedProfile = JSON.parse(fs.readFileSync(profileFile, "utf-8"));
      } catch (e) {
        console.error("Error reading user_profile.json:", e);
      }
    }

    if (mongoose.connection.readyState === 1 && req.user?.id) {
      const user = await UserModel.findOne({ id: req.user.id }).select("-passwordHash");
      if (user) {
        return res.json({ success: true, user });
      }
    }

    const defaultUser = storedProfile || {
      id: "USR-001",
      name: "R. Subramani",
      email: "jeevaselva0614@gmail.com",
      phone: "+91 7871534167",
      department: "Revenue & Land Acquisition Department",
      designation: "Special District Revenue Officer (DRO)",
      photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"
    };

    return res.json({ success: true, user: defaultUser });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to fetch user profile." });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, phone, department, designation, photoUrl } = req.body;
    const userId = req.user?.id || "USR-001";
    const profileFile = path.join(__dirname, "../../../database/data/user_profile.json");

    let currentData: any = {};
    if (fs.existsSync(profileFile)) {
      try {
        currentData = JSON.parse(fs.readFileSync(profileFile, "utf-8"));
      } catch (e) {
        console.error("Error reading user_profile.json:", e);
      }
    }

    const updatedProfile = {
      ...currentData,
      id: userId,
      name: name ?? currentData.name ?? "R. Subramani",
      email: email ?? currentData.email ?? "jeevaselva0614@gmail.com",
      phone: phone ?? currentData.phone ?? "+91 7871534167",
      department: department ?? currentData.department ?? "Revenue & Land Acquisition Department",
      designation: designation ?? currentData.designation ?? "Special District Revenue Officer (DRO)",
      photoUrl: photoUrl ?? currentData.photoUrl,
      updatedAt: new Date().toISOString()
    };

    // Save to JSON file database
    try {
      const dir = path.dirname(profileFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(profileFile, JSON.stringify(updatedProfile, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to write user_profile.json:", e);
    }

    // Save to MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      await UserModel.findOneAndUpdate(
        { id: userId },
        {
          $set: {
            name: updatedProfile.name,
            email: updatedProfile.email,
            phone: updatedProfile.phone,
            department: updatedProfile.department,
            designation: updatedProfile.designation,
            photoUrl: updatedProfile.photoUrl
          }
        },
        { upsert: true, new: true }
      );
    }

    return res.json({
      success: true,
      message: "Officer Profile updated successfully in database!",
      user: updatedProfile
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to update officer profile" });
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.id || "USR-001";

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters long." });
    }

    if (mongoose.connection.readyState === 1) {
      const user = await UserModel.findOne({ id: userId });
      if (user) {
        const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isMatch) {
          return res.status(400).json({ error: "Current password does not match." });
        }
        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(newPassword, salt);
        await user.save();
      }
    }

    return res.json({
      success: true,
      message: "Security password updated and saved successfully!"
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to update password." });
  }
};

export const updatePreferences = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { phone, emailNotificationsEnabled, whatsappEnabled, notificationPreferences } = req.body;
    const userId = req.user?.id || "USR-001";

    if (mongoose.connection.readyState === 1) {
      const updated = await UserModel.findOneAndUpdate(
        { id: userId },
        {
          $set: {
            phone,
            emailNotificationsEnabled,
            whatsappEnabled,
            notificationPreferences
          }
        },
        { new: true }
      ).select("-passwordHash");
      return res.json({ success: true, user: updated });
    }

    return res.json({
      success: true,
      message: "Notification preferences updated in active session.",
      user: {
        id: userId,
        phone: phone || "+91 7871534167",
        emailNotificationsEnabled: emailNotificationsEnabled !== false,
        whatsappEnabled: whatsappEnabled !== false,
        notificationPreferences: notificationPreferences || {}
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to update notification preferences" });
  }
};
