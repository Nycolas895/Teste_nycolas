function qs(name) {
  return  new URL(window.location.href).searchParams.get(name);
}

async function loadClientsTable() {
 const tbody =  document.getElementById("clientTableBody");
  if (!tbody) return;

  const list = await apiRequest("/clients");
  tbody.innerHTML = "";

   for (const c of list) {
    const displayName = c.TradeName ? `${c.Name} (${c.TradeName})` : c.Name;

     const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.Id}</td>
      <td>${displayName}</td>
      <td>${c.Document}</td>
      <td class="actions">
        <button class="btn-sm btn-view" data-id="${c.Id}">Visualizar</button>
         <button class="btn-sm btn-edit" data-id="${c.Id}">Editar</button>
        <button class="btn-sm btn-del" data-id="${c.Id}">Excluir</button>
      </td>
    `;
    tbody.appendChild(tr);
  }

   tbody.querySelectorAll(".btn-view").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      window.location.href = `client-form.html?id=${id}&mode=view`;
    });
  });

  tbody.querySelectorAll(".btn-edit").forEach(btn => {
    btn.addEventListener("click" , () => {
       const id = btn.getAttribute("data-id");
      window.location.href = `client-form.html?id=${id}&mode=edit`;
    });
  });

  tbody.querySelectorAll(".btn-del").forEach(btn => {
     btn.addEventListener("click", async () => {
    const id = btn.getAttribute("data-id") ;
      if (!confirm("Deseja excluir este cliente?")) return;
      await apiRequest(`/clients/${id}`, { method: "DELETE" });
       await loadClientsTable();
    });
  });
}

async function initClientForm() {
  const form = document.getElementById("clientForm");
    if (!form) return;

   const id = qs("id");
  const mode = qs("mode") || "create";

  if (mode === "view") {
    form.querySelectorAll("input").forEach(i => i.disabled = true);
     const btnSave = form.querySelector('button[type="submit"]');
    if (btnSave) btnSave.style.display = "none";
  }

  if (id) {
    const c = await apiRequest(`/clients/${id}`);
     document.getElementById("Id").value = c.Id;
    document.getElementById("Document").value = c.Document;
    document.getElementById("Name").value = c.Name;
    document.getElementById("TradeName").value = c.TradeName || "";
    document.getElementById("Address").value = c.Address || ""  ;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      Document: document.getElementById("Document").value.trim(),
      Name: document.getElementById("Name").value.trim(),
       TradeName: document.getElementById("TradeName").value.trim(),
      Address: document.getElementById("Address").value.trim()
    };

     if (!payload.Document || !payload.Name) {
      alert("Documento e Nome são obrigatórios.");
      return;
    }

     if (!id) {
        await apiRequest("/clients", { method: "POST", body: payload });
    } else {
      await apiRequest(`/clients/${id}`, { method: "PUT", body: payload });
  }

    window.location.href = "clients.html";
  });
}

 document.addEventListener("DOMContentLoaded", async () => {
    try {
    await loadClientsTable();
  await initClientForm();
   } catch (err) {
     console.error(err);
   }
}) ;