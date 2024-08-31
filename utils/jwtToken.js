export const sendToken = (user, statusCode, res, message) => {
  const token = user.getJWTToken();
  const options = {
    httpOnly: true,
    expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    message,
    user,
    token,
  });
};

