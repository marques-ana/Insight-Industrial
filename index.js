const STATUS = {
    NAO_INICIADO: 'Não iniciado',
    AGUARDANDO_MODULO: 'Aguardando módulo',
    EM_PROCESSO: 'Em processo',
    FINALIZADO: 'Finalizado',
    CANCELADO: 'Cancelado',
};


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


let orders = JSON.parse(localStorage.getItem('orders')) || [...defaultOrders];
let estoqueData = JSON.parse(localStorage.getItem('estoqueData')) || [...fullEstoque];
let ambientalData = JSON.parse(localStorage.getItem('ambientalData')) || {...defaultAmbiental};


let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;



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
            console.log(data)
            if (data) {
                

                const userParaSalvar = {
                    id: data[0].id,
                    
                    nome: data[0].nome, 
                    sobrenome: "",
                    
                    tipo: data[0].tipo, 
                    email: data[0].email,
                    dataNascimento: data[0].data_nascimento || data.dataNascimento || ""
            };

            localStorage.setItem('currentUser', JSON.stringify(userParaSalvar));
            console.log(userParaSalvar)
            window.location.href = 'bancadas.html';
            } else {
                loginErro.textContent = 'Dados de usuário inválidos.';
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



document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        
        
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
