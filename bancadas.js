// =======================================================================
// LÓGICA DE CANCELAMENTO DE PEDIDO (FUNÇÃO GLOBAL) (MANTIDA)
// =======================================================================

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
        const estoqueIndex = estoqueData.indexOf(order.base); 
        // Se a base ainda estava no estoque e o pedido não iniciou, libera a base.
        if (order.status === STATUS.NAO_INICIADO && estoqueIndex !== -1) {
            estoqueData[estoqueIndex] = null;
        }
        
        // 3. Salva e atualiza
        saveBancadasData();
        atualizarDadosBancada();
        alert(`Pedido ${orderId} cancelado com sucesso.`);
        
        buscarPedido(orderId);
    }
}


// =======================================================================
// LÓGICA DE INICIALIZAÇÃO DA PÁGINA DE BANCADAS (Dashboard) (MANTIDA)
// =======================================================================

function initializeBancadasPage() {
    if (!currentUser) {
        window.location.href = 'index.html'; 
        return;
    }

    document.getElementById('display-user-name').textContent = `${currentUser.nome} ${currentUser.sobrenome}`;
    document.getElementById('display-user-type').textContent = currentUser.tipo;

    const navGerencia = document.getElementById('nav-gerencia');
    const navReset = document.getElementById('nav-reset-data'); 
    
    if (currentUser.tipo === 'Professor') {
        navGerencia.style.display = 'inline-block';
        if (navReset) navReset.style.display = 'inline-block'; 
    } else {
        navGerencia.style.display = 'none';
        if (navReset) navReset.style.display = 'none'; 
    }

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
            buscarPedido(document.getElementById('pedido-id-busca').value);
        });
    }
    
    polling(2); 
    atualizarDadosBancada(); 
}

// =======================================================================
// LÓGICA DE CRIAÇÃO DE PEDIDO (RF06) (CORRIGIDA)
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
        local: 'Estoque' 
    };

    // CORREÇÃO: A CRIAÇÃO não verifica mais se há nulls no estoque (como se estivesse reservando a base).
    // O consumo real (diminuição da contagem) acontece apenas no avanço do status.
    orders.push(newOrder);
    saveBancadasData(); 
    alert(`Pedido ${newId} criado com sucesso! Status: ${newOrder.status}`);
    
    atualizarDadosBancada(); 
    document.getElementById('form-cria-pedido').reset();
}


// =======================================================================
// LÓGICA DE ATUALIZAÇÃO DE DADOS E POLLING (RF07, RNF01, Dados Reais)
// =======================================================================

