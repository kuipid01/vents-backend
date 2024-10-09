import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { Request, RequestHandler, Response } from "express";
import { eventService } from "./eventService";

class EventController {
/**
 * getEvents
 */
public getEvents:RequestHandler = async(req:Request,res:Response) => {
    const serviceResponse = await eventService.findAll();
    return handleServiceResponse(serviceResponse, res);
}
public getEvent: RequestHandler = async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id as string, 10);
    const serviceResponse = await eventService.findById(id);
    return handleServiceResponse(serviceResponse, res);
  };
  
  public createEvent: RequestHandler = async (req:Request, res:Response) => {
    const serviceResponse = await eventService.createEvent(req,res)
    return handleServiceResponse(serviceResponse,res)
}
}

export const eventController = new EventController()