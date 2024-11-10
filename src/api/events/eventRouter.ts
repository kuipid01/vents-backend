import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { eventController } from "./eventController";
import { authController } from "../auth/authController";


export const eventRegistry = new OpenAPIRegistry();
export const eventRouter: Router = express.Router();


eventRouter.get("/", eventController.getEvents);
eventRouter.get("/:eventId", eventController.getEvent);
eventRouter.post("/", authController.protect,eventController.createEvent);
eventRouter.post("/:eventId", eventController.joinEvent);
eventRouter.post("/:eventVerificationId", eventController.verifyUser);
eventRouter.delete("/", eventController.deleteEvent);

// userRegistry.registerPath({
//   method: "get",
//   path: "/users/{id}",
//   tags: ["User"],
//   request: { params: GetUserSchema.shape.params },
//   responses: createApiResponse(UserSchema, "Success"),
// });

// userRouter.get("/:id", validateRequest(GetUserSchema), userController.getUser);
