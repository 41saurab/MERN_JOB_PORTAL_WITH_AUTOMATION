import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { v2 as cloudinary } from "cloudinary";
import { User } from "../models/userSchema.js";
import { sendToken } from "../utils/jwtToken.js";

export const register = catchAsyncErrors(async (req, res, next) => {
  try {
    const { name, email, phone, address, password, role, firstNiche, secondNiche, thirdNiche, coverLetter } = req.body;

    if (!name || !email || !phone || !address || !password || !role) {
      return next(new ErrorHandler("All Fileds Are Required.", 400));
    }
    if (role === "Job Seeker" && (!firstNiche || !secondNiche || !thirdNiche)) {
      return next(new ErrorHandler("Please Provide Your Preferred Job Niches.", 400));
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ErrorHandler("Email Is Already Registered.", 400));
    }
    const userData = {
      name,
      email,
      phone,
      address,
      password,
      role,
      niches: {
        firstNiche,
        secondNiche,
        thirdNiche,
      },
      coverLetter,
    };
    if (req.files && req.files.resume) {
      const { resume } = req.files;
      if (resume) {
        try {
          const cloudinaryResponse = await cloudinary.uploader.upload(resume.tempFilePath, { folder: "Job_Seekers_Resume" });
          if (!cloudinaryResponse || cloudinaryResponse.error) {
            return next(new ErrorHandler("Failed To Upload Resume To Cloud.", 500));
          }
          userData.resume = {
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url,
          };
        } catch (error) {
          return next(new ErrorHandler("Failed To Upload Resume.", 500));
        }
      }
    }
    const user = await User.create(userData);
    sendToken(user, 201, res, "User Registered Successfully.");
  } catch (error) {
    next(error);
  }
});

export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password, role } = req.body;

  if (!role || !email || !password) {
    return next(new ErrorHandler("All Fields Are Required.", 400));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid Email Or Password.", 400));
  }
  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    return next(new ErrorHandler("Invalid Email Or Password.", 400));
  }
  if (user.role !== role) {
    return next(new ErrorHandler("Invalid Role.", 400));
  }

  sendToken(user, 200, res, "User Logged In Successfully.");
});

export const logout = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "User Logged Out Successfully.",
    });
});

export const getUser = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});

export const updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    address: req.body.address,
    coverLetter: req.body.coverLetter,
    niches: {
      firstNiche: req.body.firstNiche,
      secondNiche: req.body.secondNiche,
      thirdNiche: req.body.thirdNiche,
    },
  };
  const { firstNiche, secondNiche, thirdNiche } = newUserData.niches;

  if (req.user.role === "Job seeker" && (!firstNiche || !secondNiche || !thirdNiche)) {
    return next(new ErrorHandler("Please Provide Your Preferred Job Niches.", 400));
  }
  if (req.files) {
    const { resume } = req.files;
    if (resume) {
      const currentResume = req.user.resume.public_id;
      if (currentResume) {
        await cloudinary.uploader.destroy(currentResume);
      }
      const newResume = await cloudinary.uploader.upload(resume.tempFilePath, { folder: "Job_Seekers_Resume" });
      newUserData.resume = {
        public_id: newResume.public_id,
        url: newResume.secure_url,
      };
    }
  }

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    success: true,
    message: "Profile Updated Successfully",
    user,
  });
});

export const updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  const isOldPasswordMatch = await user.comparePassword(req.body.oldPassword);
  if (!isOldPasswordMatch) {
    return next(new ErrorHandler("Old Password Is Incorrect.", 400));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler("New Password & Confrim Password Do Not Match.", 400));
  }

  user.password = req.body.newPassword;
  await user.save();
  sendToken(user, 200, res, "Password Updated Successfully.");
});
