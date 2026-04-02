window.onload = () => {

    const formLogin = document.getElementById("form-login"); 
    if (formLogin) {
        formLogin.onsubmit = logar;
    }
    
    
    if (document.getElementById('users-table-body')) {
        renderUsersTable(); 
    }
}

function logar(e) {
    if (e) e.preventDefault();

    let email = document.getElementById("email").value;
    let senha = document.getElementById("senha").value;

    fetch("http://10.77.241.122:1880/autenticacao/autenticar", {
        method: "POST",
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ email, senha }) 
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