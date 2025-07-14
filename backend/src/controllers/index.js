import axios from "axios";
import * as cheerio from "cheerio";
import { config } from "dotenv";
import fs from "fs";
import { Parser } from "json2csv";
import path from "path";
import getSocialProfiles from "../components/enrichCompanyWithSocials.js";
import {
  extractAnswerBoxCompanies,
  extractOrganicSources,
} from "../components/extractCompanies.js";
config();

const API_KEY = process.env.API_KEY;

const scrapeCompanyDetailsByQuery = async (req, res) => {
  try {
    console.log("req.body", req.body);
    const { query, format = "json" } = req.body;
    console.log("formAt received", format);
    if (!query)
      return res.status(500).json({ error: "Failed to scrape data." });

    const response = await axios.get("https://serpapi.com/search.json", {
      params: {
        engine: "google",
        q: query,
        api_key: API_KEY,
      },
    });

    const data = response.data;

    const companies = extractAnswerBoxCompanies(data);
    console.log("companies", companies);
    for (const company of companies) {
      console.log(`🔍 Getting social profiles for ${company.company_name}`);
      const socials = await getSocialProfiles(company.company_name);
      company.socials = socials;
    }

    const filename = `company-details-${Date.now()}.${format}`;
    const tmpDir = path.join(process.cwd(), "tmp");
    const filepath = path.join(tmpDir, filename);
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    const sources = extractOrganicSources(data);

    console.log("sources", sources);

    if (format === "csv") {
      const result = {
        companies,
        sources,
      };
      const parser = new Parser();
      const csv = parser.parse(result);
      fs.writeFileSync(filepath, csv);
      res.setHeader("Content-Type", "text/csv");
    } else {
      const result = {
        companies,
        sources,
      };
      fs.writeFileSync(filepath, JSON.stringify(result, null, 2));
      res.setHeader("Content-Type", "application/json");
    }

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    const buffer = fs.readFileSync(filepath);
    return res
      .status(200)
      .json({ message: "Details Fetched Successfully!!", buffer, format });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error, message: "error ocuured" });
  }
};

const scrapeCompanyDetailsByUrl = async (url) => {
  try {
    const { data: html } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; CompanyScraperBot/1.0)",
      },
    });

    const $ = cheerio.load(html);

    const companyName =
      $('meta[property="og:site_name"]').attr("content") ||
      $("title").text().trim() ||
      new URL(url).hostname;

    const description =
      $('meta[name="description"]').attr("content") ||
      $('meta[property="og:description"]').attr("content") ||
      "";

    const socialLinks = {
      linkedin: null,
      instagram: null,
      twitter: null,
      facebook: null,
    };

    $("a[href]").each((_, el) => {
      const href = $(el).attr("href")?.toLowerCase();
      if (!href) return;

      if (!socialLinks.linkedin && href.includes("linkedin.com")) {
        socialLinks.linkedin = href;
      } else if (!socialLinks.instagram && href.includes("instagram.com")) {
        socialLinks.instagram = href;
      } else if (
        !socialLinks.twitter &&
        (href.includes("twitter.com") || href.includes("x.com"))
      ) {
        socialLinks.twitter = href;
      } else if (!socialLinks.facebook && href.includes("facebook.com")) {
        socialLinks.facebook = href;
      }
    });

    const details = {
      companyName,
      url,
      description,
      socialLinks,
    };

    console.log("details", details);

    return details;
  } catch (err) {
    console.error(`❌ Failed to scrape ${url}:`, err.message);
    return null;
  }
};

const UrlHandler = async (req, res) => {
  try {
    console.log("req.body", req.body);
    const { url, format = "json" } = req.body;

    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "Please provide a valid URL." });
    }

    const result = await scrapeCompanyDetailsByUrl(url);
    if (!result)
      return res.status(500).json({ error: "Failed to scrape data." });
    const filename = `company-${Date.now()}.${format}`;
    const tempDir = path.join(process.cwd(), "tmp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    const fullpath = path.join(tempDir, filename);

    if (format === "csv") {
      const parser = new Parser();
      const csv = parser.parse([result]);
      fs.writeFileSync(fullpath, csv);
      res.setHeader("Content-Type", "text/csv");
    } else {
      fs.writeFileSync(fullpath, JSON.stringify(result, null, 2));
      res.setHeader("Content-Type", "application/json");
    }

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    const buffer = fs.readFileSync(fullpath);
    console.log("buffer", buffer);
    res
      .status(200)
      .json({ message: "Details Fetched Successfully!!", buffer, format });
  } catch (error) {
    console.log("errorerrorerrorerror", error);
    res.status(500).json({ error, message: "error ocuured" });
  }
};

export { scrapeCompanyDetailsByQuery, UrlHandler };
