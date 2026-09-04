import app from "./app.js";
import { createServer } from "http";

const httpServer = createServer(app);

export default httpServer;
