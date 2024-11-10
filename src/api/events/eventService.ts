import { ServiceResponse } from "@/common/models/serviceResponse";
import { Event, IEvent } from "./eventModel";
import { logger } from "@/server";
import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import { generateQRCode } from "@/common/utils/generateQr";
import QRCode from "qrcode";
import sendMail from "@/common/utils/mail";
export class EventService{
// Retrieves all users from the database
    async findAll(): Promise<ServiceResponse<IEvent[] | null>> {
    try {
      const events = await Event.find();
      if (!events || events.length === 0) {
        return ServiceResponse.failure("No Events found", null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success<IEvent[]>("Events found", events);
    } catch (ex) {
      const errorMessage = `Error finding all Events: $${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while retrieving Events.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
     }

   // Retrieves a single event by their ID
   async findById(id: string): Promise<ServiceResponse<IEvent | null>> {
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
    const { name, description } = req.body;
// console.log('hit')

const user = res.locals.user
    try {
        // Ensure all required fields are provided
        if (!name) {
            return ServiceResponse.failure(
                'Provide all necessary details',
                null,
                StatusCodes.NOT_ACCEPTABLE
            );
        }

        // Check if an event with the same name already exists
        const eventExist = await Event.findOne({ name });
        if (eventExist) {
            return ServiceResponse.failure(
                'Event with the same name already exists',
                null,
                StatusCodes.NOT_ACCEPTABLE
            );
        }

        // Create a new event
        const event = await Event.create({
            name,
            description,
            userId:user._id,
            qrCodeUrl:'test',
            eventLink:'test'
        });

        // Generate the event link
        const host = req.get("host"); // e.g., localhost:3000 or yourdomain.com
        const protocol = req.protocol; // e.g., http or https
        const eventLink = `${protocol}://${host}/event/${event._id}`;

        // Generate the QR code
        const qrCodeUrl = await generateQRCode(req,event);
        // console.log(eventLink,qrCodeUrl)
        // Update the event with the QR code URL and event link
        event.qrCodeUrl = qrCodeUrl;
        event.eventLink = eventLink;
        await event.save();

        // Return success response
        return ServiceResponse.success('EVENT Created', event);
    } catch (error) {
        logger.warn(error);
        // Handle errors gracefully
        return ServiceResponse.failure(
            'Error creating event',
            null,
            StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}
  async deleteEvent(req: Request, res: Response): Promise<ServiceResponse<IEvent | null> | void> {
    const { id } = req.params;
    const { userId } = req.params;

    try {
        // Ensure all required fields are provided
        if (!id) {
            return ServiceResponse.failure(
                'Provide all necessary details',
                null,
                StatusCodes.NOT_ACCEPTABLE
            );
        }
        if (!userId) {
            return ServiceResponse.failure(
                'Provide a userId details',
                null,
                StatusCodes.NOT_ACCEPTABLE
            );
        }

        // Check if an event with the same name already exists
        const eventExist = await Event.findOne({ id });
        if (!eventExist) {
            return ServiceResponse.failure(
                'Event do not exist',
                null,
                StatusCodes.NOT_ACCEPTABLE
            );
        }

        // Create a new event
        const event = await Event.findByIdAndDelete(id)


        // Return success response
        return ServiceResponse.success('EVENT Deleted succesfuly', event);
    } catch (error) {
        logger.warn(error);
        // Handle errors gracefully
        return ServiceResponse.failure(
            'Error creating event',
            null,
            StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}
async  joinEvent(req:Request,res:Response) {
const {eventId} = req.params
const {name,email} =req.body
try {
  const event = await Event.findById(eventId);

  if (!event) {
    return ServiceResponse.failure("This Event is no longer available", null, StatusCodes.NOT_FOUND);
  }
 const userExists =  event.attendees?.find((event) =>event.name===name || event.email===email  )
 if(userExists) {
  return ServiceResponse.failure("Already part of event , wait for date to come amigo", null, StatusCodes.NOT_FOUND);

 }

   
   event.attendees?.push({name,email})
  await event.save()
   // Generate the event link
   const host = req.get("host"); // e.g., localhost:3000 or yourdomain.com
   const protocol = req.protocol; // e.g., http or https
   const userEventLink = `${protocol}://${host}/event/${event._id}/?email=${email}`;
   const qrCodeDataURL = await QRCode.toDataURL(userEventLink);
   sendMail(email,'VEnts',{
    qrCodeUrl:qrCodeDataURL,link:userEventLink
   } )
   
 return ServiceResponse.success<IEvent>("You have joined event, you would be sent an invitation link with a qrcode embedded ", event);
} catch (ex) {
  const errorMessage = `Error finding Event with id ${eventId}:, ${(ex as Error).message}`;
  logger.error(errorMessage);
  return ServiceResponse.failure("An error occurred while finding Event.", null, StatusCodes.INTERNAL_SERVER_ERROR);
}
}
async verifyUser(req:Request,res:Response){
  try {
    const {email} = req.query
    const {eventVerificationId} = req.params
    if (!email) {
      ServiceResponse.failure("Link Broken", null, StatusCodes.NOT_FOUND);
     }
     const event = await Event.findById(eventVerificationId);
  
    if (!event) {
      return ServiceResponse.failure("This Event is no longer available", null, StatusCodes.NOT_FOUND);
    }
   const userExists =  event.attendees?.find((event) =>event.email===email  )
   if(!userExists) {
    return ServiceResponse.failure("You were not invited for this event", null, StatusCodes.NOT_FOUND);
  
   }
   userExists.attended=true
   await event.save()
   return ServiceResponse.success(`Welcome ${userExists?.name} `, null, StatusCodes.CREATED);
  
  } catch (error) {
    console.log(error)
    return ServiceResponse.failure(`An error occurred`, null, StatusCodes.BAD_REQUEST);

  }

}
 private async sendInvitationMail(email:string):Promise<boolean> {
  try {
    
    return true
  } catch (error) {
    return false
  }
}
}

export const eventService = new EventService()