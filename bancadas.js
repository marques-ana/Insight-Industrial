// =======================================================================
// LÓGICA DE INICIALIZAÇÃO DA PÁGINA DE BANCADAS (Dashboard)
// =======================================================================

function initializeBancadasPage() {
    if (!currentUser) {
        window.location.href = 'index.html'; 
        return;
    }

    document.getElementById('display-user-name').textContent = `${currentUser.nome} ${currentUser.sobrenome}`;
    document.getElementById('display-user-type').textContent = currentUser.tipo;

    const navGerencia = document.getElementById('nav-gerencia');
    if (currentUser.tipo === 'Professor') {
        navGerencia.style.display = 'inline-block';
    } else {
        navGerencia.style.display = 'none';
    }

    // Conecta o formulário de criação de pedido (RF06)
    const formCriaPedido = document.getElementById('form-cria-pedido');
    if (formCriaPedido) {
        formCriaPedido.addEventListener('submit', function(e) {
             e.preventDefault();
             handleCreateOrder();
        });
    }

    // Conecta o formulário de rastreamento (RF04)
    const formRastreio = document.getElementById('form-rastreio');
    if (formRastreio) {
        formRastreio.addEventListener('submit', function(e) {
            e.preventDefault();
            buscarPedido(document.getElementById('pedido-id-busca').value);
        });
    }

    function handleCancelOrder(orderId) {
        const order = orders.find(o => o.id.toUpperCase() === orderId.toUpperCase());

        if (!order) {
            alert(`Erro: Pedido ${orderId} não encontrado.`);
            return;
        }

        if (order.status === STATUS.FINALIZADO || order.status === STATUS.CANCELADO) {
            alert(`Pedido ${orderId} já está ${order.status}. Não pode ser cancelado.`);
            return;
        }
    
        if (confirm(`Tem certeza que deseja cancelar o Pedido ${orderId}? Esta ação é irreversível.`)) {
        
            // 1. Atualiza o status
            order.status = STATUS.CANCELADO;
            order.local = 'Cancelado'; 

            // 2. Libera a posição no Estoque se o pedido ainda estava lá (RN02)
            if (order.local === 'Estoque') {
                const estoqueIndex = estoqueData.findIndex(p => p === order.base);
                if (estoqueIndex !== -1) {
                    estoqueData[estoqueIndex] = null;
                }
            }
        
            // 3. Salva e atualiza
            saveBancadasData();
            atualizarDadosBancada();
            alert(`Pedido ${orderId} cancelado com sucesso.`);
        
            // Oculta o resultado do rastreio ou exibe o novo status
            document.getElementById('rastreio-resultado').style.display = 'none';
        
            // Chama a busca novamente para mostrar o status atualizado
            buscarPedido(orderId);
        }
    }
    
    // Inicia o Polling e renderiza o dashboard
    startPolling(); 
    atualizarDadosBancada(); // Renderiza dados iniciais
}

// =======================================================================
// LÓGICA DE CRIAÇÃO DE PEDIDO (RF06)
// =======================================================================

function handleCreateOrder() {
    const corBase = document.getElementById('cor-base').value;
    const corParedes = [
        document.getElementById('cor-parede-1').value,
        document.getElementById('cor-parede-2').value,
        document.getElementById('cor-parede-3').value,
    ];
    
    const newId = 'P' + (1000 + orders.length + 1);
    
    // RN06: Pedido nasce com status 'Não iniciado' e local 'Estoque'
    const newOrder = { 
        id: newId, 
        base: corBase, 
        paredes: corParedes, 
        status: STATUS.NAO_INICIADO, 
        local: 'Estoque' 
    };

    // Tenta alocar no Estoque (RN02)
    const emptyIndex = estoqueData.findIndex(p => p === null);
    if (emptyIndex !== -1) {
        orders.push(newOrder);
        estoqueData[emptyIndex] = corBase;
        saveBancadasData(); // Salva a alteração
        alert(`Pedido ${newId} criado com sucesso! Status: ${newOrder.status}`);
        
        atualizarDadosBancada(); 
        document.getElementById('form-cria-pedido').reset();
    } else {
        alert('Estoque lotado. Não foi possível criar o pedido.');
    }
}


