import { Server } from "socket.io";
import httpServer from "../services/http.js";
import "dotenv/config";
import { corsOptions } from "../utils/cors.js";
export const io = new Server(httpServer, {
    /* options */
    cors: corsOptions,
});
