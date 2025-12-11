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

    document.getElementById('display-user-name').textContent = `${currentUser.nome} ${currentUser.sobrenome}`;
    document.getElementById('display-user-type').textContent = currentUser.tipo;

    // Conecta o formulário de CRUD de usuário
    document.getElementById('form-user-crud').addEventListener('submit', handleUserFormSubmit);
    
    // Carrega a lista de usuários
    renderUsersTable();
}

// =======================================================================
// LÓGICA DE CRUD (RF01)
// =======================================================================

function renderUsersTable() {
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
    const formContainer = document.getElementById('user-form-container');
    const formTitle = document.getElementById('form-title');
    const submitBtn = document.getElementById('submit-btn');

    document.getElementById('form-user-crud').reset();
    document.getElementById('user-id').value = '';
    
    if (mode === 'create') {
        formContainer.style.display = 'block';
        formTitle.textContent = 'Cadastrar Novo Usuário';
        submitBtn.textContent = 'Salvar Novo Usuário';
        document.getElementById('email').readOnly = false;
        document.getElementById('senha').required = true;
    } else if (mode === 'edit') {
        formContainer.style.display = 'block';
        formTitle.textContent = 'Editar Usuário';
        submitBtn.textContent = 'Salvar Alterações';
        editUser(userId); 
        document.getElementById('email').readOnly = true;
        document.getElementById('senha').required = false;
    } else {
        formContainer.style.display = 'none';
    }
}

function editUser(userId) {
    const user = USERS.find(u => u.id === userId);
    if (user) {
        document.getElementById('user-id').value = user.id;
        document.getElementById('nome').value = user.nome;
        document.getElementById('sobrenome').value = user.sobrenome;
        document.getElementById('dataNascimento').value = user.dataNascimento;
        document.getElementById('tipo').value = user.tipo;
        document.getElementById('email').value = user.email;
        // Senha não é preenchida por segurança, nem torna-se obrigatória
    }
}

function deleteUser(userId) {
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
    e.preventDefault();
    const userId = document.getElementById('user-id').value;
    const nome = document.getElementById('nome').value;
    const sobrenome = document.getElementById('sobrenome').value;
    const dataNascimento = document.getElementById('dataNascimento').value;
    const tipo = document.getElementById('tipo').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    
    if (userId) {
        // EDITAR
        let user = USERS.find(u => u.id === parseInt(userId));
        if (user) {
            user.nome = nome;
            user.sobrenome = sobrenome;
            user.dataNascimento = dataNascimento;
            user.tipo = tipo;
            user.email = email;
            if (senha) { 
                user.senha = senha;
            }
            alert('Usuário editado com sucesso.');
        }
    } else {
        // CRIAR NOVO
        const newUser = {
            id: nextUserId++,
            nome,
            sobrenome,
            dataNascimento,
            tipo,
            email,
            senha
        };
        USERS.push(newUser);
        alert('Usuário criado com sucesso.');
    }

    saveUsers(); 
    toggleUserForm('hide');
    renderUsersTable();
}

document.addEventListener('DOMContentLoaded', initializeGerenciaUsuarioPage);