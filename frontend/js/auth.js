document.addEventListener("DOMContentLoaded", () => {
   const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener ("submit", async (e) => {
    e.preventDefault();

    const username =  document.getElementById("usuario").value.trim();
    const password = document.getElementById("senha").value.trim();

    if (!username || !password) {
       alert("Preencha usuário e senha.");
      return;
    }

    try {
       const data = await apiRequest("/auth/login", {
        method: "POST",
        body: { username, password }
      });

       if (data?.ok) {
        localStorage.setItem("auth_ok", "true") ;
          window.location.href = "menu.html";
    } else {
        alert ("Usuário ou senha inválidos.");
      }
} catch (err) {
       alert(err.message || "Erro no login.");
    }
    });
});

function requireAuth() {
    if (!localStorage.getItem("auth_ok"))  {
    window.location.href = "index.html";
  }
}

 function logout() {
  localStorage.removeItem("auth_ok");
  window.location.href  = "index.html";
}