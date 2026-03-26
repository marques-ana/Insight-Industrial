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
        const res = await fetch('http://localhost:1880/autenticacao/autenticar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, senha: senha })
        });
        
        if (res.ok) {
            const data = await res.json(); 
            
            // Verificamos se recebemos dados válidos
            if (data) {
                // Se o Node-RED enviar uma lista, pegamos o primeiro. Se enviar objeto, usamos direto.
                const user = Array.isArray(data) ? data : data; 
                
                if (!user) {
                    loginErro.textContent = 'Usuário não encontrado.';
                    return;
                }

                // Criamos o objeto padronizado
                const userParaSalvar = {
                    id: user.id || user.id_usuarios,
                    nome: user.nome,
                    tipo: user.tipo || user.tipo_usuario, 
                    email: email
                };

                // PERSISTÊNCIA: Aqui é onde resolvemos o seu problema atual
                localStorage.setItem('currentUser', JSON.stringify(userParaSalvar));
                localStorage.setItem('usuarioTipo', userParaSalvar.tipo); // Necessário para Gerência
                localStorage.setItem('usuarioId', userParaSalvar.id);     // Necessário para Pedidos
                localStorage.setItem('usuarioNome', userParaSalvar.nome);

                window.location.href = 'bancadas.html'; 
            } else {
                loginErro.textContent = 'Usuário não encontrado.';
            }
        } else {
            loginErro.textContent = 'E-mail ou senha incorretos.';
        }
    } catch (err) {
        console.error("Falha na conexão:", err);
        alert("Não foi possível conectar ao servidor.");
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

function saveBancadasData() {
    localStorage.setItem('orders', JSON.stringify(orders));
    localStorage.setItem('estoqueData', JSON.stringify(estoqueData));
    localStorage.setItem('ambientalData', JSON.stringify(ambientalData));
}
