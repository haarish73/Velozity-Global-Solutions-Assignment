import http from "http";
import app from "./app";
import { initSocket } from "./sockets/socket";
import { env } from "./config/env";

const server = http.createServer(app);

// initialize socket
initSocket(server);

server.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});