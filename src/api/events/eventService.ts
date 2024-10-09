import { ServiceResponse } from "@/common/models/serviceResponse";
import { Event, IEvent } from "./eventModel";
import { logger } from "@/server";
import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import { generateQRCode } from "@/common/utils/generateQr";

export class EventService{
// Retrieves all users from the database
    async findAll(): Promise<ServiceResponse<IEvent[] | null>> {
    try {
      const events = await Event.find();
      if (!events || events.length === 0) {
        return ServiceResponse.failure("No Users found", null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success<IEvent[]>("Users found", events);
    } catch (ex) {
      const errorMessage = `Error finding all users: $${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while retrieving users.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
     }

   // Retrieves a single event by their ID
   async findById(id: number): Promise<ServiceResponse<IEvent | null>> {
    try {
      const event = await Event.findById(id);
      if (!event) {
        return ServiceResponse.failure("Event not found", null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success<IEvent>("Event found", event);
    } catch (ex) {
      const errorMessage = `Error finding Event with id ${id}:, ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure("An error occurred while finding Event.", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
  async createEvent(req: Request, res: Response): Promise<ServiceResponse<IEvent | null> | void> {
    const { name, images,description } =  req.body;
    
    try {
           // Get host and protocol from the request
  
        // Ensure all required fields are provided
        if (!name ) {
            return ServiceResponse.failure(
                'Provide all necessary details',
                null,
                StatusCodes.NOT_ACCEPTABLE
            );
        }
    

        // Check if user already exists
        const eventExist = await Event.findOne({ name });
        if (eventExist) {
            return ServiceResponse.failure(
                'Event with same name already exists',
                null,
                StatusCodes.NOT_ACCEPTABLE
            );
        }

        // Create a new user
        const event = await Event.create({
            name,
           
        });

        const host = req.get("host"); // e.g., localhost:3000 or yourdomain.com
        const protocol = req.protocol; // e.g., http or https
        const eventLink = `${protocol}://${host}/event/${event._id}`;
        const qrCodeUrl = await generateQRCode(req, event);
        
    event.qrCodeUrl = qrCodeUrl;
    event.eventLink = eventLink;
        // Return success response
        return ServiceResponse.success('EVENT Created', event);
    } catch (error) {
        // Handle errors gracefully
        return ServiceResponse.failure(
            'Error creating user',
            null,
            StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}
}

export const eventService = new EventService()