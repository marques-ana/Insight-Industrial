// gerencia.js

// =======================================================================
// LÓGICA DE INICIALIZAÇÃO DA PÁGINA DE GERÊNCIA DE USUÁRIOS (Professor)
// =======================================================================

function initializeGerenciaUsuarioPage() {
    // RN05: Garante que só o Professor acesse
    if (!currentUser || currentUser.tipo !== 'Professor') {
        alert('Acesso negado. Apenas professores podem acessar esta página.');
        window.location.href = 'bancadas.html'; 
        return;
    }

    // Atualiza o cabeçalho
    document.getElementById('display-user-name').textContent = `${currentUser.nome} ${currentUser.sobrenome}`;
    document.getElementById('display-user-type').textContent = currentUser.tipo;

    // Conecta o formulário de CRUD de usuário
    document.getElementById('form-user-crud').addEventListener('submit', handleUserFormSubmit);
    
    // Carrega a lista de usuários
    renderUsersTable();
}

// =======================================================================
// LÓGICA DE CRUD (RF01)
// (Inclua aqui suas funções 'renderUsersTable', 'toggleUserForm', 
// 'editUser', 'deleteUser', 'handleUserFormSubmit')
// =======================================================================

function renderUsersTable() {
    // ... Lógica para listar a tabela de usuários (usando USERS de data.js)
    const tbody = document.getElementById('users-table-body');
    tbody.innerHTML = ''; 

    USERS.forEach(user => {
        const row = tbody.insertRow();
        const nameCell = row.insertCell();
        nameCell.textContent = `${user.nome} ${user.sobrenome}`; 
        const typeCell = row.insertCell();
        typeCell.textContent = user.tipo; 
        const emailCell = row.insertCell();
        emailCell.textContent = user.email; 
        const actionsCell = row.insertCell();
        actionsCell.innerHTML = `
            <button class="action-btn edit-btn" onclick="toggleUserForm('edit', ${user.id})">Editar</button>
            <button class="action-btn delete-btn" onclick="deleteUser(${user.id})">Excluir</button>
        `;
    });
}

function toggleUserForm(mode, userId = null) {
    // ... Lógica para mostrar/ocultar formulário
    const formContainer = document.getElementById('user-form-container');
    const formTitle = document.getElementById('form-title');
    const submitBtn = document.getElementById('submit-btn');

    document.getElementById('form-user-crud').reset();
    document.getElementById('user-id').value = '';
    
    if (mode === 'create') {
        formContainer.style.display = 'block';
        formTitle.textContent = 'Cadastrar';
        submitBtn.textContent = 'Salvar Novo Usuário';
        document.getElementById('email').readOnly = false;
        document.getElementById('senha').required = true;
    } else if (mode === 'edit') {
        formContainer.style.display = 'block';
        formTitle.textContent = 'Editar';
        submitBtn.textContent = 'Salvar Alterações';
        editUser(userId); 
        document.getElementById('email').readOnly = true;
        document.getElementById('senha').required = false;
    } else {
        formContainer.style.display = 'none';
    }
}

function editUser(userId) {
    // ... Lógica para preencher o formulário
}

function deleteUser(userId) {
    // ... Lógica de exclusão (chamando saveUsers() para persistir)
    if (currentUser && currentUser.id === userId) {
        alert('Você não pode excluir sua própria conta!');
        return;
    }
    
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
        USERS = USERS.filter(u => u.id !== userId);
        alert('Usuário excluído com sucesso.');
        saveUsers(); 
        renderUsersTable(); 
    }
}

function handleUserFormSubmit(e) {
    // ... Lógica de Criação/Edição de Usuário (chamando saveUsers() para persistir)
    // Nota: Lembre-se de usar nextUserId++ para IDs
    
    // Exemplo do final da função:
    // ...
    saveUsers(); // Salva a alteração
    toggleUserForm('hide');
    renderUsersTable();
}


// Chama a inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initializeGerenciaUsuarioPage);