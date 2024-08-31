import express from "express";
import { deleteApplication, employerGetAllApplication, jobSeekerGetAllApplication, postApplication } from "../controllers/applicationController.js";
import { isAuthenticated, isAuthorized } from "../middlewares/auth.js";

const applicationRouter = express.Router();

applicationRouter.post("/post/:id", isAuthenticated, isAuthorized("Job Seeker"), postApplication);
applicationRouter.get("/employer/getall", isAuthenticated, isAuthorized("Employer"), employerGetAllApplication);
applicationRouter.get("/jobseeker/getall", isAuthenticated, isAuthorized("Job Seeker"), jobSeekerGetAllApplication);
applicationRouter.delete("/delete/:id", isAuthenticated, deleteApplication);

export default applicationRouter;
