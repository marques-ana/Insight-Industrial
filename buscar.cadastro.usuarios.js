window.onload = ()=>{
  buscandoDadosBancada() 
}


function buscandoDadosBancada(){
    console.log(buscandoDadosBancada)
    fetch('http://10.77.241.173:1880/smartsense/cadastro')
    .then(res=>res.json())
    .then(data=>{
    console.log(data)
    })
}