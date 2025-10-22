import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { HashbrownOpenAI } from "@hashbrownai/openai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is not set.");
}

app.use(cors());
app.use(express.json());

app.get("/api/ping", (_req, res) => {
  res.json({ status: "ok", message: "Hello from Express!" });
});

app.post("/api/echo", (req, res) => {
  res.json({ received: req.body });
});

app.post("/api/chat", async (req, res) => {
  const request = req.body;
  const openai = HashbrownOpenAI.stream.text({
    apiKey: OPENAI_API_KEY,
    request,
    transformRequestOptions: (request) => {
      return {
        ...request,
        reasoning_effort: "low",
      };
    },
  });

  res.header("Content-Type", "application/octet-stream");

  for await (const chunk of openai) {
    res.write(chunk);
  }

  res.end();
});

app.listen(PORT, () => {
  console.log(`Demo API listening on http://localhost:${PORT}`);
});
