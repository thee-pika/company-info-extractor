import express from "express";
import cors from "cors";
import { config } from "dotenv";
import { router } from "./routes/route.js";
config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/v1/scrape", router);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log("App is running on PORT", PORT);
});

