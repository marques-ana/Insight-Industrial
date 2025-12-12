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

// Estruturas Padrão (Usadas para Reset)
const defaultOrders = [
    // P1001 e P1002 já saíram do Estoque na simulação inicial
    { id: 'P1001', base: 'Preto', paredes: ['Preto', 'Azul', 'Vermelho'], status: STATUS.FINALIZADO, local: 'Expedição', posicaoExpedicao: 1 },
    { id: 'P1002', base: 'Azul', paredes: ['Azul', 'Azul', 'Azul'], status: STATUS.FINALIZADO, local: 'Expedição', posicaoExpedicao: 2 },
    { id: 'P1003', base: 'Vermelho', paredes: ['Vermelho', 'Preto', 'Vermelho'], status: STATUS.FINALIZADO, local: 'Expedição', posicaoExpedicao: 3 },
];

// CORREÇÃO: 28 bases preenchidas no início. 
const fullEstoque = [
    'Preto', 'Azul', 'Vermelho', 'Preto', 'Azul', 'Vermelho', 'Preto', 'Azul', 'Vermelho', 'Preto',
    'Azul', 'Vermelho', 'Preto', 'Azul', 'Vermelho', 'Preto', 'Azul', 'Vermelho', 'Preto', 'Azul',
    'Vermelho', 'Preto', 'Azul', 'Vermelho', 'Preto', 'Azul', 'Preto', 'Azul'
]; 
// Total de 28 posições preenchidas.

// Simula o consumo inicial das 3 bases: P1001 (Preto), P1002 (Azul), P1003 (Vermelho)
const defaultEstoque = [...fullEstoque]; 
const consumedBases = ['Preto', 'Azul', 'Vermelho']; 
consumedBases.forEach(base => {
    const index = defaultEstoque.indexOf(base);
    if (index !== -1) {
        defaultEstoque[index] = null; // Marca as bases iniciais como consumidas
    }
});
// O defaultEstoque agora terá 25 bases preenchidas e 3 posições nulas.

const defaultAmbiental = { temperatura: 25.5, umidade: 60.2 };

// Inicialização das variáveis globais (com persistência e deep copy para garantir o reset)
let orders = JSON.parse(localStorage.getItem('orders')) || JSON.parse(JSON.stringify(defaultOrders));
let estoqueData = JSON.parse(localStorage.getItem('estoqueData')) || JSON.parse(JSON.stringify(defaultEstoque));
let ambientalData = JSON.parse(localStorage.getItem('ambientalData')) || JSON.parse(JSON.stringify(defaultAmbiental));

// Variáveis de estado e controle
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let pollingInterval;


// =======================================================================
// LÓGICA DE AUTENTICAÇÃO E NAVEGAÇÃO (MANTIDA)
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
// LÓGICA DE GERENCIAMENTO E RESET DE DADOS (MANTIDA)
// =======================================================================

/**
 * Reseta os dados de pedidos, estoque e ambiente para os valores padrão,
 * limpando o estado atual do localStorage.
 */
function resetBancadasData() {
    if (!currentUser || currentUser.tipo !== 'Professor') {
        alert('Acesso negado. Apenas professores podem resetar os dados.');
        return;
    }

    if (confirm('ATENÇÃO: Você tem certeza que deseja RESETAR TODOS OS DADOS DE PEDIDOS (Pedidos, Estoque e Ambientais)? Esta ação não pode ser desfeita.')) {
        // Reinicializa as variáveis globais com seus valores default
        orders = JSON.parse(JSON.stringify(defaultOrders)); 
        estoqueData = JSON.parse(JSON.stringify(defaultEstoque)); // Carrega 25/28
        ambientalData = JSON.parse(JSON.stringify(defaultAmbiental));
        
        // Salva os defaults no localStorage
        saveBancadasData(); 

        alert('Dados da bancada resetados com sucesso! A página será recarregada.');
        window.location.reload();
    }
}


// =======================================================================
// INICIALIZAÇÃO DA PÁGINA DE LOGIN (index.html) (MANTIDA)
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