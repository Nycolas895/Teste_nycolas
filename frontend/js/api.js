const API_BASE = "http://localhost:3333";

 async function apiRequest(path, { method = "GET", body } = {}) {
  const res = await fetch(API_BASE + path, {
    method,
     headers: { "Content-Type": "application/json" },
     body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
   const  data = text ? safeJson(text) : null;

   if (!res.ok) {
    const msg =
      (data && (data.message || data.error)) ||
      text ||
      `Erro HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

function safeJson(text) {
  try { return JSON.parse(text); } catch { return null; }
}

function apiGet(path) { 
    return  apiRequest(path, { method: "GET" }); 
}
function apiPost(path, body)  { return apiRequest(path, { method: "POST", body }); }
function apiPut(path, body)  { return apiRequest(path, { method: "PUT", body }); }
 function apiDelete(path) { return apiRequest(path, { method: "DELETE" }); }