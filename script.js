// =======================================================================
// DADOS SIMULADOS (Substituiriam o seu Backend/Fonte de Dados Industrial)
// =======================================================================

// RN05: Tipos de usuário
const USERS = [
    { id: 1, email: 'professor@insight.com', senha: 'senha123', nome: 'Sávio Zoboli (Professor)', tipo: 'Professor' },
    { id: 2, email: 'aluno@insight.com', senha: 'senha123', nome: 'Aluno Exemplo', tipo: 'Aluno' },
];

// RN06: Cinco status de pedido
const STATUS = {
    NAO_INICIADO: 'Não iniciado',
    AGUARDANDO_MODULO: 'Aguardando módulo',
    EM_PROCESSO: 'Em processo',
    FINALIZADO: 'Finalizado',
    CANCELADO: 'Cancelado',
};

// Estrutura principal dos pedidos
let orders = [
    // Pedido simulado 1: Em Processo
    { id: 'P1001', base: 'Preto', paredes: ['#ff0000', '#00ff00', '#0000ff'], status: STATUS.EM_PROCESSO, local: 'Processo' },
    // Pedido simulado 2: Finalizado (em Expedição)
    { id: 'P1002', base: 'Azul', paredes: ['#ffffff', '#ffffff', '#ffffff'], status: STATUS.FINALIZADO, local: 'Expedição', posicaoExpedicao: 5 },
    // Pedido simulado 3: Não Iniciado
    { id: 'P1003', base: 'Vermelho', paredes: ['#000000', '#000000', '#000000'], status: STATUS.NAO_INICIADO, local: 'Estoque' },
];

// RN02: Bancada Estoque (28 bases, 3 cores)
// O array representa as 28 posições do estoque (null = vazio)
let estoqueData = [
    'Azul', 'Preto', 'Vermelho', 'Azul', 'Preto', 'Vermelho', 'Azul', 'Preto', 'Vermelho', 'Azul', 
    'Preto', 'Vermelho', 'Azul', 'Preto', 'Vermelho', 'Azul', 'Preto', 'Vermelho', 'Azul', 'Preto',
    'Vermelho', 'Azul', null, null, null, null, null, null // 6 posições vazias
];

// RN04: Dados Ambientais (Temperatura e Umidade)
let ambientalData = {
    temperatura: 25.5,
    umidade: 60.2
};

// =======================================================================
// LÓGICA DE USUÁRIO E LOGIN (RF01, RF02, RN05)
// =======================================================================

let currentUser = null;

document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-senha').value;
    handleLogin(email, senha);
});

function handleLogin(email, senha) {
    const user = USERS.find(u => u.email === email && u.senha === senha);
    const loginErro = document.getElementById('login-erro');

    if (user) {
        currentUser = user;
        document.getElementById('display-user-name').textContent = currentUser.nome;
        document.getElementById('display-user-type').textContent = currentUser.tipo;

        document.getElementById('login-container').style.display = 'none';
        document.getElementById('main-container').style.display = 'block';

        // RF01 / RN05: Professor tem acesso à Gerência de Usuários
        if (currentUser.tipo === 'Professor') {
            document.getElementById('gerencia-usuario').style.display = 'block';
        }

        // Inicia o Polling após o login
        startPolling();
        renderActiveOrders(); // Renderiza a lista inicial
    } else {
        loginErro.textContent = 'Email ou senha incorretos.';
    }
}

function handleLogout() {
    currentUser = null;
    document.getElementById('gerencia-usuario').style.display = 'none';
    document.getElementById('main-container').style.display = 'none';
    document.getElementById('login-container').style.display = 'flex';
    document.getElementById('login-erro').textContent = '';
    clearInterval(pollingInterval);
}

// =======================================================================
// LÓGICA DE CRIAÇÃO DE PEDIDO (RF06)
// =======================================================================

document.getElementById('form-cria-pedido').addEventListener('submit', function(e) {
    e.preventDefault();
    handleCreateOrder();
});

