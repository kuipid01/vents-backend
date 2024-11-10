import mongoose, { Document, Model, Schema } from "mongoose";

interface IEvent extends Document {
    id: string;
    userId:string;
    name: string;
    images: string[];
    qrCodeUrl: string;
    description?:string;
    eventLink:string;
    attendees?:{
      name:string,
      email:string,
      attended?:boolean
    }[],
    startDate:Date
  }
export const EventSchema: Schema = new Schema<IEvent>(
    {
    
      name: { type: String, required: true },
      userId: { type: String, required: true },
      images: { type: [String], default: [] },
      description: { type: String, required: true },
      qrCodeUrl: {
        type: String,
        required: true,
        trim: true,
      },
      eventLink: { type: String, required: true, trim: true },
      attendees : {
        required:false,
        type:[{
          name:String,
          email:{
            type:String,
            unique:true
          },
          attended:{
            type:Boolean,
            default:false
          }
        }]
      },
      startDate:{
        type:Date
      }
    },
    {
      timestamps: true,
    }
  );
  
  const Event: Model<IEvent> = mongoose.model<IEvent>('Event', EventSchema);
  export { Event, IEvent };