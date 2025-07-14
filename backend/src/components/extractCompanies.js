function extractAnswerBoxCompanies(data) {
  if (!data.answer_box || !Array.isArray(data.answer_box.expanded_list)) return [];

  return data.answer_box.expanded_list.map(company => ({
    company_name: company.title,
    logo_url: company.thumbnail
  }));
}

function extractOrganicSources(data) {
  if (!data.organic_results || !Array.isArray(data.organic_results)) return [];

  return data.organic_results.map(result => ({
    title: result.title,
    link: result.link,
    snippet: result.snippet,
    source: result.source
  }));
}

module.exports = { extractAnswerBoxCompanies, extractOrganicSources };
