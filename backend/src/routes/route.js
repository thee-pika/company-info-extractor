import express from "express";
import {
  scrapeCompanyDetailsByQuery,
  UrlHandler,
} from "../controllers/index.js";

export const router = express.Router();

router.post("/url", UrlHandler);

router.post("/query", scrapeCompanyDetailsByQuery);
