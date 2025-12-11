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

// RN06: Cinco status de pedido
const STATUS = {
    NAO_INICIADO: 'Não iniciado',
    AGUARDANDO_MODULO: 'Aguardando módulo',
    EM_PROCESSO: 'Em processo',
    FINALIZADO: 'Finalizado',
    CANCELADO: 'Cancelado',
};

// Estrutura principal dos pedidos (Persistido)
let orders = JSON.parse(localStorage.getItem('orders')) || [
    { id: 'P1001', base: 'Preto', paredes: ['Preto', 'Azul', 'Vermelho'], status: STATUS.EM_PROCESSO, local: 'Processo' },
    { id: 'P1002', base: 'Azul', paredes: ['Azul', 'Azul', 'Azul'], status: STATUS.FINALIZADO, local: 'Expedição', posicaoExpedicao: 5 },
    { id: 'P1003', base: 'Vermelho', paredes: ['Vermelho', 'Preto', 'Vermelho'], status: STATUS.NAO_INICIADO, local: 'Estoque' },
];

// RN02: 28 bases (Bases de exemplo e posições nulas)
const defaultEstoque = [
    'Preto', null, 'Azul', null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null // Total de 28 posições
];
let estoqueData = JSON.parse(localStorage.getItem('estoqueData')) || defaultEstoque;

// RN04: Dados Ambientais (Persistido)
let ambientalData = JSON.parse(localStorage.getItem('ambientalData')) || { temperatura: 25.5, umidade: 60.2 };

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

// Funções utilitárias de persistência
function saveUsers() { 
    localStorage.setItem('USERS', JSON.stringify(USERS)); 
}
function saveBancadasData() { 
    localStorage.setItem('orders', JSON.stringify(orders));
    localStorage.setItem('estoqueData', JSON.stringify(estoqueData));
    localStorage.setItem('ambientalData', JSON.stringify(ambientalData));
}

// =======================================================================
// INICIALIZAÇÃO DA PÁGINA DE LOGIN (index.html)
// =======================================================================
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
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