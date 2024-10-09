import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";

import { validateRequest } from "@/common/utils/httpHandlers";
import { UserSchemaZ } from "../user/userModel";
import { authController } from "./authController";

export const authRegistry = new OpenAPIRegistry();
export const authRouter: Router = express.Router();

// authRegistry.register("User", UserSchemaZ);

authRegistry.registerPath({
  method: "post",
  path: "/auth",
  tags: ["User"],
  responses: createApiResponse(z.array(UserSchemaZ), "Success"),
});

authRouter.post("/register", authController.createUser);

authRegistry.registerPath({
  method: "post",
  path: "/auth",
  tags: ["User"],
  responses: createApiResponse(z.array(UserSchemaZ), "Success"),
});

authRouter.post("/login", authController.login);
authRegistry.registerPath({
  method: "post",
  path: "/auth",
  tags: ["User"],
  responses: createApiResponse(z.array(UserSchemaZ), "Success"),
});

authRouter.post("/logout", authController.logout);
