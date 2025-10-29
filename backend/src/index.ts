import { app } from "./server.js";
import connectDatabase from "./config/db.config.js";
import { config } from "./config/app.config.js";

async function startServer() {
  try {
    await connectDatabase();
    app.listen(config.PORT, async () => {
      console.log(
        `Server listening on port ${config.PORT} in ${config.NODE_ENV}`
      );
    });
  } catch (error) {
    console.error("DB Connection Failed:", error);
    process.exit(1);
  }
}

startServer();