// Lógica de simulação de avanço do pedido e consumo de estoque
function updateOrderProgression() {
    
    orders.forEach(order => {
        // Ignora pedidos finalizados ou cancelados
        if (order.status === STATUS.FINALIZADO || order.status === STATUS.CANCELADO) {
            return;
        }

        if (order.status === STATUS.NAO_INICIADO && Math.random() < 0.2) {
            
            // RN02: REMOVE A BASE DO ESTOQUE AQUI, ao entrar em produção.
            const estoqueIndex = estoqueData.indexOf(order.base);
            
            // O pedido só avança se a base estiver disponível no estoque (posição com a cor)
            if (estoqueIndex !== -1) { 
                
                // 1. Transition status: Estoque -> Processo (Aguardando Módulo)
                order.status = STATUS.AGUARDANDO_MODULO;
                order.local = 'Processo';
                
                // 2. Remove base do Stock (O CONSUMO OCORRE AQUI)
                estoqueData[estoqueIndex] = null; // A posição fica nula/vazia, DIMINUINDO A CONTAGEM
            }
            // Se a base não estiver mais no estoque (estoqueIndex == -1), o pedido fica parado em NAO_INICIADO.
            
        } else if (order.status === STATUS.AGUARDANDO_MODULO && Math.random() < 0.2) {
            // Transition status: Aguardando Módulo -> Em Processo (Ainda em Processo)
            order.status = STATUS.EM_PROCESSO;
            order.local = 'Processo';

        } else if (order.status === STATUS.EM_PROCESSO && order.local === 'Processo' && Math.random() < 0.2) {
            // Transição de Processo -> Montagem
            order.local = 'Montagem'; 

        } else if (order.status === STATUS.EM_PROCESSO && order.local === 'Montagem' && Math.random() < 0.1) {
            // Ação de Finalização do Pedido: Montagem -> Expedição
            order.status = STATUS.FINALIZADO;
            order.local = 'Expedição';
        }
    });

    // Simula a alocação de pedidos finalizados na Expedição (RN03)
    const expedicaoOrdersToAllocate = orders.filter(o => 
        o.local === 'Expedição' && 
        o.status === STATUS.FINALIZADO && 
        typeof o.posicaoExpedicao === 'undefined'
    );
    
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


// Função de busca que integra API real (Apenas para Dados Ambientais)
function buscandoDadosBancada() {
    fetch('http://10.77.241.112:1880/smartsense/estoque')
    .then(res => res.json())
    .then(data => {
        // data deve vir no formato: { m1: { humi: 50, ai00: 176, ... }, m2: { ... } }
        
        // Exemplo de atualização para o Módulo 1
        if (data.m1) {
            document.getElementById('m1-humi').textContent = data.m1.humi;
            document.getElementById('m1-ai00').textContent = data.m1.ai00;
            document.getElementById('m1-vrms').textContent = data.m1.vrms;
            document.getElementById('m1-irms').textContent = data.m1.irms;
            document.getElementById('m1-appp').textContent = data.m1.appp;
            document.getElementById('m1-actp').textContent = data.m1.actp;
        }

        // Mantém a lógica de temperatura e umidade global que você já tinha
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

function polling(segundos){
    if (pollingInterval) clearTimeout(pollingInterval); 
    
    pollingInterval = setTimeout(() => {
        console.log('Buscando dados da bancada em tempo real...')
        buscandoDadosBancada()
        polling(segundos) 
    }, segundos * 1000)
}


async function atualizarDadosBancada() {
    
    const expedicaoOrders = orders.filter(o => 
        o.status === STATUS.FINALIZADO && 
        o.local === 'Expedição' 
    );
    
    const pedidosProcesso = orders.filter(o => 
        o.local === 'Processo' && 
        o.status !== STATUS.FINALIZADO && 
        o.status !== STATUS.CANCELADO
    ).length;

    const pedidosMontagem = orders.filter(o => 
        o.local === 'Montagem' && 
        o.status !== STATUS.FINALIZADO && 
        o.status !== STATUS.CANCELADO
    ).length;
    
    
    renderBenches(estoqueData, expedicaoOrders); 
    renderProcessModules(pedidosProcesso, pedidosMontagem);
    renderEnvironmentalData(ambientalData); 
    
    renderActiveOrders(); 
}

// =======================================================================
// FUNÇÕES DE RENDERIZAÇÃO E RASTREAMENTO (RF03, RF04, RF05) (MANTIDAS)
// =======================================================================

function renderBenches(estoque, expedicao) {
    // RN02: Renderiza Estoque (28 posições)
    const estoqueContainer = document.getElementById('estoque-posicoes');
    estoqueContainer.innerHTML = '';
    estoque.forEach((cor, index) => {
        const statusClass = cor ? cor : 'Vazio';
        const title = cor ? `Base ${cor} (Posição ${index + 1})` : `Posição ${index + 1}: Vazia`;
        estoqueContainer.innerHTML += `<div class="posicao-base ${statusClass}" title="${title}">${cor ? cor[0] : ''}</div>`;
    });
    
    // Contagem de estoque atualizada (28 - bases nulas)
    document.getElementById('estoque-count').textContent = estoque.filter(c => c !== null).length + '/28';

    // RN03: Renderiza Expedição (12 posições)
    const expedicaoContainer = document.getElementById('expedicao-posicoes');
    expedicaoContainer.innerHTML = '';
    
    const expedicaoMap = new Array(12).fill(null);
    expedicao.forEach(order => {
        if (order.posicaoExpedicao) {
             expedicaoMap[order.posicaoExpedicao - 1] = order; 
        }
    });

    expedicaoMap.forEach((order, index) => {
        if (order) {
            const baseClass = order.base; 
            const title = `Pedido ${order.id} | Base ${order.base} (Posição ${index + 1})`;
            const idNumber = order.id.slice(1); 

            expedicaoContainer.innerHTML += `<div class="posicao-base Pronto ${baseClass}" title="${title}">${idNumber}</div>`;
        } else {
            const title = `Posição ${index + 1}: Vazia`;
            expedicaoContainer.innerHTML += `<div class="posicao-base Vazio" title="${title}"></div>`;
        }
    });
    document.getElementById('expedicao-count').textContent = expedicao.length + '/12';
}

function renderProcessModules(procCount, montCount) {
    // RN01: Módulos Processo
    document.getElementById('processo-status').textContent = procCount > 0 ? 'Em Andamento' : 'Ocioso';
    document.getElementById('processo-modulos').textContent = procCount;

    // RN01: Módulos Montagem
    document.getElementById('montagem-status').textContent = montCount > 0 ? 'Em Andamento' : 'Ocioso';
    document.getElementById('montagem-modulos').textContent = montCount;
}

function renderEnvironmentalData(data) {
    // 1. Atualiza os dados globais (se ainda existirem no seu rodapé)
    if(document.getElementById('ambiental-temp')) 
        document.getElementById('ambiental-temp').textContent = data.temperatura || '--';
    if(document.getElementById('ambiental-umid')) 
        document.getElementById('ambiental-umid').textContent = data.umidade || '--';

    // 2. Loop para atualizar os 4 módulos (m1, m2, m3, m4)
    for (let i = 1; i <= 4; i++) {
        const mod = data[`m${i}`]; // Busca m1, m2... dentro do JSON
        if (mod) {
            document.getElementById(`m${i}-humi`).textContent = mod.humi;
            document.getElementById(`m${i}-ai00`).textContent = mod.ai00;
            document.getElementById(`m${i}-vrms`).textContent = mod.vrms;
            document.getElementById(`m${i}-irms`).textContent = mod.irms;
            document.getElementById(`m${i}-appp`).textContent = mod.appp;
            document.getElementById(`m${i}-actp`).textContent = mod.actp;
        }
    }
}

function buscarPedido(pedidoId) {
    const order = orders.find(o => o.id.toUpperCase() === pedidoId.toUpperCase());
    const resultadoDiv = document.getElementById('rastreio-resultado');
    
    resultadoDiv.style.display = 'block';

    if (order) {
        const statusKey = Object.keys(STATUS).find(key => STATUS[key] === order.status);
        const statusClass = statusKey ? `status-${statusKey.toLowerCase().replace(/_/g, '-')}` : '';
        
        const isCancellable = order.status !== STATUS.FINALIZADO && order.status !== STATUS.CANCELADO;
        
        let acoesHtml = '';
        if (isCancellable) {
            acoesHtml = `<button class="action-btn delete-btn" onclick="handleCancelOrder('${order.id}')">❌ Cancelar Pedido</button>`;
        } else if (order.status === STATUS.CANCELADO) {
             acoesHtml = `<span style="color: red; font-weight: bold;">Este pedido foi CANCELADO.</span>`;
        }


        resultadoDiv.innerHTML = `
            <h4>Pedido: ${order.id}</h4>
            <p>Local Atual: <strong>${order.local}</strong></p>
            <p>Status: <strong class="${statusClass}">${order.status}</strong></p>
            <p>Base: ${order.base} | Paredes: ${order.paredes.join(', ')}</p>
            <div style="margin-top: 10px;">${acoesHtml}</div>
        `;
    } else {
        resultadoDiv.innerHTML = `<h4>Pedido ${pedidoId} não encontrado.</h4>`;
    }
}

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