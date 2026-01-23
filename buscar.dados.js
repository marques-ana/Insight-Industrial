window.onload = ()=>{
  polling(5)  
}

function polling(segundos){
    setTimeout(()=>{
        console.log('Buscando...')
        buscandoDadosBancada()
        polling(segundos)
    },segundos*1000)
}

function buscandoDadosBancada(){
    fetch('http://10 .77.241.173:1880/smartsense/estoque')
    .then(res=>res.json())
    .then(data=>{
    console.log(data)
    })
}
