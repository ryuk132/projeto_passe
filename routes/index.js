//
// O arquivo index.js:
//
//    carrega o módulo Express e o objeto Router a ele associado, 
//    que controla as requisições recebidas por esse módulo.
//    Express facilita a criação de páginas web que conversam com
//    o Node.js

var express = require('express');
var router = express.Router();

var numeroGerado = 123;

//
// Em seguida, este arquivo index.js define as funções que serão chamadas
// em cada requisição e resposta

/* GET home page. */
router.get('/', function(req, res, next) 
{
  res.render('index', { title: 'Passe Urbano' , numeroBilhete: numeroGerado});
});

router.get('/criar', function(req, res, next) 
{
  res.render('criacao', { title: 'Criação', resultado:"0"});
});

//
// Abaixo, temos uma função que é executada como resposta ao pedido de
// geração de código do bilhete. Ela é assíncrona, de forma que faz o
// pedido de geração do bilhete ao objeto global.db, que contém os
// comandos que tratam do Banco de Dados (MySQL) que estamos usando.
// Quando o servidor de banco de dados gravar o registro com o bilhete
// gerado, devolverá o código do bilhete, que será passado para a página 
// criacao.ejs, onde será mostrado esse código para o usuário e permitirá 
// retornar à página inicial (index.ejs):
//
router.post("/criar", async (req, res) => 
{
  let resultadoInsert = "00000000";
  try
  {
    try
    {
       resultadoInsert = await global.db.insertBilhete();
    }
    catch (erro)
    {
        console.log(erro);
    }
    res.render('criacao', { title: 'Passe Urbano / Criação', resultado: resultadoInsert});
  }
  catch (erro)
  {
    console.log("erro criar "+erro);
  }  
});

// 
// O código abaixo faz a busca de todas as categorias de bilhetes
// cadastradaas no banco de dados (função selectCategorias()) e o
// resultado dessa busca é usado para criar a página categ.ejs que
// exibe uma tabela com os dados dessas categorias:
//
router.get("/categ", async function(req, res) 
{
  try
  {
      const resultados = await global.db.selectCategorias();
      res.render("categ", {title:'Passe Urbano/Lista de Categorias', resultados});
  }
  catch (erro)
  {
      res.redirect("/?erro="+erro);
  }
});

// O comando abaixo explicita como será criada a página de solicitação de recarga
// do bilhete cujo código deverá ser digitado pelo usuário:
//
router.get('/recarga', function(req, res, next) 
{
  res.render('recarga', { title: 'Passe Urbano / Recarga'});
});

// O comando abaixo explicita a função que registra, no banco de dados, a recarga
// que foi solicitada na página descrita acima. Os dados de número do bilhete e 
// sua categoria são recuperados da página anterior (reg.body) e são usados como
// parâmetros para a função do banco de dados que recarrega o bilhete 
// (função global.db.recargaBilhete).
// O resultado da chamada dessa função é usado para gerar a página registraRecarga, 
// que exibe para o usuário mensagem sobre a recarga bem sucedida:
//
router.post('/registraRecarga', async function(req, res, next) 
{
  const codBil = req.body.txtNumero;
  const categoria = req.body.idCategoria;
  try
  {
    const resultado = await global.db.recargaBilhete(codBil, categoria);
    res.render('registraRecarga', { title: 'Passe Urbano / Recarga / Resultado', resultado });
  }
  catch (erro)
  {
    res.redirect("/?erro="+erro);
  }
  
});

// O comando abaixo explicita como será criada a página de solicitação
// de uso do bilhete cujo código deverá ser digitado pelo usuário:
//
router.get('/uso', function(req, res, next) 
{
  res.render('uso', { title: 'Passe Urbano / Uso do Passe' });
});

// O comando abaixo explicita a função que registra, no banco de dados, o uso do
// bilhete que foi informado na página descrita acima. O número do bilhete é
// recuperado da página anterior (reg.body) e é usado como parâmetro para a 
// função do banco de dados que registra a data de uso do bilhete (função 
// global.db.usaBilhete).
// O resultado da chamada dessa função é usado para gerar a página fazUso, 
// que exibe para o usuário mensagem sobre o uso e tempo de validade do
// bilhete:
//
router.post('/fazUso', async function(req, res, next) 
{
  const codBil = req.body.txtNumero;
  try
  {
    const resultado = await global.db.usaBilhete(codBil);
    res.render('fazUso', { title: 'Passe Urbano / Uso do Passe / Resultado', resultado });
  }
  catch (erro)
  {
    res.redirect("/?erro="+erro);
  }
});

// O comando abaixo explicita como será criada a página de solicitação
// de relatório uso do bilhete cujo código deverá ser digitado pelo usuário:
//
router.get('/relat', function(req, res, next) 
{
  res.render('relat', { title: 'Passe Urbano / Relatório de Uso' });
});

// O comando abaixo explicita a função que busca, no banco de dados, os usos do
// bilhete que foi informado na página descrita acima. O número do bilhete é
// recuperado da página anterior (reg.body) e é usado como parâmetro para a 
// função do banco de dados que busca os registros de uso do bilhete (função 
// global.db.selectUsos).
// O resultado da chamada dessa função é usado para gerar a página relatUso, 
// que exibe para o usuário uma tabela com os dados de uso e validade do
// bilhete cujo código foi anteriormente informado:
//
router.post("/relatUso", async function(req, res) 
{
  try
  {
      var codigoBilhete = req.body.txtNumero;
      const resultados = await global.db.selectUsos(codigoBilhete);
      res.render("relatUso", 
           {title:'Passe Urbano / Relatório de Uso / Uso do Bilhete '+codigoBilhete, resultados});
  }
  catch (erro)
  {
      res.redirect("/?erro="+erro);
  }
});

// Exporta as rotas registradas para que os demais módulos tenham
// acesso a elas:
//
module.exports = router;
