import { query } from "express";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Job } from "../models/jobSchema.js";

export const postJob = catchAsyncErrors(async (req, res, next) => {
  const { title, jobType, location, companyName, introduction, responsibilities, qualifications, offers, salary, hiringMultipleCandidates, personalWebsiteTitle, personalWebsiteUrl, jobNiche } = req.body;

  if (!title || !jobType || !location || !companyName || !introduction || !responsibilities || !qualifications || !salary || !jobNiche) {
    return next(new ErrorHandler("Please Provide All Job Details.", 400));
  }

  if ((personalWebsiteTitle && !personalWebsiteUrl) || (!personalWebsiteTitle && personalWebsiteUrl)) {
    return next(new ErrorHandler("Provide Both Website URL and Title, Or Leave Both Blank.", 400));
  }
  const postedBy = req.user._id;
  const job = await Job.create({
    title,
    jobType,
    location,
    companyName,
    introduction,
    responsibilities,
    qualifications,
    offers,
    salary,
    hiringMultipleCandidates,
    personalWebsite: {
      title: personalWebsiteTitle,
      url: personalWebsiteUrl,
    },
    jobNiche,
    postedBy,
  });
  res.status(201).json({
    success: true,
    message: "Job Posted Successfully.",
    job,
  });
});

export const getAllJobs = catchAsyncErrors(async (req, res, next) => {
  const { city, niche, searchKeyword } = req.query;
  const query = {};
  if (city) {
    query.location = city;
  }
  if (niche) {
    query.jobNiche = niche;
  }
  if (searchKeyword) {
    query.$or = [{ title: { $regex: searchKeyword, $options: "i" } }, { companyName: { $regex: searchKeyword, $options: "i" } }, { introduction: { $regex: searchKeyword, $options: "i" } }];
  }
  const jobs = await Job.find(query);
  res.status(200).json({
    success: true,
    count: jobs.length,
    jobs,
  });
});

export const getMyJobs = catchAsyncErrors(async (req, res, next) => {
  const myJobs = await Job.find({ postedBy: req.user._id });
  res.status(200).json({
    success: true,
    count: myJobs.length,
    myJobs,
  });
});

export const deleteJob = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const job = await Job.findById(id);
  if (!job) {
    return next(new ErrorHandler("Oops! Job Not Found.", 404));
  }
  await job.deleteOne();
  res.status(200).json({
    success: true,
    message: "Job Deleted Successfully.",
  });
});

export const getASingleJob = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const job = await Job.findById(id);
  if (!job) {
    return next(new ErrorHandler("Oops! Job Not Found.", 404));
  }
  res.status(200).json({
    success: true,
    job,
  });
});
