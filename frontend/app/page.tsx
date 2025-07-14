"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Company {
  companyName: string;
  description: string;
  socialLinks: {
    linkedin?: string;
    instagram?: string;
    twitter?: string;
    facebook?: string;
  };
}

export default function HomePage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [format, setFormat] = useState<string>("");
  const [fileType, setFileType] = useState<string>();

  const handleScrape = async () => {
    try {
      if (!input) return;
      setLoading(true);

      const isUrl = input.startsWith("http://") || input.startsWith("https://");

      let res;
      if (isUrl) {
        const body = { url: input, format };
        res = await scrapeDataFromUrl(body);
      } else {
        const body = { query: input, format };
        res = await scrapeDataFromQuery(body);
      }

      if (res?.data?.buffer?.data) {
        const type = res.data.format;
        setFileType(type);
        const byteArray = new Uint8Array(res.data.buffer.data);
        const blob = new Blob([byteArray], {
          type: type === "json" ? "application/json" : "text/csv",
        });
        const url = URL.createObjectURL(blob);
        console.log("url", url);
        setDownloadUrl(url);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const scrapeDataFromQuery = async (body: {
    query: string;
    format: string;
  }) => {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URI}/api/v1/scrape/query`,
      body
    );
    return res;
  };

  const scrapeDataFromUrl = async (body: { url: string; format: string }) => {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URI}/api/v1/scrape/url`,
      body
    );

    return res;
  };

  return (
    <main className="w-5xl mx-auto p-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">🕵️ Company Info Scraper</h1>
        <div className="flex mt-8">
          <Input
            placeholder="Enter search query or website URL"
            value={input}
            className="w-90 p-4"
            onChange={(e) => setInput(e.target.value)}
          />
          <DropdownMenu>
            <DropdownMenuTrigger className="ml-4 border px-4 py-2 rounded bg-white text-black">
              {format ? `Format: ${format.toUpperCase()}` : "Select Format"}
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFormat("json")}>
                JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFormat("csv")}>
                CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={handleScrape} disabled={loading} className="ml-8">
            {loading ? "Scraping..." : "Scrape"}
          </Button>
        </div>
      </div>

      {downloadUrl && (
        <a
          href={downloadUrl}
          download={`scraped-result.${fileType === "csv" ? "csv" : "json"}`}
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Download File
        </a>
      )}
    </main>
  );
}
