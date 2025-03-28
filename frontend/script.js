// Define a URL base da API como constante
const API_BASE_URL = "http://localhost/todo-app/backend/api.php/tasks";

// Seleciona os elementos do DOM
const taskForm = document.getElementById("task-form");
const taskTitleInput = document.getElementById("task-title");
const taskDescriptionInput = document.getElementById("task-description");
const taskList = document.getElementById("task-list");
const filterSelect = document.getElementById("filter-tasks");

// Verifica se os elementos necessários existem antes de usá-los
if (!taskForm || !taskTitleInput || !taskDescriptionInput || !taskList) {
  console.error(
    "Alguns elementos do formulário ou da lista de tarefas não foram encontrados."
  );
}

if (filterSelect) {
  filterSelect.addEventListener("change", fetchTasks); // Atualiza a lista ao alterar o filtro
} else {
  console.error("O elemento de filtro não foi encontrado.");
}

// Define o modal para exibir a descrição de uma tarefa
const modal = document.createElement("div");
modal.id = "description-modal";
modal.className =
  "fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center hidden";
modal.innerHTML = `
  <div class="bg-white p-4 rounded shadow-lg w-1/2">
    <h2 class="text-lg font-bold mb-2">Descrição da Tarefa</h2>
    <p id="modal-description" class="mb-4"></p>
    <button id="close-modal" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Fechar</button>
  </div>
`;
document.body.appendChild(modal);

// Fecha o modal de descrição ao clicar no botão "Fechar"
const closeModalButton = document.getElementById("close-modal");
if (closeModalButton) {
  closeModalButton.addEventListener("click", () => {
    modal.classList.add("hidden");
  });
} else {
  console.error("O botão de fechar do modal não foi encontrado.");
}

// Define o modal para edição de tarefas
const editModal = document.createElement("div");
editModal.id = "edit-modal";
editModal.className =
  "fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center hidden";
editModal.innerHTML = `
  <div class="bg-white p-4 rounded shadow-lg w-1/2">
    <h2 class="text-lg font-bold mb-2">Editar Tarefa</h2>
    <form id="edit-form">
      <div class="mb-4">
        <label for="edit-title" class="block text-sm font-medium text-gray-700">Título</label>
        <input type="text" id="edit-title" class="w-full border border-gray-300 rounded p-2" />
      </div>
      <div class="mb-4">
        <label for="edit-description" class="block text-sm font-medium text-gray-700">Descrição</label>
        <textarea id="edit-description" class="w-full border border-gray-300 rounded p-2"></textarea>
      </div>
      <div class="flex justify-end gap-2">
        <button type="button" id="cancel-edit" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancelar</button>
        <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Salvar</button>
      </div>
    </form>
  </div>
`;
document.body.appendChild(editModal);

// Fecha o modal de edição ao clicar no botão "Cancelar"
document.getElementById("cancel-edit").addEventListener("click", () => {
  editModal.classList.add("hidden");
});

// Carrega as tarefas quando a página é carregada
document.addEventListener("DOMContentLoaded", () => {
  if (typeof fetchTasks === "function") {
    fetchTasks();
  } else {
    console.error("A função fetchTasks não está definida.");
  }
});

// Adiciona uma nova tarefa ao submeter o formulário
taskForm.addEventListener("submit", async (event) => {
  event.preventDefault(); // Impede o envio padrão do formulário

  const title = taskTitleInput.value.trim(); // Remove espaços extras do título
  const description = taskDescriptionInput.value.trim(); // Remove espaços extras da descrição

  // Validação no frontend
  if (!title) {
    alert("O título é obrigatório.");
    return;
  }

  try {
    // Envia a requisição POST para criar a tarefa
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify({ title, description: description || "" }),
    });

    // Verifica se a requisição foi bem-sucedida
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Erro ao adicionar tarefa");
    }

    // Limpa o formulário e atualiza a lista
    taskForm.reset();
    await fetchTasks();
  } catch (error) {
    console.error("Erro ao adicionar tarefa:", error);
    alert(error.message);
  }
});

/**
 * Busca todas as tarefas da API e as exibe em uma tabela.
 */