// =======================================================================
// LÓGICA DE ATUALIZAÇÃO DE DADOS E POLLING (RF07, RNF01)
// =======================================================================

function simulateFetchData() {
    // RNF01: Simula coleta de dados (Polling)
    ambientalData.temperatura = (20 + Math.random() * 10).toFixed(1); 
    ambientalData.umidade = (50 + Math.random() * 20).toFixed(1);
    
    // Simula o avanço de pedidos (muito simplificado)
    orders.forEach(order => {
        if (order.status === STATUS.NAO_INICIADO && Math.random() < 0.2) {
            order.status = STATUS.AGUARDANDO_MODULO;
            order.local = 'Processo';
        } else if (order.status === STATUS.AGUARDANDO_MODULO && Math.random() < 0.2) {
            order.status = STATUS.EM_PROCESSO;
            order.local = 'Processo';
        } else if (order.status === STATUS.EM_PROCESSO && Math.random() < 0.1) {
            
            // ----------------------------------------------------
            // Ação de Finalização do Pedido
            // ----------------------------------------------------
            order.status = STATUS.FINALIZADO;
            order.local = 'Expedição';
            
            // RN02: REMOVE A BASE DO ESTOQUE
            const estoqueIndex = estoqueData.findIndex(p => p === order.base);
            if (estoqueIndex !== -1) {
                estoqueData[estoqueIndex] = null; // Libera o espaço
            }
        }
    });

    // Simula a alocação de pedidos finalizados na Expedição (RN03)
    // Agora só alocamos se o status já for FINALIZADO e ainda não tiver posição.
    const expedicaoOrdersToAllocate = orders.filter(o => 
        o.local === 'Expedição' && 
        o.status === STATUS.FINALIZADO && 
        typeof o.posicaoExpedicao === 'undefined'
    );
    
    expedicaoOrdersToAllocate.forEach(order => {
        const occupiedPositions = orders.filter(o => o.local === 'Expedição' && o.status === STATUS.FINALIZADO).map(o => o.posicaoExpedicao);
        
        for (let i = 1; i <= 12; i++) { // 12 espaços na Expedição (RN03)
            if (!occupiedPositions.includes(i)) {
                order.posicaoExpedicao = i;
                break;
            }
        }
    });
    
    saveBancadasData(); // Persiste a mudança simulada
}

// Inicia o Polling (RF07)
function startPolling() {
    if (pollingInterval) clearInterval(pollingInterval);
    pollingInterval = setInterval(async () => {
        simulateFetchData();
        atualizarDadosBancada();
    }, 2000); // A cada 2 segundos
}

// Atualiza o dashboard completo
async function atualizarDadosBancada() {
    // Filtra pedidos para cada módulo
    // Note que a expedição só mostra pedidos FINALIZADOS (RN03)
    const expedicaoOrders = orders.filter(o => o.local === 'Expedição' && o.status === STATUS.FINALIZADO);
    const processoOrders = orders.filter(o => o.local === 'Processo' || o.local === 'Montagem');
    
    // RF03: Renderiza bancadas e dados
    renderBenches(estoqueData, expedicaoOrders); 
    renderProcessModules(processoOrders.filter(o => o.local === 'Processo').length, processoOrders.filter(o => o.local === 'Montagem').length);
    renderEnvironmentalData(ambientalData); // RN04
    
    // RF04: Renderiza listagem de pedidos ativos
    renderActiveOrders(); 
}

// =======================================================================
// FUNÇÕES DE RENDERIZAÇÃO E RASTREAMENTO (RF03, RF04, RF05)
// =======================================================================

