(function () {
  const g = id => document.getElementById(id);
  const DIAS = ["SEG", "TER", "QUA", "QUI", "SEX"];
  const ID_DIA = /^[dhf](SEG|TER|QUA|QUI|SEX)$/;
  const KP = "aee_padroes";
  const ler = () => { try { return JSON.parse(localStorage.getItem(KP)) || {}; } catch (e) { return {}; } };
  const gravarP = p => { try { localStorage.setItem(KP, JSON.stringify(p)); } catch (e) {} };

  // ============ HORÁRIO POR DIA: INÍCIO E FIM (aba Termo) ============
  DIAS.forEach(d => {
    const form = g("d" + d).closest(".form-check");
    const caixa = document.createElement("div");
    caixa.className = "d-flex flex-column";
    form.parentNode.insertBefore(caixa, form);
    caixa.appendChild(form);
    const hbox = document.createElement("div");
    hbox.className = "hbox";
    hbox.innerHTML =
      `<small class="text-muted d-block mt-1">Início</small><input type="time" id="h${d}" class="form-control form-control-sm" aria-label="Início do atendimento (${d})" data-f>` +
      `<small class="text-muted d-block mt-1">Fim</small><input type="time" id="f${d}" class="form-control form-control-sm" aria-label="Fim do atendimento (${d})" data-f>`;
    hbox.querySelectorAll("input").forEach(i => { i.style.width = "100%"; i.style.maxWidth = "130px"; });
    caixa.appendChild(hbox);
  });

  // o campo "Horário" passa a ser gerado automaticamente
  const hor = g("horario");
  hor.readOnly = true;
  hor.placeholder = "Gerado a partir dos dias e horários marcados";
  if (hor.previousElementSibling) hor.previousElementSibling.textContent = "Horário no documento (automático)";

  // 14:30 -> 14h30 | 03:00 -> 3h | 22:00 -> 22h | 18:45 -> 18h45
  const fmt = t => {
    const m = /^(\d{1,2}):(\d{2})/.exec(t || "");
    if (!m) return "";
    return parseInt(m[1], 10) + "h" + (m[2] === "00" ? "" : m[2]);
  };
  // com início e fim: "das 14h às 15h30" (iguais) ou "SEG das 14h às 15h30, QUA das 15h às 16h"
  function atualizaHorario() {
    const marc = DIAS.filter(d => g("d" + d).checked);
    let ok = marc.length > 0;
    marc.forEach(d => {
      const i = g("h" + d).value, f = g("f" + d).value;
      const ruim = !!(i && f && f <= i); // o fim precisa ser depois do início
      g("f" + d).classList.toggle("is-invalid", ruim);
      if (!i || !f || ruim) ok = false;
    });
    let txt = "";
    if (ok) {
      const ints = marc.map(d => `das ${fmt(g("h" + d).value)} às ${fmt(g("f" + d).value)}`);
      txt = ints.every(x => x === ints[0]) ? ints[0] : marc.map((d, k) => `${d} ${ints[k]}`).join(", ");
    }
    hor.value = txt;
    if (txt) hor.classList.remove("is-invalid");
  }
  const toggleH = () => DIAS.forEach(d => { g("h" + d).closest(".hbox").style.display = g("d" + d).checked ? "" : "none"; });

  document.addEventListener("input", e => { if (ID_DIA.test(e.target.id)) atualizaHorario(); });
  document.addEventListener("change", e => { if (ID_DIA.test(e.target.id)) { toggleH(); atualizaHorario(); } });

  // ============ PADRÕES LEMBRADOS ============
  function salvarPadroes() {
    const p = ler(); p.ped = p.ped || {};
    const esc = g("escola").value, ped = g("pedagoga").value.trim(), prof = g("prof").value.trim();
    if (esc) { p.escola = esc; if (ped) p.ped[esc] = ped; }
    if (prof) p.prof = prof;
    p.termo = { dias: DIAS.filter(d => g("d" + d).checked), horas: Object.fromEntries(DIAS.map(d => [d, g("h" + d).value])),
      fins: Object.fromEntries(DIAS.map(d => [d, g("f" + d).value])) };
    gravarP(p);
  }
  document.addEventListener("change", e => {
    if (["escola", "prof", "pedagoga"].includes(e.target.id) || ID_DIA.test(e.target.id)) salvarPadroes();
  });

  function aplicarPadroes() {
    const p = ler(), esc = g("escola");
    if (p.escola && [...esc.options].some(o => o.value === p.escola)) {
      esc.value = p.escola;
      if (window.aoMudarEscola) window.aoMudarEscola();
    }
    if (p.prof && !g("prof").value) g("prof").value = p.prof;
    if (p.termo) DIAS.forEach(d => {
      g("d" + d).checked = (p.termo.dias || []).includes(d);
      g("h" + d).value = (p.termo.horas || {})[d] || "";
      g("f" + d).value = (p.termo.fins || {})[d] || "";
    });
  }

  // pedagogo(a) lembrado(a) por escola
  const origEscola = window.aoMudarEscola;
  window.aoMudarEscola = function () {
    const antiga = g("cidade").value;
    origEscola();
    // a cidade da assinatura acompanha a escola, a menos que tenha sido editada à mão
    const c = g("cidadeAssin");
    if (!c.value.trim() || c.value === antiga) c.value = g("cidade").value;
    const p = ler(), e = g("escola").value;
    if (e && !g("pedagoga").value.trim() && p.ped && p.ped[e]) g("pedagoga").value = p.ped[e];
  };

  // estudantes antigos com a cidade da assinatura vazia recebem a cidade da escola
  function sincronizarCidade() {
    const c = g("cidadeAssin");
    if (!c.value.trim() && g("cidade").value) c.value = g("cidade").value;
  }

  // ============ ANO LETIVO AUTOMÁTICO + APLICAÇÃO AO ABRIR "NOVO" ============
  const anoAtual = () => String(new Date().getFullYear());
  const origPreencher = window.preencher;
  window.preencher = function (o) {
    origPreencher(o);
    const novo = !atualId; // sem estudante aberto = estudante novo
    if (!o || !o.anoLetivo) g("anoLetivo").value = anoAtual();
    if (novo) aplicarPadroes();
    sincronizarCidade();
    toggleH();
    // estudantes antigos (sem horário de fim) mantêm o horário que já tinham
    if (DIAS.some(d => g("f" + d).value) || !(o && o.horario)) atualizaHorario();
  };

  // estado inicial da página
  g("anoLetivo").value = anoAtual();
  aplicarPadroes();
  sincronizarCidade();
  toggleH();
  atualizaHorario();
})();
