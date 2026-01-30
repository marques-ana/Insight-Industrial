
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

// Crie esta variável no topo do arquivo para armazenar o que vier do servidor
let LISTA_USUARIOS_SERVER = [];

async function renderUsersTable() {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;
    tbody.innerHTML = ''; 

    try {
        // Substitua pelo seu IP ou 'localhost' para evitar o erro de TIMED_OUT
        const res = await fetch('http://localhost:1880/smartsense/listausuario');
        const users = await res.json();
        
        // Guarda na variável global para as funções de Editar/Excluir
        LISTA_USUARIOS_SERVER = users;

        console.log(users)

        if (Array.isArray(users)) {
            users.forEach(user => {
                const row = tbody.insertRow();
                row.innerHTML = `
                    <td>${user.nome} ${user.sobrenome}</td>
                    <td>${user.tipo}</td>
                    <td>${user.email}</td>
                    <td>
                        <button class="action-btn edit-btn" onclick="toggleUserForm('edit', ${user.id})">Editar</button>
                        <button class="action-btn delete-btn" onclick="deleteUser(${user.id})">Excluir</button>
                    </td>`;
            });
        } else {
            console.warn("O Node-RED enviou um objeto, mas esperávamos uma lista [].");
        }
    } catch (err) {
        console.error("Erro ao conectar com o Node-RED:", err);
    }
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
    // Procura na lista vinda do servidor (LISTA_USUARIOS_SERVER)
    const user = LISTA_USUARIOS_SERVER.find(u => u.id === userId);
    if (user) {
        document.getElementById('user-id').value = user.id;
        document.getElementById('nome').value = user.nome;
        document.getElementById('sobrenome').value = user.sobrenome;
        document.getElementById('dataNascimento').value = user.dataNascimento;
        document.getElementById('tipo').value = user.tipo;
        document.getElementById('email').value = user.email;
    }
}

function deleteUser(userId) {
    if (confirm('Deseja realmente excluir este usuário no servidor?')) {
        fetch(`http://localhost:1880/smartsense/usuario/remover/${userId}`, {
            method: 'DELETE'
        })
        .then(() => {
            alert('Usuário removido com sucesso!');
            renderUsersTable(); // Recarrega a lista do servidor
        })
        .catch(err => console.error("Erro ao deletar:", err));
    }
}

async function handleUserFormSubmit(e) {
    e.preventDefault();
    
    // Coleta os dados do formulário
    const userId = document.getElementById('user-id').value;
    const userData = {
        nome: document.getElementById('nome').value,
        sobrenome: document.getElementById('sobrenome').value,
        dataNascimento: document.getElementById('dataNascimento').value,
        tipo: document.getElementById('tipo').value,
        email: document.getElementById('email').value,
        senha: document.getElementById('senha').value
    };

    try {
        let url = 'http://localhost:1880/smartsense/usuario/criar';
        let method = 'POST';

        // Se existir um ID, muda para a rota de ALTERAR (PUT)
        if (userId) {
            url = `http://localhost:1880/smartsense/usuario/alterar/${userId}`;
            method = 'PUT';
        }

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            alert(userId ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!');
            toggleUserForm('hide'); // Esconde o formulário
            renderUsersTable();     // Recarrega a tabela com os dados novos do servidor
        } else {
            alert('Erro ao salvar usuário no servidor.');
        }
    } catch (error) {
        console.error("Erro na comunicação com o Node-RED:", error);
        alert('Não foi possível conectar ao servidor.');
    }
}

//document.addEventListener('DOMContentLoaded', initializeGerenciaUsuarioPage);
window.onload = ()=>{
    initializeGerenciaUsuarioPage()
}