async function fetchTasks() {
  try {
    // Faz a requisição GET para listar as tarefas
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Erro ao carregar tarefas");
    }

    // Converte a resposta em JSON
    const tasks = await response.json();
    taskList.innerHTML = ""; // Limpa a lista atual

    // Filtra as tarefas com base no filtro selecionado
    const filter = filterSelect.value;
    const filteredTasks = tasks.filter((task) => {
      if (filter === "all") return true; // Exibe todas as tarefas
      if (filter === "completed") return task.status === 1; // Exibe apenas concluídas
      if (filter === "todo") return task.status === 0; // Exibe apenas "a fazer"
    });

    // Cria a estrutura da tabela
    const table = document.createElement("table");
    table.className = "w-full border-collapse border border-gray-300";

    // Cabeçalho da tabela
    table.innerHTML = `
      <thead>
        <tr class="bg-gray-100">
          <th class="border border-gray-300 p-2">ID</th>
          <th class="border border-gray-300 p-2">Título</th>
          <th class="border border-gray-300 p-2">Data de Criação</th>
          <th class="border border-gray-300 p-2">Ações</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const tbody = table.querySelector("tbody");

    // Adiciona as tarefas como linhas na tabela
    filteredTasks.forEach((task) => {
      const row = document.createElement("tr");
      row.className = `hover:bg-gray-50 ${
        task.status ? "bg-green-100 hover:bg-green-200" : ""
      }`;

      // Preenche a linha com os dados da tarefa
      row.innerHTML = `
        <td class="border border-gray-300 p-2 text-center">${task.id}</td>
        <td class="border border-gray-300 p-2 ${
          task.status ? "line-through" : ""
        }">
          ${task.title}
        </td>
        <td class="border border-gray-300 p-2 text-center">${new Date(
          task.created_at
        ).toLocaleString()}</td>
        <td class="border border-gray-300 p-2 text-center">
          <!-- Botão para alternar o status da tarefa -->
          <button 
            class="toggle-btn text-green-500 hover:text-green-700 mx-1" 
            data-id="${task.id}" 
            data-status="${task.status}" 
            title="${task.status ? "Desmarcar" : "Concluir"}"
          >
            <i class='bx ${
              task.status ? "bx-check-circle" : "bx-circle"
            } text-xl'></i>
          </button>
          <!-- Botão para visualizar a descrição -->
          <button 
            class="view-description-btn text-blue-500 hover:text-blue-700 mx-1" 
            data-description="${task.description}" 
            title="Visualizar Descrição"
          >
            <i class='bx bx-show text-xl'></i>
          </button>
          <!-- Botão para editar a tarefa -->
          <button 
            class="edit-btn text-yellow-500 hover:text-yellow-700 mx-1" 
            data-id="${task.id}" 
            data-title="${task.title}" 
            data-description="${task.description}" 
            data-status="${task.status}" 
            title="Editar"
          >
            <i class='bx bx-pencil text-xl'></i>
          </button>
          <!-- Botão para excluir a tarefa -->
          <button 
            class="delete-btn text-red-500 hover:text-red-700 mx-1" 
            data-id="${task.id}"
            title="Excluir"
          >
            <i class='bx bx-trash text-xl'></i>
          </button>
        </td>
      `;

      tbody.appendChild(row);
    });

    taskList.appendChild(table);

    // Adiciona eventos aos botões após criar os elementos
    document.querySelectorAll(".toggle-btn").forEach((button) => {
      button.addEventListener("click", () =>
        toggleTask(button.dataset.id, button.dataset.status)
      );
    });

    document.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", () => deleteTask(button.dataset.id));
    });

    document.querySelectorAll(".view-description-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const description = button.dataset.description;
        document.getElementById("modal-description").textContent = description;
        modal.classList.remove("hidden");
      });
    });

    document.querySelectorAll(".edit-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const id = button.dataset.id;
        const title = button.dataset.title;
        const description = button.dataset.description;
        const status = button.dataset.status;

        // Preenche os campos do modal com os dados da tarefa
        document.getElementById("edit-title").value = title;
        document.getElementById("edit-description").value = description;

        // Exibe o modal de edição
        editModal.classList.remove("hidden");

        // Adiciona evento para salvar as alterações
        const editForm = document.getElementById("edit-form");
        editForm.onsubmit = async (event) => {
          event.preventDefault();

          try {
            const response = await fetch(`${API_BASE_URL}/${id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json; charset=UTF-8" },
              body: JSON.stringify({
                title: document.getElementById("edit-title").value.trim(),
                description: document
                  .getElementById("edit-description")
                  .value.trim(),
                status: parseInt(status),
              }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || "Erro ao editar tarefa");
            }

            // Fecha o modal e atualiza a lista
            editModal.classList.add("hidden");
            await fetchTasks();
          } catch (error) {
            console.error("Erro ao editar tarefa:", error);
            alert(error.message);
          }
        };
      });
    });
  } catch (error) {
    // Exibe mensagem de erro no console e na interface
    console.error("Erro ao buscar tarefas:", error);
    taskList.innerHTML = `<p class="text-red-500">${error.message}</p>`;
  }
}

/**
 * Alterna o status de uma tarefa (concluída/não concluída).
 * @param {string} id - ID da tarefa.
 * @param {string} currentStatus - Status atual (0 ou 1).
 */
async function toggleTask(id, currentStatus) {
  const newStatus = currentStatus === "1" ? 0 : 1; // Inverte o status

  try {
    // Busca os dados atuais da tarefa para enviar junto com o status
    const taskRow = document
      .querySelector(`button[data-id="${id}"]`)
      .closest("tr");
    const title = taskRow.querySelector("td:nth-child(2)").textContent.trim();

    // Faz a requisição PUT para atualizar o status da tarefa
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify({
        title,
        status: newStatus,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Erro ao atualizar tarefa");
    }

    // Atualiza a lista de tarefas após sucesso
    await fetchTasks();
  } catch (error) {
    // Exibe mensagem de erro no console e na interface
    console.error("Erro ao alternar tarefa:", error);
    alert(error.message);
  }
}

/**
 * Exclui uma tarefa da lista.
 * @param {string} id - ID da tarefa.
 */
async function deleteTask(id) {
  try {
    // Faz a requisição DELETE para excluir a tarefa
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "DELETE",
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Erro ao excluir tarefa");
    }

    // Atualiza a lista de tarefas após sucesso
    await fetchTasks();
  } catch (error) {
    // Exibe mensagem de erro no console e na interface
    console.error("Erro ao excluir tarefa:", error);
    alert(error.message);
  }
}
