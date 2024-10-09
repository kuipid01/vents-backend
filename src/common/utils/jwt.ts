import { IUser } from "@/api/user/userModel";
import { Request, Response } from "express";
import jwt from 'jsonwebtoken';

export const createSendToken = async (user: IUser, statusCode: number, req: Request, res: Response): Promise<void> => {
  const accessToken = signToken(user._id as string, '1h'); // Access token valid for 1 hour
  const refreshToken = signToken(user._id as string, '10d'); // Refresh token valid for 10 days

  // Save the refresh token in the user's record in the DB
  user.refreshToken = refreshToken;
  await user.save();

  // Set access token cookie
  res.cookie('accessToken', accessToken, {
    expires: new Date(
      Date.now() + (Number(process.env.JWT_COOKIE_EXPIRES_IN) || 90) * 24 * 60 * 60 * 1000 // Fallback to 90 days if env variable is missing
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
  });

  // Set refresh token cookie
  res.cookie('refreshToken', refreshToken, {
    expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: true
  });

  // Remove password from output
  user.password = '';

  // Send response
  res.status(statusCode).json({
    status: 'success',
    accessToken,
    refreshToken,
    data: {
      user
    }
  });
};

const signToken = (id: string, expiresIn: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, { expiresIn });
};
