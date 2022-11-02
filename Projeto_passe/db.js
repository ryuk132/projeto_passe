const mysql = require("mysql2/promise");

async function connect()            // async -- função com comportamento assíncrono em seu interior
{
    if (global.connection && global.connection.state !== "disconnected")  // evita criar conexões adicionais se já houver uma aberta
       return global.connection;

    const connection = await mysql.createConnection(    // await atribuição esperará o retorno da função para continuar
        {                                               // await evitará termos de usar callbakcs
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: 'Suporte;123@',
            database: 'passe'
        }
    );
    console.log("Conectou no MySQL!");
    global.connection = connection;         // armazena a conexão feita no objeto de escopo global
    return global.connection;
}

connect();

async function selectCategorias()
{
    const conn = await connect();
    //console.log("Vai buscar as categorias no BD");
    const [rows] = await conn.query("Select * from categoria;");
    return rows;    
}

function codigoAleatorio(tamanho)
{
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < tamanho; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
   return result;
}

async function insertBilhete()
{
    let resultadoInsert = "0";
    //console.log("Em insertBihete, vai conectar ao BD");
    const conn = await connect();  // obtém a conexão ao BD
    var dataCriacao = new Date().toISOString().slice(0, 19).replace('T', ' ');
    var codigo = codigoAleatorio(10);
    const sql = "INSERT INTO bilhete (dataCriacao, codigo) values (?,?);";// insert com parâmetros "?"

    //console.log("O novo codigo é "+codigo+" a data é "+dataCriacao);
    try{
      let resultadoInsert = await conn.query(sql,[dataCriacao,codigo]);  // substitui os parâmetros pelos valores entre [ e ]
    }
    catch (erro)
    {
        return erro;
    }
    return codigo;
}

async function recargaBilhete(codigoBilhete, categoriaDesejada)
{
    const conn = await connect();
    const sqlBil = "SELECT idBilhete FROM Bilhete WHERE codigo=?";
    const [rows] = await conn.query(sqlBil, [codigoBilhete]);

    if (rows.length == 0)   // código do bilhete não encontrado. Retorna com mensagem.
    {
       //console.log("DB.JS: Não achou "+codigoBilhete+" "+categoriaDesejada);
       return "Bilhete não encontrado";
    }

    // verificar se há recarga desse bilhete na tabela de recargas e se 
    // precisa ser recarregado

    const sqlRecarga = "SELECT idRecarga FROM Recarga WHERE idBilhete=?";
    const [rowsRecarga] = await conn.query(sqlRecarga, [rows[0].idBilhete]);

    // vamos inserir um registro de recarga para esse bilhete:

        const sqlRec = "INSERT INTO Recarga "+
                    "(idBilhete, codigoCategoria, dataRecarga, estaExpirado) "+
                    "values ( ?, ?, ?, 0);";// insert com parâmetros "?" "0/1" é a verificação se a recarga esta expirada
        var dataCriacao = new Date();
        try
        {
            let resultadoInsert = await conn.query(sqlRec,
                        [rows[0].idBilhete, categoriaDesejada, dataCriacao]);  // substitui os parâmetros pelos valores entre [ e ]
        }
        catch (erro)
        {
            return "Impossível incluir essa recarga. Verifique.";
        }
        return "Recarga bem sucedida.";

}

