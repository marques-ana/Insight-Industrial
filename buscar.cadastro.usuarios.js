window.onload = ()=>{
  buscandarlistausuarios() 
}


function buscandarlistausuarios(){
    console.log(buscandarlistausuarios)
    fetch('http://10.77.241.173:1880/smartsense/listausuario')
    .then(res=>res.json())
    .then(data=>{
    console.log(data)
    })
}

    fetch('http://10.77.241.173:1880/smartsense/usuariosalvo',{
        method: 'POST',
        headers:{
            'Content-type':'Application/json'
        },
        body: JSON.stringify(usuario)
    }).then(data=>{
    console.log(data)
    })