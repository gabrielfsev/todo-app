# Todo App

Uma aplicação simples de lista de tarefas (To-Do List) construída com **PHP**, **MySQL**, **JavaScript** e **TailwindCSS**. Este projeto permite criar, visualizar, editar, excluir e filtrar tarefas.

## Funcionalidades

- **Adicionar Tarefa**: Crie novas tarefas com título e descrição.
- **Visualizar Tarefas**: Veja todas as tarefas em uma tabela.
- **Editar Tarefa**: Atualize o título e a descrição de uma tarefa existente.
- **Excluir Tarefa**: Remova tarefas da lista.
- **Alternar Status**: Marque tarefas como concluídas ou "a fazer".
- **Filtrar Tarefas**: Filtre tarefas por "Todas", "Concluídas" ou "A Fazer".
- **Modal de Edição**: Edite tarefas em um modal interativo.
- **Modal de Visualização**: Veja a descrição completa de uma tarefa.

## Tecnologias Utilizadas

- **Frontend**:
  - HTML5
  - JavaScript (Vanilla)
  - TailwindCSS
  - [Boxicons](https://boxicons.com/) (ícones)

- **Backend**:
  - PHP (com PDO para conexão ao banco de dados)
  - MySQL

## Estrutura do Projeto

```plaintext
todo-app/
├── backend/
│   ├── api.php               # API para gerenciar as tarefas
│   ├── db_connection.php     # Conexão com o banco de dados
├── frontend/
│   ├── index.html            # Interface do usuário
│   ├── script.js             # Lógica do frontend
├── README.md                 # Documentação do projeto
```

## Pré-requisitos

- **XAMPP** ou outro servidor local com suporte a PHP e MySQL.
- Navegador moderno (Google Chrome, Firefox, etc.).

## Configuração do Banco de Dados

1. Crie um banco de dados chamado `todo_app` no MySQL.
2. Execute o seguinte script SQL para criar a tabela `tasks`:

```sql
CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Como Executar o Projeto

1. Clone este repositório ou faça o download do código.
2. Coloque a pasta `todo-app` no diretório `htdocs` do XAMPP.
3. Inicie o servidor Apache e o MySQL no painel de controle do XAMPP.
4. Acesse o projeto no navegador: `http://localhost/todo-app/frontend/index.html`.

## Endpoints da API

### **GET** `/tasks`
Retorna todas as tarefas.

### **GET** `/tasks/{id}`
Retorna uma tarefa específica pelo ID.

### **POST** `/tasks`
Cria uma nova tarefa.

- **Body** (JSON):
  ```json
  {
    "title": "Título da tarefa",
    "description": "Descrição da tarefa"
  }
  ```

### **PUT** `/tasks/{id}`
Atualiza uma tarefa existente.

- **Body** (JSON):
  ```json
  {
    "title": "Novo título",
    "description": "Nova descrição",
    "status": 1
  }
  ```

### **DELETE** `/tasks/{id}`
Exclui uma tarefa pelo ID.

## Personalização

- **Estilo**: O projeto utiliza **TailwindCSS** para estilização. Você pode personalizar o estilo editando o arquivo `index.html`.
- **Ícones**: Os ícones são fornecidos pela biblioteca [Boxicons](https://boxicons.com/).

## Possíveis Problemas

### Erro 404 (Not Found)
- Certifique-se de que o caminho para o arquivo `api.php` está correto.
- Verifique se o servidor Apache está em execução.

### Erro 500 (Internal Server Error)
- Verifique a configuração do banco de dados no arquivo `db_connection.php`.
- Certifique-se de que a tabela `tasks` foi criada corretamente.

### Erro ao Alternar Status
- Certifique-se de que o backend está recebendo os campos `title`, `description` e `status` na requisição `PUT`.

---

Desenvolvido por Gabriel Ferreira Severino.
