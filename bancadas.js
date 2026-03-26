// =======================================================================
// CONFIGURAÇÕES E ESTADOS GLOBAIS
// =======================================================================
let pollingInterval; // Declarada apenas UMA VEZ para evitar erro de "already declared"

// =======================================================================
// LÓGICA DE INICIALIZAÇÃO DA PÁGINA (Dashboard)
// =======================================================================

function initializeBancadasPage() {
    // 1. Verifica se existe um usuário logado (dados vêm do index.js)
    if (!currentUser) {
        window.location.href = 'index.html'; 
        return;
    }

    console.log("Iniciando monitoramento das bancadas...");
    
    // 2. Exibe os dados do usuário logado no topo da página
    const userNameElement = document.getElementById('display-user-name');
    const userTypeElement = document.getElementById('display-user-type');
    
    if (userNameElement) userNameElement.textContent = currentUser.nome;
    if (userTypeElement) userTypeElement.textContent = currentUser.tipo;

    // 3. Lógica de Controle de Acesso (Visão do Professor)
    const navGerencia = document.getElementById('nav-gerencia');
    const navReset = document.getElementById('nav-reset-data'); 
    
    if (currentUser.tipo === 'Professor') {
        if (navGerencia) navGerencia.style.display = 'inline-block';
        if (navReset) navReset.style.display = 'inline-block'; 
    } else {
        if (navGerencia) navGerencia.style.display = 'none';
        if (navReset) navReset.style.display = 'none'; 
    }

    // 4. Configuração dos Eventos de Formulário (Criação e Rastreio)
    const formCriaPedido = document.getElementById('form-cria-pedido');
    if (formCriaPedido) {
        formCriaPedido.addEventListener('submit', function(e) {
             e.preventDefault();
             handleCreateOrder();
        });
    }

    const formRastreio = document.getElementById('form-rastreio');
    if (formRastreio) {
        formRastreio.addEventListener('submit', function(e) {
            e.preventDefault();
            const idBusca = document.getElementById('pedido-id-busca').value;
            buscarPedido(idBusca);
        });
    }
    
    // 5. Inicia a busca de dados inicial e o loop de atualização
    buscandoDadosBancada(); 
    polling(5); // Atualiza a cada 5 segundos
    atualizarDadosBancada(); 
}

// =======================================================================
// LÓGICA DE PEDIDOS (Criação e Cancelamento)
// =======================================================================

function handleCreateOrder() {
    const corBase = document.getElementById('cor-base').value;
    const corParedes = [
        document.getElementById('cor-parede-1').value,
        document.getElementById('cor-parede-2').value,
        document.getElementById('cor-parede-3').value,
    ];
    
    const newId = 'P' + (1000 + orders.length + 1); 
    
    const newOrder = { 
        id: newId, 
        base: corBase, 
        paredes: corParedes, 
        status: STATUS.NAO_INICIADO, 
        local: 'Estoque',
        usuario_id: localStorage.getItem('usuarioId') 
    };

    orders.push(newOrder);
    saveBancadasData(); 
    alert(`Pedido ${newId} criado com sucesso!`);
    
    atualizarDadosBancada(); 
    document.getElementById('form-cria-pedido').reset();
}

function handleCancelOrder(orderId) {
    const order = orders.find(o => o.id.toUpperCase() === orderId.toUpperCase());

    if (!order) {
        alert(`Erro: Pedido ${orderId} não encontrado.`);
        return;
    }

    if (order.status === STATUS.FINALIZADO || order.status === STATUS.CANCELADO) {
        alert(`Pedido ${orderId} já está ${order.status}.`);
        return;
    }
    
    if (confirm(`Tem certeza que deseja cancelar o Pedido ${orderId}?`)) {
        order.status = STATUS.CANCELADO;
        order.local = 'Cancelado'; 

        const estoqueIndex = estoqueData.indexOf(order.base); 
        if (order.status === STATUS.NAO_INICIADO && estoqueIndex !== -1) {
            estoqueData[estoqueIndex] = null;
        }
        
        saveBancadasData();
        atualizarDadosBancada();
        alert(`Pedido ${orderId} cancelado.`);
        buscarPedido(orderId);
    }
}