function handleCreateOrder() {
    const corBase = document.getElementById('cor-base').value;
    const corParedes = [
        document.getElementById('cor-parede-1').value,
        document.getElementById('cor-parede-2').value,
        document.getElementById('cor-parede-3').value,
    ];

    // Simula a criação de um novo ID
    const newId = 'P' + (1000 + orders.length + 1);

    const newOrder = {
        id: newId,
        base: corBase,
        paredes: corParedes,
        status: STATUS.NAO_INICIADO, // RN06: Começa como Não iniciado
        local: 'Estoque'
    };

    orders.push(newOrder);
    
    // Simula a adição da base ao estoque (se houver espaço)
    const emptyIndex = estoqueData.findIndex(p => p === null);
    if (emptyIndex !== -1) {
        estoqueData[emptyIndex] = corBase;
    }

    alert(`Pedido ${newId} criado com sucesso! Status: ${newOrder.status}`);
    
    // Atualiza a visualização
    renderBenches(estoqueData, null);
    renderActiveOrders();
}

// =======================================================================
// LÓGICA DE ATUALIZAÇÃO DE DADOS E POLLING (RNF01, RF07, RF03, RN04)
// =======================================================================

let pollingInterval;

// RNF01: Simula a chamada HTTP para buscar dados da bancada
function simulateFetchData() {
    return new Promise(resolve => {
        // Simulação de delay de rede
        setTimeout(() => {
            // Lógica para simular movimento e atualização de dados
            
            // Simula a atualização dos dados ambientais (RN04)
            ambientalData.temperatura = (20 + Math.random() * 8).toFixed(1);
            ambientalData.umidade = (50 + Math.random() * 20).toFixed(1);

            // Simula o avanço de um pedido (ex: P1001)
            const orderToAdvance = orders.find(o => o.id === 'P1001');
            if (orderToAdvance) {
                switch (orderToAdvance.status) {
                    case STATUS.NAO_INICIADO:
                        orderToAdvance.status = STATUS.AGUARDANDO_MODULO;
                        break;
                    case STATUS.AGUARDANDO_MODULO:
                        orderToAdvance.status = STATUS.EM_PROCESSO;
                        orderToAdvance.local = 'Processo';
                        break;
                    case STATUS.EM_PROCESSO:
                        // Simula o avanço para Montagem
                        orderToAdvance.status = STATUS.EM_PROCESSO;
                        orderToAdvance.local = Math.random() < 0.5 ? 'Processo' : 'Montagem';
                        break;
                    case 'Montagem':
                        // Simula a finalização
                         if (Math.random() < 0.2) {
                            orderToAdvance.status = STATUS.FINALIZADO;
                            orderToAdvance.local = 'Expedição';
                         }
                        break;
                }
            }
            
            // Simula as informações em tempo real de cada módulo (RN01)
            const processoInfo = `Status: ${orders.find(o => o.local === 'Processo')?.id || 'Vazio'}`;
            const montagemInfo = `Status: ${orders.find(o => o.local === 'Montagem')?.id || 'Vazio'}`;
            
            resolve({
                estoque: estoqueData,
                processo: processoInfo,
                montagem: montagemInfo,
                expedicao: orders.filter(o => o.local === 'Expedição'), // Pedidos finalizados
                ambiental: ambientalData,
                orders: orders
            });
        }, 100); // Pequeno delay para simular rede
    });
}

// RF07: Inicia a atualização de dados a cada 2 segundos
function startPolling() {
    // Executa imediatamente e depois a cada 2 segundos
    atualizarDadosBancada(); 
    pollingInterval = setInterval(atualizarDadosBancada, 2000); 
}

async function atualizarDadosBancada() {
    try {
        // RNF01: Uso do fetch (simulado) para comunicação HTTP
        const data = await simulateFetchData(); 
        
        // RF03: Listagem de bancadas e variáveis de ambiente
        renderBenches(data.estoque, data.expedicao);
        renderEnvironmentalData(data.ambiental);
        renderProcessModules(data.processo, data.montagem);
        renderActiveOrders();

    } catch (error) {
        console.error("Erro ao buscar dados da bancada:", error);
        // Exibir erro na tela (opcional)
    }
}

// =======================================================================
// FUNÇÕES DE RENDERIZAÇÃO (RF03, RN02, RN03, RN04)
// =======================================================================

