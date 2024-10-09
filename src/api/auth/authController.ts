import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { NextFunction, Request, RequestHandler, Response } from "express";
import { authService } from "./authServices";

class AuthController {

    public createUser: RequestHandler = async (req:Request, res:Response) => {
        const serviceResponse = await authService.createUser(req,res)
        return handleServiceResponse(serviceResponse,res)
    }
    public login: RequestHandler = async (req:Request, res:Response) => {
        const serviceResponse = await authService.logUser(req,res)
    
        return handleServiceResponse(serviceResponse,res)
    }
     public logout: RequestHandler = async (req:Request, res:Response) => {
         const serviceResponse = await authService.logOutUser(req,res)
         return handleServiceResponse(serviceResponse,res)
     }
     public protect: RequestHandler = async (req:Request, res:Response,next:NextFunction) => {
         const serviceResponse = await authService.protectRoute(req,res,next)
         return handleServiceResponse(serviceResponse,res)
     }
}


export const authController = new AuthController()