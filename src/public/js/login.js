let btnSubmit=document.getElementById("submit")
let inputEmail=document.getElementById("email")
let inputPassword=document.getElementById("password")
let divMessage=document.getElementById("message")

btnSubmit.addEventListener("click", async(e)=>{
    e.preventDefault()

    let body={
        email:inputEmail.value,
        password:inputPassword.value
    }

    let resultado=await fetch("/api/sessions/login",{
        method:"post",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify(body)
    })
    let status=resultado.status
    let datos=await resultado.json()
    if(status==200){
        if (datos.user) {
            window.location.href = `/?mensaje=${datos.message}`;
        }
    }else{
        divMessage.style.color="red"
        divMessage.innerHTML=datos.error
    }

})