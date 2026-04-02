function initializeGerenciaUsuarioPage() {
    
    if (!currentUser || (currentUser.tipo !== 'Professor' && currentUser.tipo_usuario !== 'Professor')) {
        alert('Acesso negado. Apenas professores podem acessar esta página.');
        window.location.href = 'bancadas.html'; 
        return;
    }

    document.getElementById('display-user-name').textContent = `${currentUser.nome} ${currentUser.sobrenome}`;
    document.getElementById('display-user-type').textContent = currentUser.tipo;

    
    document.getElementById('form-user-crud').addEventListener('submit', handleUserFormSubmit);
    
    
    renderUsersTable();
}


let LISTA_USUARIOS_SERVER = [];

async function renderUsersTable() {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;
    tbody.innerHTML = ''; 

    try {
        
        const res = await fetch('http://localhost:1880/smartsense/listausuario');
        const users = await res.json();
        
        
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
            renderUsersTable(); 
        })
        .catch(err => console.error("Erro ao deletar:", err));
    }
}

async function handleUserFormSubmit(e) {
    e.preventDefault();
    
    
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
            toggleUserForm('hide'); 
            renderUsersTable();     
        } else {
            alert('Erro ao salvar usuário no servidor.');
        }
    } catch (error) {
        console.error("Erro na comunicação com o Node-RED:", error);
        alert('Não foi possível conectar ao servidor.');
    }
}

document.addEventListener('DOMContentLoaded', initializeGerenciaUsuarioPage);
