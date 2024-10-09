import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { eventController } from "./eventController";


export const eventRegistry = new OpenAPIRegistry();
export const eventRouter: Router = express.Router();


eventRouter.get("/", eventController.getEvents);
eventRouter.post("/", eventController.createEvent);

// userRegistry.registerPath({
//   method: "get",
//   path: "/users/{id}",
//   tags: ["User"],
//   request: { params: GetUserSchema.shape.params },
//   responses: createApiResponse(UserSchema, "Success"),
// });

// userRouter.get("/:id", validateRequest(GetUserSchema), userController.getUser);
