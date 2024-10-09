import mongoose, { Document, Model, Schema } from "mongoose";

interface IEvent extends Document {
    id: string;
    name: string;
    images: string[];
    date: Date;
    qrCodeUrl: string;
    description?:string;
    eventLink:string
  }
export const EventSchema: Schema = new Schema<IEvent>(
    {
      id: { type: String, required: true },
      name: { type: String, required: true },
      images: { type: [String], default: [] },
      date: { type: Date, required: true },
      description: { type: String, required: true },
      qrCodeUrl: {
        type: String,
        required: true,
        trim: true,
      },
      eventLink: { type: String, required: true, trim: true },
    },
    {
      timestamps: true,
    }
  );
  
  const Event: Model<IEvent> = mongoose.model<IEvent>('Event', EventSchema);
  export { Event, IEvent };