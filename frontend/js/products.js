document.addEventListener("DOMContentLoaded", async () => {
  if (document.getElementById("productTableBody")) {
    await loadProducts();
     return;
  }

  const form = document.getElementById("productForm");
  if (!form) return;

  const params = new URLSearchParams(location.search);
    const id = params.get("id");
  const isView = params.get("view") === "1";

  if (id) {
    const product = await getProductById(id);
     if (!product) {
      alert("Produto não encontrado.");
      location.href = "products.html";
      return;
    }

    fillFormWithProduct(product);

    if (isView) {
        setTitle("Visualizar Produto", "Detalhes do item (somente leitura).");
       setFormDisabled(true);
      hideSubmitButton();
    } else {
      setTitle("Editar Produto", "Atualize as informações do item.");
      setSubmitText("Salvar Alterações");
      setFormDisabled(false);
      if (document.getElementById("Id")) document.getElementById("Id").disabled = true;
    }
  } else {
    setTitle("Cadastro de Produto", "Preencha os detalhes técnicos.");
    setSubmitText("Salvar Produto");
    setFormDisabled(false);
    if (document.getElementById("Id")) document.getElementById("Id").disabled = true;
  }

  form.addEventListener("submit", (e) => onSubmitProduct(e, id));
});

 async function onSubmitProduct(e, id) {
  e.preventDefault();
  try {
    const payload = {
      Barcode: (document.getElementById("Barcode")?.value || "").trim(),
      Description: (document.getElementById("Description")?.value || "").trim(),
      SaleValue: toNumber(document.getElementById("SaleValue")?.value),
      GrossWeight: toNumber(document.getElementById("GrossWeight")?.value),
      NetWeight: toNumber(document.getElementById("NetWeight")?.value),
    };

    if (!payload.Barcode || !payload.Description) {
      alert("Preencha os campos obrigatórios.");
      return;
     }

    if (id) {
      await apiPut(`/products/${id}`, payload);
      alert("Produto atualizado!");
    } else {
      await apiPost("/products", payload);
      alert("Produto cadastrado!");
    }
    location.href = "products.html";
  } catch (err) {
    alert("Erro ao salvar produto.");
  }
}

async function getProductById(id) {
  try {
    const data = await apiGet(`/products/${id}`);
    let p = Array.isArray(data) ? data[0] : (data?.recordset?.[0] || data?.data || data);

    if (!p || typeof p !== "object") return null;

    return {
      Id: p.Id ?? p.id ?? p.ID ?? id,
      Barcode: p.Barcode ?? p.barcode ?? "",
        Description: p.Description ?? p.description ?? "",
      SaleValue: p.SaleValue ?? p.saleValue ?? 0,
      GrossWeight: p.GrossWeight ?? p.grossWeight ?? 0,
      NetWeight: p.NetWeight ?? p.netWeight ?? 0,
    };
  } catch (err) {
    return null;
  }
}

function fillFormWithProduct(p) {
  ["Id", "Barcode", "Description", "SaleValue", "GrossWeight", "NetWeight"].forEach(f => {
    const el = document.getElementById(f);
    if (el) el.value = p[f] ?? "";
  });
}

async function loadProducts() {
  const tbody = document.getElementById("productTableBody");
  if (!tbody) return;
    tbody.innerHTML = "";

  try {
    const data = await apiGet("/products");
    const products = Array.isArray(data) ? data : (data?.recordset || data?.data || []);

    if (!products.length) {
      tbody.innerHTML = `<tr><td colspan="4">Nenhum produto cadastrado.</td></tr>`;
      return;
    }

    products.forEach(raw => {
      const p = {
        Id: raw.Id ?? raw.id ?? raw.ID ?? "",
        Description: raw.Description ?? raw.description ?? "",
        SaleValue: raw.SaleValue ?? raw.saleValue ?? 0,
      };

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${p.Id}</td>
       <td>${escapeHtml(p.Description)}</td>
        <td>${formatBRL(p.SaleValue)}</td>
       <td class="actions">
          <button class="btn-sm btn-view" data-action="view" data-id="${p.Id}">Visualizar</button>
          <button class="btn-sm btn-edit" data-action="edit" data-id="${p.Id}">Editar</button>
          <button class="btn-sm btn-del" data-action="del" data-id="${p.Id}">Excluir</button>
        </td>`;
      tbody.appendChild(tr);
    });

    tbody.addEventListener("click", async (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      const id = btn.getAttribute("data-id");
        const action = btn.getAttribute("data-action");

      if (action === "view") location.href = `product-form.html?id=${id}&view=1`;
      else if (action === "edit") location.href = `product-form.html?id=${id}`;
      else if (action === "del") await deleteProduct(id);
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4">Erro ao carregar produtos.</td></tr>`;
  }
}

async function deleteProduct(id) {
  if (confirm("Deseja excluir este produto?")) {
    try {
      await apiDelete(`/products/${id}`);
      await loadProducts();
    } catch (err) {
      alert("Erro ao excluir.");
    }
  }
}

 function setFormDisabled(disabled) {
  document.querySelectorAll("#productForm input").forEach(el => {
    el.disabled = el.id === "Id" ? true : disabled;
  });
}

function setTitle(t, s) {
  const h2 = document.querySelector(".container h2");
  const p = document.querySelector(".container .subtitle");
  if (h2) h2.textContent = t;
  if (p) p.textContent = s;
}

function setSubmitText(t) {
  const btn = document.querySelector("#productForm button[type='submit']");
  if (btn) btn.textContent = t;
}

function hideSubmitButton() {
  const btn = document.querySelector("#productForm button[type='submit']");
  if (btn) btn.style.display = "none";
}

function formatBRL(v) {
  return Number(v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function escapeHtml(s) {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function toNumber(v) {
  const n = Number(String(v || "").replace(",", "."));
  return isFinite(n) ? n : 0;
}