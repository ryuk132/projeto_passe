// Carrega o módulo promise que permite acesso ao MySQL:
//
const mysql = require("mysql2/promise");

//
// Função que efetua a conexão ao servidor de banco de dados
// MySQL, banco de dados "Passe",usuário "root", senha "Suporte;123@"
async function connect()
{
    if (global.connection && global.connection.state !== "disconnected")  // evita criar conexões adicionais se já houver uma aberta
       return global.connection;

    const connection = await mysql.createConnection(    // await esperará o retorno da função para continuar
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

connect();      // Executa a conexão ao servidor de banco de dados

//
// A função abaixo busca, no banco de dados, os registros de categorias de passe
// que foram cadastrados
async function selectCategorias()
{
    const conn = await connect();
    const [rows] = await conn.query("Select * from categoria;");
    return rows;    
}

//
// A função abaixo gera e retorna um código aleatório, a partir dos caracteres presentes
// na variável characters. O tamanho do código gerado é passado como parâmetro
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

// A função abaixo faz a conexão ao banco de dados, através da função connect()
// descrita acima, obtém a data e hora atuais como sendo o momento de criação 
// do bilhete e gera um código aleatório (de tamanho 10) para esse bilhete.
//
// Em seguida, cria uma string contendo o comando INSERT necessário para gravar
// o registro desse bilhete na tabela BILHETE do banco de dados.
// Para evitar SQL Injection, são usados parâmetros nesse comando INSERT (representados
// pelo caracter ?). No momento de execução do INSERT, os parâmetros são substituídos
// pelos valores apresentados entre [ e ].
// Ao final, se tudo deu certo, retorna o código gerado para esse novo bilhete.
// Se houver algum erro, retorna a mensagem de erro.
//
async function insertBilhete()
{
    let resultadoInsert = "0";
    const conn = await connect();  // obtém a conexão ao BD
    var dataCriacao = new Date().toISOString().slice(0, 19).replace('T', ' ');
    var codigo = codigoAleatorio(10);
    const sql = "INSERT INTO bilhete (dataCriacao, codigo) values (?,?);";// insert com parâmetros "?"
    try
    {
      let resultadoInsert = await conn.query(sql,[dataCriacao,codigo]);  // substitui os parâmetros pelos valores entre [ e ]
    }
    catch (erro)
    {
        return erro;
    }
    return codigo;
}

//
// A função abaixo recebe como parâmetros o código do bilhete que se deseja
// recarregar e a categoria de recarga desejada.
// Em seguida, é feita a conexão ao banco de dados e executado um comando
// SELECT para buscar o valor do campo que identifica esse bilhete (um 
// campo definido no banco de dados com o nome idBilhete, auto-incremento,
// que também é a chave primária dessa tabela).
// O resultado desse SELECT fica armazenado na coleção [rows].
// Se essa coleção for vazia, significa que não foi encontrado bilhete com
// o código digitado e recebido como parâmetro.
// Casa haja registros retornados pelo SELECT, usamos o idBilhete (PK) para
// acessar, na tabela de Recargas, o registro de recarga desse bilhete, a fim
// de conhecermos o valor da chave primária dessa tabela para esse bilhete
// (campo idRecarga).
//
async function recargaBilhete(codigoBilhete, categoriaDesejada)
{
    const conn = await connect();
    const sqlBil = "SELECT idBilhete FROM Bilhete WHERE codigo=?";
    const [rows] = await conn.query(sqlBil, [codigoBilhete]);

    if (rows.length == 0)   // código do bilhete não encontrado. Retorna com mensagem.
    {
       return "Bilhete não encontrado";
    }

    // verificar se há recarga desse bilhete na tabela de recargas e se 
    // precisa ser recarregado
    // const sqlRecarga = "SELECT idRecarga FROM Recarga WHERE idBilhete=?";
    // const [rowsRecarga] = await conn.query(sqlRecarga, [rows[0].idBilhete]);
    
    // vamos inserir um registro de recarga para esse bilhete:

    const sqlRec = "INSERT INTO Recarga "+
                "(idBilhete, codigoCategoria, dataRecarga, estaExpirado) "+
                "values ( ?, ?, ?, 0);";// insert com parâmetros "?"
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

//
// Função que registra o uso do bilhete cujo código é passado como parâmetro.
// Esse código foi digitado pelo usuário na página web uso.ejs
//
async function usaBilhete(codigoBilhete)
{
    // acessa o banco de dados para obter o idBilhete (PK) referente ao
    // bilhete cujo código foi digitado e passado como parâmetro:
    const conn = await connect();
    const sqlBil = "SELECT idBilhete FROM Bilhete WHERE codigo = ?";
    const [rows] = await conn.query(sqlBil, [codigoBilhete]);

    if (rows.length == 0)   // não achou registro com esse código
    {
       return "Bilhete não encontrado";
    }

    // aqui, temos um bilhete encontrado, então vamos inserir
    // os dados desta recarga na tabela de Recarga, associando
    // um registro dessa tabela ao registro da tabela Bilhete
    // que acabamos de acessar:

    // 1. buscar uma recarga junto comcategoria do bilhete para 
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
        return "Bilhete não encontrado";
    }

    // Aqui, temos um bilhete com registro de recarga encontrado e vamos
    // verificar a situação dessa recarga e do uso do bilhete, para decidir
    // se e como a recarga será feita:
    //
    if (rowsRec[0].dataPrimeiroUso == null) // ainda não foi usado
    {
        var dataUso = new Date();           // cria objeto com a data atual
        var dataExpiracao = new Date();     // cria outro objeto com a data atual
 
        // calcula a data de expiração,somando os minutos de validade correspondentes
        // à categoria da recarga:
        dataExpiracao.setMinutes(dataExpiracao.getMinutes()+rowsRec[0].validadeEmMinutos);
        
        // converte as datas para o formato brasileiro:
        var dataU = dataUso.toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"});
        var dataE= dataExpiracao.toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"}); 
    
        // faz a atualização do registro de Recarga, para que as datas de primeiro uso e de
        // expiração sejam conhecidas:

        const sqlUso = "UPDATE recarga "+
                       "SET dataPrimeiroUso = ?, "+
                       "    dataExpiracao = ? "+
                       "WHERE idRecarga = ?";

       try  // executa o UPDATE acima usado como parâmetros os dados entre [ e ]:
       {
          let resultadoUpdate = await conn.query(sqlUso, [dataUso, dataExpiracao, rowsRec[0].idRecarga]);  // substitui os parâmetros pelos valores entre [ e ]
       }
       catch (erro)
       {
            return "Impossível atualizar essa recarga. Verifique.";
       }
      return "Registro de uso bem sucedido. Pode utilizar até "+dataE;
    }

    else    // Aqui, o bilhete já foi usado ao menos uma vez e verificaremos se ainda é válido
    {
        var dataAtual = new Date();
        var dataExpiracao = new Date();
        if (dataAtual > rowsRec[0].dataExpiracao)   // ainda está dentro da validade 
           if (rowsRec[0].codigoCategoria == 2)     // bilhete duplo, vamos ver se pode ser usado
            {
                if (rowsRec[0].dataSegundoUso == null)  // não foi usado ainda pela 2a vez
                {
                    var dataC= dataAtual.toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"});

                    // Calcula nova data para a segunda expiração
                    dataExpiracao.setMinutes(dataExpiracao.getMinutes()+rowsRec[0].validadeEmMinutos);
                    var dataE= dataExpiracao.toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"});

                    const sqlUso = "UPDATE recarga "+
                       "SET dataSegundoUso = ?, "+
                       "    dataSegundaExpiracao = ? "+
                       "WHERE idRecarga = ?";

                    try   // executa o UPDATE acima usado como parâmetros os dados entre [ e ]:
                    { 
                        let resultadoUpdate = await conn.query(sqlUso, [dataAtual, dataExpiracao, rowsRec[0].idRecarga]);  // substitui os parâmetros pelos valores entre [ e ]
                    }
                    catch (erro)
                    {
                        return "Impossível atualizar essa recarga. Verifique.";
                    }
                    return "Bilhete duplo, pode ser usado até "+dataE;
                }
                else  // já tem registro de segundo uso, verificar se está dentro do prazo
                {
                    var dataAtual = new Date();
                    if (dataAtual > rowsRec[0].dataSegundaExpiracao)  // dentro da validade do segundo uso
                    {
                        const sqlUso =  "UPDATE recarga "+
                                        "SET estaExpirado = true "+
                                        "WHERE idRecarga = ?";

                        try     // executa o UPDATE acima usado como parâmetros os dados entre [ e ]:
                        {
                            let resultadoUpdate = await conn.query(sqlUso, [rowsRec[0].idRecarga]);  // substitui os parâmetros pelos valores entre [ e ]
                        }
                        catch (erro)
                        {
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

                try     // executa o UPDATE acima usado como parâmetros os dados entre [ e ]:
                {
                    let resultadoUpdate = await conn.query(sqlUso, [rowsRec[0].idRecarga]);  // substitui os parâmetros pelos valores entre [ e ]
                }
                catch (erro)
                {
                    return "Impossível incluir essa recarga. Verifique.";
                }
                return "Bilhete expirado!";
            }
        else
          return "Bilhete ainda dentro do prazo de validade. Pode ser usado até "+rowsRec[0].dataExpiracao;
    }

  return "saindo do teste de usaBilhete";
}

// Busca e retorna os registros de uso do bilhete cujo código foi digitado na página web relat.ejs e
// foi passado como parâmetro para esta função:
// Os registros serão retornados para a página web relatUso.ejs processar e exibir numa tabela:
//
async function selectUsos(codigoBilhete)
{
    const conn = await connect();
    console.log("Vai buscar os usos do Bilhete "+codigoBilhete+" no BD");
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