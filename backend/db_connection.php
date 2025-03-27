<?php
// Define constantes para configurações do banco de dados (evita "magic strings")
const DB_HOST = 'localhost'; // Host do banco de dados
const DB_NAME = 'todo_app'; // Nome do banco de dados
const DB_USER = 'root'; // Usuário do banco (padrão do XAMPP)
const DB_PASS = ''; // Senha do banco (vazia no XAMPP por padrão)
const DB_CHARSET = 'utf8mb4'; // Codificação UTF-8 completa

/**
 * Estabelece conexão com o banco de dados MySQL usando PDO.
 * 
 * @return PDO Objeto de conexão com o banco de dados.
 * @throws PDOException Em caso de falha na conexão.
 */
function getDatabaseConnection()
{
    try {
        // Monta a string DSN (Data Source Name) para conexão PDO
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;

        // Cria a instância do PDO com as credenciais
        $pdo = new PDO($dsn, DB_USER, DB_PASS);

        // Configura o PDO para lançar exceções em caso de erro
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // Define o modo de fetch padrão como associativo
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

        // Retorna o objeto de conexão PDO
        return $pdo;
    } catch (PDOException $e) {
        // Define o cabeçalho para resposta JSON com UTF-8
        header('Content-Type: application/json; charset=UTF-8');

        // Define o código HTTP 500 (erro interno do servidor)
        http_response_code(500);

        // Retorna uma mensagem de erro em JSON e encerra a execução
        echo json_encode(['error' => 'Erro ao conectar ao banco: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
        exit;
    }
}
