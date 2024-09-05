const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');

// Rota para enviar e-mails
router.post('/emails/send', emailController.sendEmails);

// Rota para processar e-mails
router.post('/emails/process', emailController.processEmails);

// Rota para buscar e-mails de uma URL específica
router.get('/emails/scrape', emailController.getEmails);

module.exports = router;
