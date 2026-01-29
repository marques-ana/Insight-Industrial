
window.onload = ()=>{
    buscandarlistausuarios() 
    logar()
}


function logar(e){
    e.preventDefault();


    //Busca os inputs do HTML
    let input_usuario = document.getElementById("usuario");
    let input_senha = document.getElementById("senha");

    //Tratamento de erros, caso não tiver esses elementos
    if(!input_usuario || !input_senha){
        return;
    }

    console.log(input_usuario)

    //Se chegou até aqui, conseguiu coletar usuário e senha
    let usuario = input_usuario.value;
    let senha = input_senha.value;

    //Com o usuário e senha, podemos tentar o login
    fetch("http://10.77.241.173:1880/smartsense/listausuario",{
        method:"POST",
        body:JSON.stringify({usuario,senha})
    }).then((resposta)=>{
        console.log(resposta)
        if(resposta.ok){
            resposta.json()
        }
    }).then((usuario)=>{
        alert("Olá, usuario");
    })

}


function buscandarlistausuarios(){
    console.log(buscandarlistausuarios)
    fetch('http://10.77.241.173:1880/smartsense/listausuario')
    .then(res=>res.json())
    .then(data=>{
    console.log(data)
    })
}

