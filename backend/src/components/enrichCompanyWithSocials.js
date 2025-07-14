import axios from 'axios';
import { extractSocialLinks } from './socialUtils.js';
import { config } from "dotenv";
config();

const API_KEY = process.env.API_KEY;

async function getSocialProfiles(companyName) {
  const query = `${companyName} site:linkedin.com OR site:instagram.com OR site:twitter.com`;

  try {
    const res = await axios.get('https://serpapi.com/search.json', {
      params: {
        engine: 'google',
        q: query,
        api_key: API_KEY,
      },
    });

    return extractSocialLinks(res.data);
  } catch (err) {
    console.error(`❌ Failed to get social links for ${companyName}:`, err.message);
    return {};
  }
}

export default getSocialProfiles;
