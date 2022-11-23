// Dica. Utilize o editor disponível em: https://editor.swagger.io/
import swaggerAutogen from 'swagger-autogen'

const doc = {
    swagger: "2.0",
    info: {
        version: "1.0.0",
        title: "📚 API Cadastro de Produtos Informática",
        description: "➡️Documentação gerada automaticamente pelo módulo <a href='https://github.com/davibaltar/swagger-autogen' target='_blank'>swagger-autogen</a>."
    },
    host: 'https://backend-cadastro-produtos.vercel.app/api',
    basePath: "/",
    schemes: ['https'],
    consumes: ['application/json'],
    produces: ['application/json'],
    securityDefinitions: {
        apiKeyAuth:{
            type: "apiKey",
            in: "header",       // can be "header", "query" or "cookie"
            name: "access-token",  // name of the header, query parameter or cookie
            description: "Token de Acesso gerado após o login"
        }
    },
    definitions: {
        Erro: {
            value: "Erro gerado pela aplicação",
            msg: "Mensagem detalhando o erro",
            param: "URL que gerou o erro"
        },
        Produto:{           
            codigo_produto: 1,
            nome_produto: "Placa Mãe Gigabite Z540",
            descricao_produto: "Placa Mãe AM4",
            valor_produto: 2000.00,
            categoria: "Placa mãe"
        }
    }
}

const outputFile = './api/swagger/swagger_output.json'
const endpointsFiles = ['./api/index.js']
const options = {
    swagger: '2.0',          // By default is null
    language: 'pt-BR',         // By default is 'en-US'
    disableLogs: false,     // By default is false
    disableWarnings: false  // By default is false
}

swaggerAutogen(options)(outputFile, endpointsFiles, doc).then(async () => {
    await import('./api/index.js'); // Your project's root file
  });