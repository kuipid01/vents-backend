import { ServiceResponse } from "@/common/models/serviceResponse";
import { IUser, User } from "../user/userModel";
import { StatusCodes } from "http-status-codes";
import { NextFunction, Request, Response } from "express"; // Added Response
import { createSendToken } from "@/common/utils/jwt";
import jwt, { JwtPayload } from 'jsonwebtoken'
import { logger } from "@/server";

export class AuthService {
    async createUser(req: Request, res: Response): Promise<ServiceResponse<IUser | null> | void> {
        const { email, password, name, passwordConfirm } = req.body;
        
        try {
            // Ensure all required fields are provided
            if (!email || !password || !passwordConfirm) {
                return ServiceResponse.failure(
                    'Provide all necessary details',
                    null,
                    StatusCodes.NOT_ACCEPTABLE
                );
            }
            if (password !== passwordConfirm) {
              return ServiceResponse.failure(
                  'Password mismatch',
                  null,
                  StatusCodes.NOT_ACCEPTABLE
              );
          }

            // Check if user already exists
            const userExist = await User.findOne({ email });
            if (userExist) {
                return ServiceResponse.failure(
                    'User already exists',
                    null,
                    StatusCodes.NOT_ACCEPTABLE
                );
            }

            // Create a new user
            const newUser = await User.create({
                name,
                email,
                password,
                passwordConfirm
            });

            // Send JWT tokens and set cookies
            createSendToken(newUser, StatusCodes.CREATED, req, res); 

            // Return success response
            // return ServiceResponse.success('User Created', newUser);
        } catch (error) {
            // Handle errors gracefully
            return ServiceResponse.failure(
                'Error creating user',
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    }
    async logUser(req: Request, res: Response):Promise<void | ServiceResponse<IUser | null>> {
      try {
        const { email, password } = req.body;
  
        // Validate input
        if (!email || !password) {
          // Send response here directly
          return ServiceResponse.failure('Please provide email and password!', null, StatusCodes.BAD_REQUEST);
        }
  
        const user = await User.findOne({ email }).select('+password');
  
        // Check if user exists and if password is correct
        if (!user || !(await user.correctPassword(password, user.password))) {
     
          return ServiceResponse.failure('Incorrect email or password', null, StatusCodes.BAD_REQUEST);
        }
  
        // Send token and respond directly inside `createSendToken`
        await createSendToken(user, StatusCodes.OK, req, res);
  
      } catch (error) {
        // Log the error and send an error response
        logger.error(error);
      
        return  ServiceResponse.failure('Error occurred while trying to sign in', null, StatusCodes.INTERNAL_SERVER_ERROR)
        
      }
    }
   async updatePassword (
      req: Request, 
      res: Response, 
      next: NextFunction
    ): Promise<void> {
      try {
        // 1) Get access token from cookies
        const accessToken = req.cookies.accessToken;
    
        if (!accessToken) {
          return next(ServiceResponse.failure('No access token found.', null, StatusCodes.INTERNAL_SERVER_ERROR));
        }
    
        // 2) Verify the access token
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET!) as jwt.JwtPayload;
    
        // 3) Check if the user still exists
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
          return next(ServiceResponse.failure('The user belonging to this token no longer exists.', null, StatusCodes.INTERNAL_SERVER_ERROR));
        }
    
        // 4) Fetch the user and include the password field (as it is usually not selected by default)
        const user = await User.findById(currentUser._id).select('+password');
        if (!user) {
          return next(ServiceResponse.failure('User not found.', null, StatusCodes.INTERNAL_SERVER_ERROR));
        }
    
        // 5) Check if the posted current password is correct
        if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
          return next(ServiceResponse.failure('Your current password is wrong.', null, StatusCodes.INTERNAL_SERVER_ERROR));
        }
    
        // 6) Update the password if the current password is correct
        user.password = req.body.password;
        user.passwordConfirm = req.body.passwordConfirm;
    
        // Save the user with the new password (password hashing happens in the pre-save hook)
        await user.save();
    
        // 7) Log the user in again by sending a new JWT
        createSendToken(user, 200, req, res);
      } catch (error) {
        next(error);
      }
}
async logOutUser (req: Request, res: Response,   ) {
  res.cookie('accessToken', '', {
    expires: new Date(
      Date.now() + (Number(process.env.JWT_COOKIE_EXPIRES_IN) || 90) * 24 * 60 * 60 * 1000 // Fallback to 90 days if env variable is missing
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
  });

  // Set refresh token cookie
  res.cookie('refreshToken', '', {
    expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: true
  });
  return ServiceResponse.success('LOGOUT SUCCESSFUL.', null, StatusCodes.ACCEPTED);
      
}
async protectRoute(req: Request, res: Response,next:NextFunction):Promise<ServiceResponse<null | IUser> | void>{
  let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }
  
    if (!token) {
      return  ServiceResponse.failure('You are not logged in! Please log in to get access.',null, StatusCodes.BAD_REQUEST)
      
    }
  const promisifiedJwt = (token:string, secret:string) => {
return new Promise((res,rej) => {
jwt.verify(token,secret,{},(err,payload) => {
if (err) {
  rej(err)
}
else {
  res(payload)
}
})
})
  }
    // 2) Verification token
    const decoded = await promisifiedJwt(token, process.env.JWT_SECRET!) as JwtPayload;
    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return ServiceResponse.failure(
          'The user belonging to this token does no longer exist.',null,
          401
        )
     
    }
  
    // 4) Check if user changed password after the token was issued
    if (await currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        ServiceResponse.failure('User recently changed password! Please log in again.', 401)
      );
    }
  
    // GRANT ACCESS TO PROTECTED ROUTE
  
     res.locals.user = currentUser;
    next();
}
}
export const authService = new AuthService();
