import express from "express";
import { postJob, getAllJobs, getMyJobs, deleteJob, getASingleJob } from "../controllers/jobController.js";
import { isAuthenticated, isAuthorized } from "../middlewares/auth.js";

const jobRouter = express.Router();

jobRouter.post("/postjob", isAuthenticated, isAuthorized("Employer"), postJob);
jobRouter.get("/getall", getAllJobs);
jobRouter.get("/getmyjobs", isAuthenticated, isAuthorized("Employer"), getMyJobs);
jobRouter.delete("/delete/:id", isAuthenticated, isAuthorized("Employer"), deleteJob);
jobRouter.get("/get/:id", getASingleJob);

export default jobRouter;
