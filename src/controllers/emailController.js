const emailService = require('../services/emailService');
const { URL } = require('url');

exports.sendEmails = async (req, res) => {
  try {
    const { emailList } = req.body;

    if (!emailList || !Array.isArray(emailList) || emailList.length === 0) {
      return res.status(400).json({ message: 'Lista de e-mails inválida' });
    }

    const invalidEmails = emailList.filter(email => !validateEmail(email));
    if (invalidEmails.length > 0) {
      return res.status(400).json({ message: `E-mails inválidos: ${invalidEmails.join(', ')}` });
    }

    await emailService.sendBulkEmails(emailList);
    res.status(200).json({ message: 'E-mails enviados com sucesso!' });
  } catch (error) {
    console.error('Erro ao enviar e-mails:', error);
    res.status(500).json({ message: 'Erro ao enviar e-mails' });
  }
};

exports.getEmails = async (req, res) => {
  try {
    const url = req.query.url;

    if (!url) {
      return res.status(400).json({ error: 'URL é obrigatória' });
    }

    try {
      new URL(url);
    } catch (err) {
      return res.status(400).json({ error: 'URL inválida' });
    }

    const emails = await emailService.scrapeEmails(url);
    if (emails.length === 0) {
      return res.status(404).json({ message: 'Nenhum e-mail encontrado' });
    }
    res.status(200).json(emails);
  } catch (error) {
    console.error('Erro ao obter e-mails:', error);
    res.status(500).json({ error: 'Erro ao obter e-mails' });
  }
};

exports.processEmails = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ message: 'Consulta de pesquisa é obrigatória' });
    }

    const result = await emailService.processEmails(query);
    res.status(200).json({ retorno: result });
  } catch (error) {
    console.error('Erro ao processar consulta de pesquisa:', error);
    res.status(500).json({ message: 'Erro ao processar consulta de pesquisa' });
  }
};

function validateEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}
