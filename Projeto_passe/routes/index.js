var numeroGerado = 123;
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Passe Urbano' , numeroBilhete: numeroGerado});
});

router.get('/criar', function(req, res, next) {
  res.render('criacao', { title: 'Passe Urbano / Criação', resultado:"0"});
});

router.post("/criar", async (req, res) => {
  console.log("entrou no script para gerar codigo");
  let resultadoInsert = "00000000";
  try{
    try
    {
       resultadoInsert = await global.db.insertBilhete();  // substitui os parâmetros pelos valores entre [ e ]
    }
    catch (erro)
    {
        console.log(erro);
    }

    console.log("Codigo criado "+resultadoInsert);
    res.render('criacao', { title: 'Passe Urbano / Criação', resultado: resultadoInsert});
  }
  catch (erro)
  {
    console.log("erro criar "+erro);
  }  
});

router.get("/categ", async function(req, res) {
  try
  {
      console.log("Vai escrever categorias resultantes");
      const resultados = await global.db.selectCategorias();
      console.log(resultados);
      res.render("categ", {title:'Passe Urbano/Lista de Categorias', resultados});
  }
  catch (erro)
  {
      res.redirect("/?erro="+erro);
  }
});

router.get('/recarga', function(req, res, next) {
  res.render('recarga', { title: 'Passe Urbano / Recarga'});
});

router.post('/registraRecarga', async function(req, res, next) {
  const codBil = req.body.txtNumero;
  const categoria = req.body.idCategoria;
  console.log("Index.JS: Bilhete ="+codBil+" categoria ="+categoria);
  try
  {
    const resultado = await global.db.recargaBilhete(codBil, categoria);
    console.log("INDEX.JS após chamar recargaBilhete: "+resultado);
    res.render('registraRecarga', { title: 'Passe Urbano / Recarga / Resultado', resultado });
  }
  catch (erro)
  {
    res.redirect("/?erro="+erro);
  }
  
});

router.get('/uso', function(req, res, next) {
  res.render('uso', { title: 'Passe Urbano / Uso do Passe' });
});

router.post('/fazUso', async function(req, res, next) {
  const codBil = req.body.txtNumero;
  console.log("Index.JS/fazUso: Bilhete ="+codBil);
  try
  {
    const resultado = await global.db.usaBilhete(codBil);
    console.log("INDEX.JS após chamar usaBilhete: "+resultado);
    res.render('fazUso', { title: 'Passe Urbano / Uso do Passe / Resultado', resultado });
  }
  catch (erro)
  {
    res.redirect("/?erro="+erro);
  }
  
});

router.get('/relat', function(req, res, next) {
  res.render('relat', { title: 'Passe Urbano / Relatório de Uso' });
});

router.post("/relatUso", async function(req, res) {
  try
  {
    var codigoBilhete = req.body.txtNumero;
      console.log("Index.JS: Vai escrever relatório de uso do bilhete: "+codigoBilhete);
      const resultados = await global.db.selectUsos(codigoBilhete);
      console.log(resultados);
      res.render("relatUso", 
           {title:'Passe Urbano / Relatório de Uso / Uso do Bilhete '+codigoBilhete, resultados});
  }
  catch (erro)
  {
      res.redirect("/?erro="+erro);
  }
});

module.exports = router;
