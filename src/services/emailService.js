const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const resumePath = path.join(__dirname, '../../assets/Curriculo Nicolas.pdf');

async function sendBulkEmails(emailList) {
  for (const recipient of emailList) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipient,
      subject: 'Currículo desenvolvedor backend pleno',
      text: 'Olá, tudo bem? Segue em anexo o meu currículo para sua avaliação. Agradeço pela oportunidade!',
      attachments: [
        {
          filename: 'curriculo.pdf',
          path: resumePath,
          contentType: 'application/pdf',
        }
      ],
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`E-mail enviado para: ${recipient}`);
    } catch (error) {
      console.error(`Erro ao enviar e-mail para ${recipient}:`, error.message);
    }
  }
}

async function scrapeEmails(url, retries = 3) {
  const axiosOptions = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
  };

  while (retries > 0) {
    try {
      const { data } = await axios.get(url, axiosOptions);
      const $ = cheerio.load(data);
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const htmlText = $.text();
      const matches = htmlText.match(emailRegex);

      return matches ? [...new Set(matches)] : [];
    } catch (error) {
      // retries--;
      console.error(`Erro ao realizar scraping: ${error.message}. Tentando novamente... (${retries} tentativas restantes)`);
      if (retries === 0) {
        console.error('Erro ao realizar scraping:', error.message);
        return [];
      }
    }
  }
}

async function searchUrls(query) {
  try {
    const customsearch = google.customsearch('v1');
    const apiKey = process.env.GOOGLE_API_KEY;
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

    console.log('Iniciando busca com a consulta:', query);

    const results = [];
    const maxResults = 25;
    const resultsPerPage = 10;

    for (let startIndex = 1; results.length < maxResults; startIndex += resultsPerPage) {
      const response = await customsearch.cse.list({
        cx: searchEngineId,
        q: query,
        auth: apiKey,
        start: startIndex,
      });

      if (response.data && response.data.items) {
        results.push(...response.data.items.map(item => item.link));
        if (response.data.items.length < resultsPerPage) break; // Para se não houver mais resultados
      } else {
        console.log('Nenhum item encontrado na resposta.');
        break;
      }
    }

    // Limita a lista de resultados a 100 se houver mais de 100
    return results.slice(0, maxResults);
  } catch (error) {
    console.error('Erro ao buscar URLs:', error.message);
    return [];
  }
}

async function processEmails(query) {
  try {
    const allEmails = [];
    const urls = await searchUrls(query);

    if (urls.length === 0) {
      console.log('Nenhuma URL encontrada para a consulta fornecida');
      return allEmails;
    }

    for (const url of urls) {
      try {
        const emails = await scrapeEmails(url);
        if (emails.length > 0) {
          allEmails.push(...emails);
        } else {
          console.log(`Nenhum e-mail encontrado em ${url}`);
        }
      } catch (error) {
        console.error(`Erro ao processar URL ${url}:`, error.message);
      }
    }

    return allEmails;
  } catch (error) {
    console.error('Erro ao processar e-mails:', error.message);
    return [];
  }
}

module.exports = { sendBulkEmails, scrapeEmails, processEmails, searchUrls };