function renderBenches(estoque, expedicao) {
    // RN02: Renderiza Estoque (28 posições)
    const estoqueContainer = document.getElementById('estoque-posicoes');
    estoqueContainer.innerHTML = '';
    estoque.forEach((cor, index) => {
        const statusClass = cor ? cor : 'Vazio';
        const title = cor ? `Base ${cor} (Posição ${index + 1})` : `Posição ${index + 1}: Vazia`;
        // Usa a primeira letra da cor (A, P, V) ou fica vazio
        estoqueContainer.innerHTML += `<div class="posicao-base ${statusClass}" title="${title}">${cor ? cor[0] : ''}</div>`;
    });
    document.getElementById('estoque-count').textContent = estoque.filter(c => c !== null).length;

    // RN03: Renderiza Expedição (12 posições) - CORRIGIDO PARA MOSTRAR COR E ID
    const expedicaoContainer = document.getElementById('expedicao-posicoes');
    expedicaoContainer.innerHTML = '';
    
    // Mapeia os pedidos prontos por posição
    const expedicaoMap = new Array(12).fill(null);
    expedicao.forEach(order => {
        if (order.posicaoExpedicao) {
             expedicaoMap[order.posicaoExpedicao - 1] = order; // Armazena o OBJETO do pedido
        }
    });

    expedicaoMap.forEach((order, index) => {
        if (order) {
            const baseClass = order.base; // Ex: 'Azul', 'Preto', 'Vermelho'
            const title = `Pedido ${order.id} | Base ${order.base} (Posição ${index + 1})`;
            const idNumber = order.id.slice(1); // Exibe P1001 como 1001

            // Usa as classes 'Pronto' e a cor da base para o CSS
            expedicaoContainer.innerHTML += `<div class="posicao-base Pronto ${baseClass}" title="${title}">${idNumber}</div>`;
        } else {
            // Posição Vazia
            const title = `Posição ${index + 1}: Vazia`;
            expedicaoContainer.innerHTML += `<div class="posicao-base Vazio" title="${title}"></div>`;
        }
    });
    document.getElementById('expedicao-count').textContent = expedicao.length;
}

function renderProcessModules(procCount, montCount) {
    // RN01: Módulos Processo e Montagem
    document.getElementById('processo-status').textContent = procCount > 0 ? 'Em Andamento' : 'Ocioso';
    document.getElementById('processo-modulos').textContent = procCount;

    document.getElementById('montagem-status').textContent = montCount > 0 ? 'Em Andamento' : 'Ocioso';
    document.getElementById('montagem-modulos').textContent = montCount;
}

function renderEnvironmentalData(data) {
    // RN04: Dados Ambientais
    document.getElementById('ambiental-temp').textContent = data.temperatura;
    document.getElementById('ambiental-umid').textContent = data.umidade;
}

// Rastreamento (RF04, RF05)
function buscarPedido(pedidoId) {
    const order = orders.find(o => o.id.toUpperCase() === pedidoId.toUpperCase());
    const resultadoDiv = document.getElementById('rastreio-resultado');
    
    resultadoDiv.style.display = 'block';

    if (order) {
        // Encontra a chave do STATUS para gerar a classe CSS correta
        const statusKey = Object.keys(STATUS).find(key => STATUS[key] === order.status);
        const statusClass = statusKey ? `status-${statusKey.toLowerCase().replace(/_/g, '-')}` : '';
        
        resultadoDiv.innerHTML = `
            <h4>Pedido: ${order.id}</h4>
            <p>Local Atual: <strong>${order.local}</strong></p>
            <p>Status: <strong class="${statusClass}">${order.status}</strong></p>
            <p>Base: ${order.base} | Paredes: ${order.paredes.join(', ')}</p>
        `;
    } else {
        resultadoDiv.innerHTML = `<h4>Pedido ${pedidoId} não encontrado.</h4>`;
    }
}

// Listagem de Pedidos Ativos (RF04)
function renderActiveOrders() {
    const listaUl = document.getElementById('lista-pedidos-ul');
    listaUl.innerHTML = '';
    
    const activeOrders = orders.filter(o => o.status !== STATUS.FINALIZADO && o.status !== STATUS.CANCELADO);

    if (activeOrders.length === 0) {
        listaUl.innerHTML = '<li>Nenhum pedido em produção ou aguardando início.</li>';
        return;
    }

    activeOrders.forEach(order => {
        const statusKey = Object.keys(STATUS).find(key => STATUS[key] === order.status);
        const statusClass = statusKey ? `status-${statusKey.toLowerCase().replace(/_/g, '-')}` : '';
        
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            [${order.id}] Local: ${order.local} | Status: <strong class="${statusClass}">${order.status}</strong> 
            (<a href="#" onclick="buscarPedido('${order.id}'); return false;">Rastrear</a>)
        `;
        listaUl.appendChild(listItem);
    });
}

document.addEventListener('DOMContentLoaded', initializeBancadasPage);