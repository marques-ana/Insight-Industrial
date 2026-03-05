// =======================================================================
// CONFIGURAÇÕES E ESTADOS INICIAIS
// =======================================================================

// RN06: Status de pedido para a plataforma
const STATUS = {
    NAO_INICIADO: 'Não iniciado',
    AGUARDANDO_MODULO: 'Aguardando módulo',
    EM_PROCESSO: 'Em processo',
    FINALIZADO: 'Finalizado',
    CANCELADO: 'Cancelado',
};

// Dados Padrão de Simulação (Bancada)
const defaultOrders = [
    { id: 'P1001', base: 'Preto', paredes: ['Preto', 'Azul', 'Vermelho'], status: STATUS.FINALIZADO, local: 'Expedição', posicaoExpedicao: 1 },
    { id: 'P1002', base: 'Azul', paredes: ['Azul', 'Azul', 'Azul'], status: STATUS.FINALIZADO, local: 'Expedição', posicaoExpedicao: 2 },
    { id: 'P1003', base: 'Vermelho', paredes: ['Vermelho', 'Preto', 'Vermelho'], status: STATUS.FINALIZADO, local: 'Expedição', posicaoExpedicao: 3 },
];

const fullEstoque = [
    'Preto', 'Azul', 'Vermelho', 'Preto', 'Azul', 'Vermelho', 'Preto', 'Azul', 'Vermelho', 'Preto',
    'Azul', 'Vermelho', 'Preto', 'Azul', 'Vermelho', 'Preto', 'Azul', 'Vermelho', 'Preto', 'Azul',
    'Vermelho', 'Preto', 'Azul', 'Vermelho', 'Preto', 'Azul', 'Preto', 'Azul'
];

const defaultAmbiental = { temperatura: 25.5, umidade: 60.2 };

// Inicialização com Persistência Local (apenas para dados da bancada)
let orders = JSON.parse(localStorage.getItem('orders')) || [...defaultOrders];
let estoqueData = JSON.parse(localStorage.getItem('estoqueData')) || [...fullEstoque];
let ambientalData = JSON.parse(localStorage.getItem('ambientalData')) || {...defaultAmbiental};

// Estado do Usuário Logado
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// =======================================================================
// LÓGICA DE AUTENTICAÇÃO (CONECTADA AO NODE-RED)
// =======================================================================

async function handleLogin(email, senha) {
    const loginErro = document.getElementById('login-erro');
    
    try {
        // Busca a lista de usuários REAL do seu Node-RED
        const res = await fetch('http://10.77.241.122:1880/smartsense/listausuario');
        
        if (!res.ok) throw new Error("Erro ao acessar o servidor");
        
        const listaUsuarios = await res.json();

        // 1. Procura o usuário pelo e-mail
        const user = listaUsuarios.find(u => u.email === email);

        if (user) {
            // 2. Verifica se a senha confere
            if (user.senha === senha) {
                // Sucesso: Salva apenas o usuário logado no navegador
                localStorage.setItem('currentUser', JSON.stringify(user)); 
                window.location.href = 'bancadas.html'; 
            } else {
                loginErro.textContent = 'Senha incorreta para este usuário.';
                console.warn("Senha digitada não confere com o Node-RED.");
            }
        } else {
            loginErro.textContent = 'E-mail não encontrado no sistema.';
            console.error("Usuário não existe na memória global do Node-RED.");
        }
    } catch (err) {
        console.error("Falha na conexão (Failed to fetch):", err);
        alert("Não foi possível conectar ao Node-RED. Verifique se o servidor está rodando.");
    }
}

function handleLogout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html'; 
}

// =======================================================================
// INICIALIZAÇÃO DA PÁGINA
// =======================================================================

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        // Se já estiver logado, pula a tela de login
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