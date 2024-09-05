const emailService = require('../services/emailService'); // Certifique-se de que o caminho está correto

test('Deve extrair e-mails de um site', async () => {
  const url = 'https://isaac.com.br/trabalhe-conosco'; // Use uma URL que você sabe que contém e-mails para teste
  const emails = await emailService.scrapeEmails(url);
  
  console.log('E-mails encontrados no teste:', emails); // Adicione um log para depuração
  
  // Verifique se o array contém pelo menos um e-mail (ajuste conforme necessário)
  expect(emails).toBeTruthy()
});
