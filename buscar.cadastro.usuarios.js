window.onload = () => {
    // Só chama o logar se houver um formulário de login na página atual
    const formLogin = document.getElementById("form-login"); // Certifique-se que o ID existe no HTML
    if (formLogin) {
        formLogin.onsubmit = logar;
    }
    
    // Se estiver na página de gerência, busca a lista
    if (document.getElementById('users-table-body')) {
        renderUsersTable(); 
    }
}

function logar(e) {
    if (e) e.preventDefault();

    let email = document.getElementById("email").value;
    let senha = document.getElementById("senha").value;

    fetch("http://localhost:1880/autenticacao/autenticar", {
        method: "POST",
        headers: { "Content-Type": "application/json" }, // Obrigatório para o Node-RED entender o JSON
        body: JSON.stringify({ email, senha }) // Enviando email e senha corretamente
    })
    .then(resposta => {
        if (resposta.ok) return resposta.json();
        throw new Error("Falha no login");
    })
    .then(data => {
        alert("Olá, " + (data.nome || "usuário"));
        window.location.href = '../index/index.html';
    })
    .catch(err => alert("Email ou senha incorretos."));
}