import express from "express";
import {
  scrapeCompanyDetailsByQuery,
  UrlHandler,
} from "../controllers/index.js";

export const router = express.Router();

router.post("/url", UrlHandler);

router.post("/query", scrapeCompanyDetailsByQuery);

router.post("/random", (req, res) => {
  console.log("resss");
  console.log("req.booooooooooo", req.body);
  res.send("Dtat hit sucessfully!!");
});
