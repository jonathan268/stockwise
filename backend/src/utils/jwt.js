import jwt from "jsonwebtoken";

const getRefreshSecret = () => {
  return process.env.JWT_REFRESH_SECRET || (process.env.JWT_SECRET + "_refresh_legacy");
};

export const generateTokens = (user) => {
  const payload = {
    userId: user._id,
    organizationId: user.organizationId,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  const refreshSecret = getRefreshSecret();
  const refreshToken = jwt.sign(
    { userId: user._id },
    refreshSecret,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN },
  );

  return { accessToken, refreshToken };
};

export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, getRefreshSecret());
};
