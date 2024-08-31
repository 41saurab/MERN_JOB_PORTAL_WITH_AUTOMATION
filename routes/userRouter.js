import express from "express";
import { getUser, login, logout, register, updatePassword, updateProfile } from "../controllers/userController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const userRouter = express.Router();

userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.get("/logout", isAuthenticated, logout);
userRouter.get("/getuser", isAuthenticated, getUser);
userRouter.put("/update/profile", isAuthenticated, updateProfile);
userRouter.put("/update/password", isAuthenticated, updatePassword);

export default userRouter;