function renderBenches(estoque, expedicao) {
    // RN02: Bancada Estoque (28 Bases)
    const estoqueContainer = document.getElementById('estoque-posicoes-container');
    estoqueContainer.innerHTML = '';
    for (let i = 0; i < 28; i++) {
        const cor = estoque[i] || 'Vazio';
        const el = document.createElement('div');
        el.className = `posicao-base ${cor}`;
        el.title = `Posição ${i + 1}: ${cor === 'Vazio' ? 'Vazio' : `Base ${cor}`}`;
        el.textContent = i + 1;
        estoqueContainer.appendChild(el);
    }
    
    // RN03: Bancada Expedição (12 Espaços)
    const expedicaoContainer = document.getElementById('expedicao-posicoes-container');
    expedicaoContainer.innerHTML = '';
    for (let i = 0; i < 12; i++) {
        const pedidoNaPosicao = expedicao.find(p => p.posicaoExpedicao === i + 1);
        const cor = pedidoNaPosicao ? 'Preto' : 'Vazio'; // Exemplo: caixa pronta é preta
        const el = document.createElement('div');
        el.className = `posicao-base ${cor}`;
        el.title = pedidoNaPosicao ? `Posição ${i + 1}: Pedido ${pedidoNaPosicao.id}` : `Posição ${i + 1}: Livre`;
        el.textContent = pedidoNaPosicao ? pedidoNaPosicao.id.replace('P', '') : 'Livre';
        expedicaoContainer.appendChild(el);
    }
}

function renderProcessModules(procInfo, montInfo) {
    document.getElementById('proc-status-display').textContent = procInfo;
    document.getElementById('mont-status-display').textContent = montInfo;
}

function renderEnvironmentalData(data) {
    // RN04: Equipamento para coleta de dados de ambiente
    document.getElementById('temp-display').textContent = data.temperatura;
    document.getElementById('umidade-display').textContent = data.umidade;
}

// =======================================================================
// LÓGICA DE RASTREAMENTO DE PEDIDOS (RF04, RF05)
// =======================================================================

function buscarPedido() {
    const inputId = document.getElementById('input-pedido').value.trim().toUpperCase();
    const resultadoDiv = document.getElementById('resultado-rastreamento');
    const pedido = orders.find(o => o.id === inputId);
    
    resultadoDiv.innerHTML = '';

    if (pedido) {
        // RF05: Mostrar o local e o status do pedido
        resultadoDiv.innerHTML = `
            <p><strong>Pedido:</strong> ${pedido.id}</p>
            <p><strong>Status:</strong> <span class="status-${pedido.status.toLowerCase().replace(/ /g, '-')}">${pedido.status}</span></p>
            <p><strong>Local na Bancada:</strong> ${pedido.local}</p>
            <p><strong>Detalhes:</strong> Base ${pedido.base}, Paredes: 
                <span style="color: ${pedido.paredes[0]};">P1</span>, 
                <span style="color: ${pedido.paredes[1]};">P2</span>, 
                <span style="color: ${pedido.paredes[2]};">P3</span>
            </p>
        `;
    } else {
        resultadoDiv.innerHTML = `<p>Pedido <strong>${inputId}</strong> não encontrado.</p>`;
    }
}

function renderActiveOrders() {
    // RF04: Listagem de pedidos em produção/acompanhamento
    const ul = document.getElementById('lista-pedidos-ul');
    ul.innerHTML = '';

    const activeOrders = orders.filter(o => 
        o.status !== STATUS.FINALIZADO && o.status !== STATUS.CANCELADO
    ).slice(0, 10); // Limita a 10 para exemplo

    if (activeOrders.length === 0) {
        ul.innerHTML = '<li>Nenhum pedido ativo no momento.</li>';
        return;
    }

    activeOrders.forEach(pedido => {
        const li = document.createElement('li');
        li.innerHTML = `
            <strong>${pedido.id}</strong> (Base: ${pedido.base}) 
            - Local: ${pedido.local} 
            - Status: <span class="status-${pedido.status.toLowerCase().replace(/ /g, '-')}">${pedido.status}</span>
            <button onclick="document.getElementById('input-pedido').value='${pedido.id}'; buscarPedido();">Ver Detalhes</button>
        `;
        ul.appendChild(li);
    });
}

// Garante que o usuário tem que logar ao carregar a página
window.onload = function() {
    if (!currentUser) {
        document.getElementById('main-container').style.display = 'none';
        document.getElementById('login-container').style.display = 'flex';
    }
}