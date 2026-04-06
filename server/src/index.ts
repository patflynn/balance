import path from "node:path";
import { fileURLToPath } from "node:url";
import Fastify from "fastify";
import fastifyStatic from "@fastify/static";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const server = Fastify({ logger: true });

server.get("/api/health", async () => {
  return { status: "ok" };
});

const clientDistPath = path.resolve(__dirname, "../../client/dist");

await server.register(fastifyStatic, {
  root: clientDistPath,
  wildcard: false,
});

server.setNotFoundHandler((_request, reply) => {
  return reply.sendFile("index.html");
});

const start = async () => {
  try {
    const port = parseInt(process.env.PORT || "3001", 10);
    await server.listen({ port, host: "0.0.0.0" });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
