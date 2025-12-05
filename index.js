
// =======================================================================
// DADOS SIMULADOS E PERSISTÊNCIA
// =======================================================================

function login(e){
    e.preventDefault(); 
    console.log("redirecionando..."); 
    window.location.href = "bancadas.html";
}
    
const defaultUsers = [
    { 
        id: 1, 
        email: 'professor@insight.com', 
        senha: 'senha123', 
        nome: 'Sávio', 
        sobrenome: 'Zoboli', 
        dataNascimento: '1980-01-01', 
        tipo: 'Professor' 
    },
    { 
        id: 2, 
        email: 'aluno@insight.com', 
        senha: 'senha123', 
        nome: 'Aluno', 
        sobrenome: 'Exemplo', 
        dataNascimento: '2000-05-15', 
        tipo: 'Aluno' 
    },
];

let USERS = JSON.parse(localStorage.getItem('USERS')) || defaultUsers;
let nextUserId = USERS.length + 1;

const STATUS = {
    NAO_INICIADO: 'Não iniciado',
    AGUARDANDO_MODULO: 'Aguardando módulo',
    EM_PROCESSO: 'Em processo',
    FINALIZADO: 'Finalizado',
    CANCELADO: 'Cancelado',
};

// Dados simulados de pedidos, estoque e ambiente (mantenha a estrutura original)
let orders = [
    { id: 'P1001', base: 'Preto', paredes: ['#ff0000', '#00ff00', '#0000ff'], status: STATUS.EM_PROCESSO, local: 'Processo' },
    { id: 'P1002', base: 'Azul', paredes: ['#ffffff', '#ffffff', '#ffffff'], status: STATUS.FINALIZADO, local: 'Expedição', posicaoExpedicao: 5 },
    { id: 'P1003', base: 'Vermelho', paredes: ['#000000', '#000000', '#000000'], status: STATUS.NAO_INICIADO, local: 'Estoque' },
];

let estoqueData = [ /* ... 28 posições simuladas ... */ ]; // Copie seus dados aqui
let ambientalData = { temperatura: 25.5, umidade: 60.2 }; // Copie seus dados aqui

// Variáveis de estado e controle
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let pollingInterval;


// =======================================================================
// LÓGICA DE AUTENTICAÇÃO E NAVEGAÇÃO
// =======================================================================

function handleLogin(email, senha) {
    const user = USERS.find(u => u.email === email && u.senha === senha);
    const loginErro = document.getElementById('login-erro');

    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user)); 
        localStorage.setItem('USERS', JSON.stringify(USERS));
        // Redireciona para o dashboard principal
        window.location.href = 'bancadas.html'; 
    } else {
        loginErro.textContent = 'Email ou senha incorretos.';
    }
}

function handleLogout() {
    localStorage.removeItem('currentUser');
    if (typeof pollingInterval !== 'undefined') {
        clearInterval(pollingInterval);
    }
    window.location.href = 'index.html'; 
}

// Função utilitária chamada após qualquer alteração no USERS (usada em gerencia.js)
function saveUsers() {
    localStorage.setItem('USERS', JSON.stringify(USERS));
}

// =======================================================================
// INICIALIZAÇÃO DA PÁGINA DE LOGIN (index.html)
// =======================================================================
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    
    // Se estiver na página de login
    if (loginForm) {
        // Redireciona se já estiver logado
        if (currentUser) {
            window.location.href = 'bancadas.html';
            return;
        }
        
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const senha = document.getElementById('login-senha').value;
            handleLogin(email, senha);
        });
    }
});