import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import {  UserSchemaZ } from "@/api/user/userModel";
import { validateRequest } from "@/common/utils/httpHandlers";
import { userController } from "./userController";

export const userRegistry = new OpenAPIRegistry();
export const userRouter: Router = express.Router();

// userRegistry.register("User", UserSchemaZ);

userRegistry.registerPath({
  method: "get",
  path: "/users",
  tags: ["User"],
  responses: createApiResponse(z.array(UserSchemaZ), "Success"),
});

userRouter.get("/", userController.getUsers);

// userRegistry.registerPath({
//   method: "get",
//   path: "/users/{id}",
//   tags: ["User"],
//   request: { params: GetUserSchema.shape.params },
//   responses: createApiResponse(UserSchema, "Success"),
// });

// userRouter.get("/:id", validateRequest(GetUserSchema), userController.getUser);
