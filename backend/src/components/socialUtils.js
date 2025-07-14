function extractSocialLinks(data) {
  const links = {
    linkedin: null,
    instagram: null,
    twitter: null
  };

  for (const item of data.organic_results || []) {
    const url = item.link.toLowerCase();
    if (!links.linkedin && url.includes('linkedin.com')) {
      links.linkedin = item.link;
    } else if (!links.instagram && url.includes('instagram.com')) {
      links.instagram = item.link;
    } else if (!links.twitter && (url.includes('twitter.com') || url.includes('x.com'))) {
      links.twitter = item.link;
    }
  }

  return links;
}

export { extractSocialLinks };


