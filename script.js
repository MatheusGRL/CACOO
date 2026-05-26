/* ══════════════════════════════════════════
   MeuBanco – Lógica JavaScript
   Arquivo: script.js
   ══════════════════════════════════════════ */

/* ─────────────────────────────────────────
   BANCO DE USUÁRIOS CADASTRADOS
   Cada objeto representa um usuário válido:
   { agencia, conta, senha }
   ───────────────────────────────────────── */
const usuariosCadastrados = [
  { agencia: "0001", conta: "000001-0", senha: "123" },
  { agencia: "0001", conta: "000002-1", senha: "456" },
  { agencia: "0002", conta: "000010-5", senha: "789" }
];

/* ─────────────────────────────────────────
   FUNÇÃO: validacao()
   Exigida pelo professor.
   Verifica se a senha digitada é "123" e
   autentica o usuário na homepage do sistema.
   ───────────────────────────────────────── */
function validacao() {
  // Captura os valores digitados pelo usuário
  var agencia = document.getElementById("inp-agencia").value.trim();
  var conta   = document.getElementById("inp-conta").value.trim();
  var senha   = document.getElementById("inp-senha").value.trim();

  // ── Validação básica: campos não podem ficar vazios ──
  if (agencia === "" || conta === "" || senha === "") {
    exibirErro("Preencha todos os campos para continuar.");
    return false; // interrompe a função
  }

  // ── Regra principal pedida pelo professor:
  //    a senha deve ser igual a "123" ──
  if (senha !== "123") {
    exibirErro("Senha incorreta. Acesso negado.");
    return false; // autenticação negada
  }

  // ── Senha correta: autentica e transfere para a homepage ──
  ocultarErro();
  goTo("s-dashboard"); // redireciona para a página principal
  return true;
}

/* ─────────────────────────────────────────
   FUNÇÃO: validacaoCompleta()   (bônus)
   Versão estendida que verifica agência,
   conta E senha na lista de usuários.
   ───────────────────────────────────────── */
function validacaoCompleta() {
  var agencia = document.getElementById("inp-agencia").value.trim();
  var conta   = document.getElementById("inp-conta").value.trim();
  var senha   = document.getElementById("inp-senha").value.trim();

  if (agencia === "" || conta === "" || senha === "") {
    exibirErro("Preencha todos os campos para continuar.");
    return false;
  }

  // Procura o usuário no banco de dados
  var usuarioEncontrado = usuariosCadastrados.find(function(u) {
    return u.agencia === agencia && u.conta === conta && u.senha === senha;
  });

  if (!usuarioEncontrado) {
    exibirErro("Agência, conta ou senha incorretos. Acesso negado.");
    return false;
  }

  ocultarErro();
  goTo("s-dashboard");
  return true;
}

/* ─────────────────────────────────────────
   HELPERS DE ERRO NO LOGIN
   ───────────────────────────────────────── */
function exibirErro(mensagem) {
  var errorEl = document.getElementById("login-error");
  errorEl.textContent = mensagem;
  errorEl.classList.add("visible");
  // Chacoalha o card para dar feedback visual
  var card = document.querySelector(".login-card");
  card.style.animation = "none";
  setTimeout(function() { card.style.animation = ""; }, 10);
}

function ocultarErro() {
  document.getElementById("login-error").classList.remove("visible");
}

/* ─────────────────────────────────────────
   NAVEGAÇÃO ENTRE TELAS
   ───────────────────────────────────────── */
function goTo(id) {
  document.querySelectorAll(".screen").forEach(function(s) {
    s.classList.remove("active");
  });
  document.getElementById(id).classList.add("active");
}

/* ─────────────────────────────────────────
   MODAL DE CONFIRMAÇÃO
   ───────────────────────────────────────── */
function openModal() {
  var now = new Date();
  var dataFormatada = now.toLocaleDateString("pt-BR") +
    " às " + now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  document.getElementById("m-data").textContent = dataFormatada;
  document.getElementById("confirm-modal").classList.add("open");
}

function closeModal() {
  document.getElementById("confirm-modal").classList.remove("open");
}