// =======================================================================
// LÓGICA DE SIMULAÇÃO E MOVIMENTAÇÃO (RN02, RN03)
// =======================================================================

function updateOrderProgression() {
    orders.forEach(order => {
        if (order.status === STATUS.FINALIZADO || order.status === STATUS.CANCELADO) return;

        if (order.status === STATUS.NAO_INICIADO && Math.random() < 0.2) {
            const estoqueIndex = estoqueData.indexOf(order.base);
            if (estoqueIndex !== -1) { 
                order.status = STATUS.AGUARDANDO_MODULO;
                order.local = 'Processo';
                estoqueData[estoqueIndex] = null; 
            }
        } else if (order.status === STATUS.AGUARDANDO_MODULO && Math.random() < 0.2) {
            order.status = STATUS.EM_PROCESSO;
        } else if (order.status === STATUS.EM_PROCESSO && order.local === 'Processo' && Math.random() < 0.2) {
            order.local = 'Montagem'; 
        } else if (order.status === STATUS.EM_PROCESSO && order.local === 'Montagem' && Math.random() < 0.1) {
            order.status = STATUS.FINALIZADO;
            order.local = 'Expedição';
        }
    });

    // Alocação na Expedição
    const expedicaoOrdersToAllocate = orders.filter(o => o.local === 'Expedição' && o.status === STATUS.FINALIZADO && typeof o.posicaoExpedicao === 'undefined');
    expedicaoOrdersToAllocate.forEach(order => {
        const occupiedPositions = orders.filter(o => o.local === 'Expedição' && o.status === STATUS.FINALIZADO).map(o => o.posicaoExpedicao);
        for (let i = 1; i <= 12; i++) { 
            if (!occupiedPositions.includes(i)) {
                order.posicaoExpedicao = i;
                break;
            }
        }
    });
}

// =======================================================================
// INTEGRAÇÃO COM NODE-RED (DADOS REAIS)
// =======================================================================

function buscandoDadosBancada() {
    fetch('http://localhost:1880/smartsense/estoque')
    .then(res => res.json())
    .then(data => {
        // Atualiza os módulos m1 a m4
        for (let i = 1; i <= 4; i++) {
            const mod = data[`m${i}`];
            if (mod) {
                document.getElementById(`m${i}-humi`).textContent = mod.humi || '--';
                document.getElementById(`m${i}-ai00`).textContent = mod.ai00 || '--';
                document.getElementById(`m${i}-vrms`).textContent = mod.vrms || '--';
                document.getElementById(`m${i}-irms`).textContent = mod.irms || '--';
                document.getElementById(`m${i}-appp`).textContent = mod.appp || '--';
                document.getElementById(`m${i}-actp`).textContent = mod.actp || '--';
            }
        }
        if (data.temperatura) {
            ambientalData.temperatura = data.temperatura;
            ambientalData.umidade = data.umidade;
        }
        updateOrderProgression();
        saveBancadasData();
        atualizarDadosBancada();
    })
    .catch(err => console.error("Erro ao buscar dados:", err));
}

function polling(segundos) {
    if (pollingInterval) clearTimeout(pollingInterval); 
    pollingInterval = setTimeout(() => {
        buscandoDadosBancada();
        polling(segundos); 
    }, segundos * 1000);
}

// =======================================================================
// FUNÇÕES DE RENDERIZAÇÃO (DESENHO DA INTERFACE)
// =======================================================================

function atualizarDadosBancada() {
    const expedicaoOrders = orders.filter(o => o.status === STATUS.FINALIZADO && o.local === 'Expedição');
    const pedidosProcesso = orders.filter(o => o.local === 'Processo' && o.status !== STATUS.FINALIZADO && o.status !== STATUS.CANCELADO).length;
    const pedidosMontagem = orders.filter(o => o.local === 'Montagem' && o.status !== STATUS.FINALIZADO && o.status !== STATUS.CANCELADO).length;
    
    renderBenches(estoqueData, expedicaoOrders); 
    renderProcessModules(pedidosProcesso, pedidosMontagem);
    renderEnvironmentalData(ambientalData); 
    renderActiveOrders(); 
}

