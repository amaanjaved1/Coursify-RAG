import { Router } from "express";
import { askHandler } from "../controllers/askController";

export const askRouter = Router();

askRouter.post("/ask", askHandler);
