const express = require('express');
const { bulkhead } = require('cockatiel');

const app = express();
const port = 8080;

// Configurando bulkhead com cockatiel (Máximo de 5 requisições simultâneas)
const bulkheadPolicy = bulkhead(5);

// Função simulando chamada externa
async function externalService() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve('Resposta da chamada externa');
        }, 2000);  // Simula uma chamada que demora 2 segundos
    });
}

// Rota que faz a chamada simulada
app.get('/api/bulkhead', async (req, res) => {
    try {
        const result = await bulkheadPolicy.execute(() => externalService());
        res.send(result);
    } catch (error) {
        res.status(500).send(`Erro: ${error.message}`);
    }
});

// Iniciando o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});

(async function () {
    const requests = []; //array para armazenar as promises
    
    for (let i = 1; i <= 6; i++) { // Envia 6 requisições para ultrapassar o limite de 5
        requests.push(
            fetch('http://localhost:8080/api/bulkhead')
                .then(res => res.text()) //extrai a resposta como texto
                .then(data => console.log(`Requisição ${i}:`, data)) //imprime no console
                .catch(err => console.log(`Erro na requisição ${i}:`, err.message)) //captura o erro e imprime com o número da requisição
        );
    }

    await Promise.all(requests); // Aguarda todas as requisições finalizarem
})();