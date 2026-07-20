// Vercel serverless entry point. Vercel injects env vars from the dashboard,
// so there's no dotenv here. The Express app is used as the request handler.
import app from "../src/app";

export default app;
