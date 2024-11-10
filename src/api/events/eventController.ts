import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { Request, RequestHandler, Response } from "express";
import { eventService } from "./eventService";

class EventController {

public getEvents:RequestHandler = async(req:Request,res:Response) => {
    const serviceResponse = await eventService.findAll();
    return handleServiceResponse(serviceResponse, res);
}
public getEvent: RequestHandler = async (req: Request, res: Response) => {

    const serviceResponse = await eventService.findById(req.params.eventId);
    return handleServiceResponse(serviceResponse, res);
  };
  
  public createEvent: RequestHandler = async (req:Request, res:Response) => {
    const serviceResponse = await eventService.createEvent(req,res)
    return handleServiceResponse(serviceResponse,res)
}
  public deleteEvent: RequestHandler = async (req:Request, res:Response) => {
    const serviceResponse = await eventService.deleteEvent(req,res)
    return handleServiceResponse(serviceResponse,res)
}
  public joinEvent: RequestHandler = async (req:Request, res:Response) => {
    const serviceResponse = await eventService.joinEvent(req,res)
    return handleServiceResponse(serviceResponse,res)
}
  public verifyUser: RequestHandler = async (req:Request, res:Response) => {
    const serviceResponse = await eventService.verifyUser(req,res)
    return handleServiceResponse(serviceResponse,res)
}
}

export const eventController = new EventController()