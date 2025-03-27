<?php
// Inclui o arquivo de conexão com o banco de dados
require_once 'db_connection.php';

// Define cabeçalhos para permitir requisições da API
header('Content-Type: application/json; charset=UTF-8'); // Define o tipo de conteúdo como JSON
header('Access-Control-Allow-Origin: *'); // Permite requisições de qualquer origem
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE'); // Permite os métodos HTTP especificados
header('Access-Control-Allow-Headers: Content-Type'); // Permite o cabeçalho Content-Type

// Obtém a conexão com o banco de dados
$pdo = getDatabaseConnection();

// Captura o método HTTP da requisição
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Divide o caminho da URL em partes
$requestUri = trim($_SERVER['REQUEST_URI'], '/');
$basePath = 'todo-app/backend/api.php'; // Caminho base esperado
$requestPath = explode('/', str_replace($basePath, '', $requestUri));

// Remove partes vazias do array e reindexa
$requestPath = array_values(array_filter($requestPath));

// Verifica se a rota começa com 'tasks'
if (!empty($requestPath) && $requestPath[0] === 'tasks') {
    // Converte o ID para inteiro, se existir, ou null se não houver
    $taskId = isset($requestPath[1]) ? (int) $requestPath[1] : null;

    // Processa a requisição com base no método HTTP
    switch ($requestMethod) {
        case 'GET':
            // Lida com requisições GET para buscar tarefas
            if ($taskId) {
                // Busca uma tarefa específica pelo ID
                $statement = $pdo->prepare('SELECT id, title, description, status, created_at FROM tasks WHERE id = :id');
                $statement->execute(['id' => $taskId]);
                $task = $statement->fetch();

                if ($task) {
                    // Retorna a tarefa encontrada
                    http_response_code(200);
                    echo json_encode($task, JSON_UNESCAPED_UNICODE);
                } else {
                    // Retorna erro se a tarefa não for encontrada
                    http_response_code(404);
                    echo json_encode(['error' => 'Tarefa não encontrada'], JSON_UNESCAPED_UNICODE);
                }
            } else {
                // Lista todas as tarefas
                $statement = $pdo->query('SELECT id, title, description, status, created_at FROM tasks');
                $tasks = $statement->fetchAll();
                http_response_code(200);
                echo json_encode($tasks, JSON_UNESCAPED_UNICODE);
            }
            break;

        case 'POST':
            // Lida com requisições POST para criar uma nova tarefa
            $inputData = json_decode(file_get_contents('php://input'), true);

            // Verifica se o título foi fornecido
            if (empty($inputData['title'])) {
                http_response_code(400);
                echo json_encode(['error' => 'O campo título é obrigatório'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            // Define os valores da nova tarefa
            $title = $inputData['title'];
            $description = $inputData['description'] ?? '';
            $status = 0; // Status padrão: não concluído

            try {
                // Insere a nova tarefa no banco de dados
                $statement = $pdo->prepare(
                    'INSERT INTO tasks (title, description, status) VALUES (:title, :description, :status)'
                );
                $statement->execute([
                    'title' => $title,
                    'description' => $description,
                    'status' => $status
                ]);

                // Retorna a resposta de sucesso com o ID da nova tarefa
                http_response_code(201);
                echo json_encode(['message' => 'Tarefa criada', 'id' => $pdo->lastInsertId()], JSON_UNESCAPED_UNICODE);
            } catch (PDOException $e) {
                // Retorna erro em caso de falha na inserção
                http_response_code(500);
                echo json_encode(['error' => 'Erro ao criar tarefa: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
            }
            break;

        case 'PUT':
            // Lida com requisições PUT para atualizar uma tarefa
            if (!$taskId) {
                // Verifica se o ID foi fornecido
                http_response_code(400);
                echo json_encode(['error' => 'ID da tarefa não fornecido'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            // Lê os dados enviados no corpo da requisição
            $inputData = json_decode(file_get_contents('php://input'), true);

            // Verifica se pelo menos o campo 'status' foi enviado
            if (!isset($inputData['status'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Campos obrigatórios não fornecidos'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            try {
                // Atualiza apenas os campos enviados no banco de dados
                $fieldsToUpdate = [];
                $params = ['id' => $taskId];

                if (isset($inputData['title'])) {
                    $fieldsToUpdate[] = 'title = :title';
                    $params['title'] = $inputData['title'];
                }

                if (isset($inputData['description'])) {
                    $fieldsToUpdate[] = 'description = :description';
                    $params['description'] = $inputData['description'];
                }

                if (isset($inputData['status'])) {
                    $fieldsToUpdate[] = 'status = :status';
                    $params['status'] = $inputData['status'];
                }

                // Monta a query de atualização dinamicamente
                $sql = 'UPDATE tasks SET ' . implode(', ', $fieldsToUpdate) . ' WHERE id = :id';
                $statement = $pdo->prepare($sql);
                $statement->execute($params);

                // Verifica se a tarefa foi encontrada e atualizada
                if ($statement->rowCount() > 0) {
                    http_response_code(200);
                    echo json_encode(['message' => 'Tarefa atualizada com sucesso'], JSON_UNESCAPED_UNICODE);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Tarefa não encontrada'], JSON_UNESCAPED_UNICODE);
                }
            } catch (PDOException $e) {
                // Retorna erro em caso de falha na atualização
                http_response_code(500);
                echo json_encode(['error' => 'Erro ao atualizar tarefa: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
            }
            break;

        case 'DELETE':
            // Lida com requisições DELETE para excluir uma tarefa
            if (!$taskId) {
                // Verifica se o ID foi fornecido
                http_response_code(400);
                echo json_encode(['error' => 'ID da tarefa é obrigatório'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            try {
                // Deleta a tarefa do banco de dados
                $statement = $pdo->prepare('DELETE FROM tasks WHERE id = :id');
                $statement->execute(['id' => $taskId]);

                if ($statement->rowCount() > 0) {
                    // Retorna sucesso se a tarefa foi deletada
                    http_response_code(200);
                    echo json_encode(['message' => 'Tarefa deletada'], JSON_UNESCAPED_UNICODE);
                } else {
                    // Retorna erro se a tarefa não foi encontrada
                    http_response_code(404);
                    echo json_encode(['error' => 'Tarefa não encontrada'], JSON_UNESCAPED_UNICODE);
                }
            } catch (PDOException $e) {
                // Retorna erro em caso de falha na exclusão
                http_response_code(500);
                echo json_encode(['error' => 'Erro ao excluir tarefa: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
            }
            break;

        default:
            // Retorna erro para métodos HTTP não permitidos
            http_response_code(405);
            echo json_encode(['error' => 'Método não permitido'], JSON_UNESCAPED_UNICODE);
            break;
    }
} else {
    // Retorna erro se a rota não for encontrada
    http_response_code(404);
    echo json_encode(['error' => 'Rota não encontrada'], JSON_UNESCAPED_UNICODE);
}