function renderBenches(estoque, expedicao) {
    const estoqueContainer = document.getElementById('estoque-posicoes');
    if(estoqueContainer) {
        estoqueContainer.innerHTML = '';
        estoque.forEach((cor, index) => {
            const statusClass = cor ? cor : 'Vazio';
            estoqueContainer.innerHTML += `<div class="posicao-base ${statusClass}" title="${cor || 'Vazia'}">${cor ? cor : ''}</div>`;
        });
        document.getElementById('estoque-count').textContent = estoque.filter(c => c !== null).length + '/28';
    }

    const expedicaoContainer = document.getElementById('expedicao-posicoes');
    if(expedicaoContainer) {
        expedicaoContainer.innerHTML = '';
        const expedicaoMap = new Array(12).fill(null);
        expedicao.forEach(order => { if (order.posicaoExpedicao) expedicaoMap[order.posicaoExpedicao - 1] = order; });

        expedicaoMap.forEach((order, index) => {
            if (order) {
                expedicaoContainer.innerHTML += `<div class="posicao-base Pronto ${order.base}" title="Pedido ${order.id}">${order.id.slice(1)}</div>`;
            } else {
                expedicaoContainer.innerHTML += `<div class="posicao-base Vazio"></div>`;
            }
        });
        document.getElementById('expedicao-count').textContent = expedicao.length + '/12';
    }
}

function renderProcessModules(procCount, montCount) {
    if(document.getElementById('processo-status')) {
        document.getElementById('processo-status').textContent = procCount > 0 ? 'Em Andamento' : 'Ocioso';
        document.getElementById('processo-modulos').textContent = procCount;
        document.getElementById('montagem-status').textContent = montCount > 0 ? 'Em Andamento' : 'Ocioso';
        document.getElementById('montagem-modulos').textContent = montCount;
    }
}

function renderEnvironmentalData(data) {
    if(document.getElementById('ambiental-temp')) document.getElementById('ambiental-temp').textContent = data.temperatura || '--';
    if(document.getElementById('ambiental-umid')) document.getElementById('ambiental-umid').textContent = data.umidade || '--';
}

function buscarPedido(pedidoId) {
    const order = orders.find(o => o.id.toUpperCase() === pedidoId.toUpperCase());
    const resultadoDiv = document.getElementById('rastreio-resultado');
    if(!resultadoDiv) return;
    
    resultadoDiv.style.display = 'block';
    if (order) {
        const isCancellable = order.status !== STATUS.FINALIZADO && order.status !== STATUS.CANCELADO;
        resultadoDiv.innerHTML = `
            <h4>Pedido: ${order.id}</h4>
            <p>Local: <strong>${order.local}</strong> | Status: <strong>${order.status}</strong></p>
            <p>Base: ${order.base}</p>
            ${isCancellable ? `<button class="action-btn delete-btn" onclick="handleCancelOrder('${order.id}')">❌ Cancelar</button>` : ''}
        `;
    } else {
        resultadoDiv.innerHTML = `<h4>Pedido ${pedidoId} não encontrado.</h4>`;
    }
}

function renderActiveOrders() {
    const listaUl = document.getElementById('lista-pedidos-ul');
    if(!listaUl) return;
    listaUl.innerHTML = '';
    const activeOrders = orders.filter(o => o.status !== STATUS.FINALIZADO && o.status !== STATUS.CANCELADO);
    if (activeOrders.length === 0) {
        listaUl.innerHTML = '<li>Nenhum pedido em produção.</li>';
        return;
    }
    activeOrders.forEach(order => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `[${order.id}] ${order.status} (<a href="#" onclick="buscarPedido('${order.id}'); return false;">Rastrear</a>)`;
        listaUl.appendChild(listItem);
    });
}

// Inicia tudo ao carregar
document.addEventListener('DOMContentLoaded', initializeBancadasPage);