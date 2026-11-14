import "reflect-metadata";

import cookieParser from "cookie-parser";
import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: (process.env.FRONTEND_ORIGIN ?? "http://localhost:5173")
      .split(",")
      .map((origin) => origin.trim()),
    credentials: true,
  });
  app.getHttpAdapter().get("/health", (_request, response) => {
    response.status(200).json({ status: "ok" });
  });
  await app.listen(Number(process.env.PORT) || 3000, "0.0.0.0");
}

void bootstrap();