function confirmOp() {
  closeModal();
  var now = new Date();
  document.getElementById("s-data").textContent =
    now.toLocaleDateString("pt-BR") + " " + now.toLocaleTimeString("pt-BR");
  // Gera um código de operação aleatório
  document.getElementById("s-cod").textContent =
    "E" + Math.random().toString().slice(2, 14).toUpperCase();
  document.getElementById("s-tipo").textContent =
    document.getElementById("m-tipo").textContent;
  document.getElementById("s-valor").textContent =
    document.getElementById("m-valor").textContent;
  goTo("s-sucesso");
}

/* ─────────────────────────────────────────
   TROCA DE ABAS (Transferência)
   ───────────────────────────────────────── */
function switchTab(tab) {
  document.querySelectorAll(".tab").forEach(function(t) {
    t.classList.remove("active");
  });
  document.getElementById("tab-" + tab).classList.add("active");
}

/* ─────────────────────────────────────────
   FORMATAÇÃO DE MOEDA (R$)
   ───────────────────────────────────────── */
function formatMoney(el) {
  var v = el.value.replace(/\D/g, "");
  if (!v) { el.value = ""; return; }
  v = (parseInt(v) / 100).toFixed(2);
  el.value = "R$ " + v.replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  // Atualiza o valor no modal em tempo real
  var modalValor = document.getElementById("m-valor");
  if (modalValor) modalValor.textContent = el.value || "R$ 0,00";
}

/* ─────────────────────────────────────────
   SELEÇÃO DE CHAVE PIX
   ───────────────────────────────────────── */
function selectKey(el) {
  document.querySelectorAll(".key-chip").forEach(function(k) {
    k.classList.remove("selected");
  });
  el.classList.add("selected");
}

/* ─────────────────────────────────────────
   BOLETO – PARSE E GERAÇÃO DE CÓDIGO DE BARRAS
   ───────────────────────────────────────── */
function parseBoleto(el) {
  var v = el.value.trim();
  var details     = document.getElementById("boleto-details");
  var barcodeLines = document.getElementById("barcode-lines");
  var barcodeNum  = document.getElementById("barcode-num");

  if (v.length > 20) {
    details.style.display = "block";

    // Gera as barras do código de barras com base nos dígitos digitados
    barcodeLines.innerHTML = "";
    var seed = v.split("").reduce(function(a, c) { return a + c.charCodeAt(0); }, 0);

    function rand(i) {
      return ((seed * 1664525 + i * 22695477 + 1013904223) & 0xffffffff) >>> 0;
    }

    for (var i = 0; i < 60; i++) {
      var bar = document.createElement("div");
      bar.className = "bar";
      bar.style.width = (rand(i) % 3 + 1) + "px";
      bar.style.flexGrow = "0";
      barcodeLines.appendChild(bar);
    }

    barcodeNum.textContent = v.slice(0, 10) + "..." + v.slice(-10);

    // Preenche o modal com os dados do boleto
    document.getElementById("m-tipo").textContent  = "Pagamento de Boleto";
    document.getElementById("m-dest").textContent  = "CEMIG – Energia Elétrica";
    document.getElementById("m-valor").textContent = "R$ 180,00";
  } else {
    details.style.display = "none";
    barcodeLines.innerHTML = "";
    barcodeNum.textContent = "—";
  }
}

/* ─────────────────────────────────────────
   INICIALIZAÇÃO – executado ao carregar a página
   ───────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", function() {

  // Botões de filtro do extrato (ativo / inativo)
  document.querySelectorAll(".filter-btn").forEach(function(btn) {
    btn.addEventListener("click", function() {
      this.closest(".filter-bar").querySelectorAll(".filter-btn").forEach(function(b) {
        b.classList.remove("active");
      });
      this.classList.add("active");
    });
  });

  // Fechar modal ao clicar fora dele
  document.getElementById("confirm-modal").addEventListener("click", function(e) {
    if (e.target === this) closeModal();
  });

  // Permitir login com a tecla Enter
  document.getElementById("inp-senha").addEventListener("keydown", function(e) {
    if (e.key === "Enter") validacao();
  });

});