async function usaBilhete(codigoBilhete)
{
    const conn = await connect();
    const sqlBil = "SELECT idBilhete FROM Bilhete WHERE codigo = ?";
    const [rows] = await conn.query(sqlBil, [codigoBilhete]);
    if (rows.length == 0)
    {
       console.log("DB.JS/usaBilhete: Não achou "+codigoBilhete);
       return "Bilhete não encontrado";
    }

    // aqui, temos um bilhete encontrado, então vamos inserir
    // os dados desta recarga na tabela de Recarga, associando
    // um registro dessa tabela ao registro da tabela Bilhete
    // que acabamos de acessar:

    //console.log("DB.JS/fazUso: Bilhete encontrado com id: "+rows[0].idBilhete);

    // 1. buscar uma recarga junto com a categoria do bilhete para 
    //    saber se bilhete já foi carregado, se não expirou e quantos
    //    minutos tem de duração o seu tempo de uso, de acordo com sua categoria
    const sqlRecarga = "SELECT idRecarga, R.codigoCategoria, validadeEmMinutos, "+
                       "dataRecarga, dataPrimeiroUso, dataExpiracao, "+
                       "dataSegundoUso, dataSegundaExpiracao, estaExpirado "+
                       "FROM Recarga R JOIN Categoria C ON R.codigoCategoria = C.codigoCategoria "+
                       "WHERE idBilhete = ? and estaExpirado = 0 "+
                       "ORDER BY dataRecarga";

    const [rowsRec] = await conn.query(sqlRecarga, [rows[0].idBilhete]);
    if (rowsRec.length == 0)
    {
        //console.log("DB.JS/usaBilhete: Não achou recargas de "+codigoBilhete);
        return "Bilhete não encontrado";
    }

    //console.log("DB.JS/usaBilhete: encontrou recarga: "+rowsRec[0].idRecarga);
    
    if (rowsRec[0].dataPrimeiroUso == null) // ainda não foi usado
    {
        //console.log("DB.JS/fazUso: bilhete ainda não foi usado.");
        var dataUso = new Date();           // cria objeto com a data atual
        var dataExpiracao = new Date();     // cria outro objeto com a data atual
        var dataU = dataUso.toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"});
       //console.log("DB.JS/fazUso: dataCriacao: "+dataU);
       //console.log("DB.JS/fazUso: vai somar "+rowsRec[0].validadeEmMinutos+" minutos");
        dataExpiracao.setMinutes(dataExpiracao.getMinutes()+rowsRec[0].validadeEmMinutos);
        var dataE= dataExpiracao.toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"}); 
    
        //console.log("DB.JS/fazUso: Expiração:"+dataE);

        const sqlUso = "UPDATE recarga "+
                       "SET dataPrimeiroUso = ?, "+
                       "    dataExpiracao = ? "+
                       "WHERE idRecarga = ?";
       try
       {
          //console.log(dataUso);
          //console.log(dataExpiracao);
          let resultadoUpdate = await conn.query(sqlUso, [dataUso, dataExpiracao, rowsRec[0].idRecarga]);  // substitui os parâmetros pelos valores entre [ e ] fazendo a atualizacao com os dados do primeiro uso do bilhete
       }
       catch (erro)
       {
            //console.log(erro);
            return "Impossível atualizar essa recarga. Verifique.";
       }
      return "Registro de uso bem sucedido. Pode utilizar até "+dataE;
    }
    else
    {
        //console.log("DB.JS/fazUso: bilhete já foi usado. Verificando validade.");
        var dataAtual = new Date();
        var dataExpiracao = new Date();
        //console.log(dataAtual.toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"}));
        //console.log(rowsRec[0].dataExpiracao);
        if (dataAtual > rowsRec[0].dataExpiracao)  
           if (rowsRec[0].codigoCategoria == 2)
            {
                //console.log("DB.JS/fazUso: Bilhete duplo, vou ver o que faço.");
                if (rowsRec[0].dataSegundoUso == null)
                {
                    //console.log("Ainda pode usar uma segunda vez.");
                    var dataC= dataAtual.toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"});
                    
                    dataExpiracao.setMinutes(dataExpiracao.getMinutes()+rowsRec[0].validadeEmMinutos);
                    var dataE= dataExpiracao.toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"});
                    //console.log("DB.JS/fazUso: Nova expiração:"+dataE);

                    const sqlUso = "UPDATE recarga "+
                       "SET dataSegundoUso = ?, "+
                       "    dataSegundaExpiracao = ? "+
                       "WHERE idRecarga = ?";

                    try{
                        let resultadoUpdate = await conn.query(sqlUso, [dataAtual, dataExpiracao, rowsRec[0].idRecarga]);  // substitui os parâmetros pelos valores entre [ e ]
                    }
                    catch (erro)
                    {
                        console.log(erro);
                        return "Impossível atualizar essa recarga. Verifique.";
                    }
                    return "Bilhete duplo, pode ser usado até "+dataE;
                }
                else  // já tem registro de segundo uso, verificar se está dentro do prazo
                {
                    //console.log("DB.JS/fazUso: Bilhete duplo já com 2o uso, vou ver validade!");
                    var dataAtual = new Date();
                    //console.log(dataAtual);
                    //console.log(rowsRec[0].dataSegundaExpiracao);
                    if (dataAtual > rowsRec[0].dataSegundaExpiracao)  
                    {
                        const sqlUso =  "UPDATE recarga "+
                                        "SET estaExpirado = true "+
                                        "WHERE idRecarga = ?";

                        try{
                            let resultadoUpdate = await conn.query(sqlUso, [rowsRec[0].idRecarga]);  // substitui os parâmetros pelos valores entre [ e ]
                        }
                        catch (erro)
                        {
                            //console.log(erro);
                            return "Impossível atualizar essa recarga. Verifique.";
                        }
                        return "Bilhete duplo expirado!";
                    }
                    else
                    return "Bilhete Duplo ainda dentro do prazo de validade. Pode ser usado até "+rowsRec[0].dataSegundaExpiracao;
                }           
            }
            else // não é bilhete duplo, tem que negar uso e marcar bilhete como expirado
            {
                const sqlUso =  "UPDATE recarga "+
                                "SET estaExpirado = true "+
                                "WHERE idRecarga = ?";
                try
                {
                    let resultadoUpdate = await conn.query(sqlUso, [rowsRec[0].idRecarga]);  // substitui os parâmetros pelos valores entre [ e ]
                }
                catch (erro)
                {
                    //console.log(erro);
                    return "Impossível incluir essa recarga. Verifique.";
                }
                return "Bilhete expirado!";
            }
        else
          return "Bilhete ainda dentro do prazo de validade. Pode ser usado até "+rowsRec[0].dataExpiracao;
    }

  return "saindo do teste de usaBilhete";
}

async function selectUsos(codigoBilhete)
{
    const conn = await connect();
    //console.log("Vai buscar os usos do Bilhete "+codigoBilhete+" no BD");
    var sql = "Select b.idBilhete, b.dataCriacao, b.codigo, "+
    "       r.idRecarga, r.codigoCategoria, c.descricaoCategoria, "+
    "       r.dataRecarga, r.dataPrimeiroUso, r.dataExpiracao, "+
    "       r.dataSegundoUso, r.dataSegundaExpiracao, "+
    "       r.estaExpirado "+
    "FROM (Bilhete b JOIN Recarga r ON b.idBilhete = r.IdBilhete) "+
    "     JOIN Categoria c on r.codigoCategoria = c.codigoCategoria "+
    "WHERE b.codigo = ? " +
    "ORDER BY r.dataRecarga"
    const [rows] = await conn.query(sql,codigoBilhete);
    return rows;    
}
module.exports = {selectCategorias, insertBilhete, recargaBilhete, usaBilhete, selectUsos};        // permite compartilhar objetos com o restante da aplicação