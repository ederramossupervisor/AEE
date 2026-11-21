(function () {
  const g = id => document.getElementById(id);
  const DIAS = ["SEG", "TER", "QUA", "QUI", "SEX"];
  const ID_DIA = /^[dh](SEG|TER|QUA|QUI|SEX)$/;
  const KP = "aee_padroes";
  const ler = () => { try { return JSON.parse(localStorage.getItem(KP)) || {}; } catch (e) { return {}; } };
  const gravarP = p => { try { localStorage.setItem(KP, JSON.stringify(p)); } catch (e) {} };

  // ============ SELETOR DE HORA POR DIA (aba Termo) ============
  DIAS.forEach(d => {
    const form = g("d" + d).closest(".form-check");
    const caixa = document.createElement("div");
    caixa.className = "d-flex flex-column";
    form.parentNode.insertBefore(caixa, form);
    caixa.appendChild(form);
    const t = document.createElement("input");
    t.type = "time"; t.id = "h" + d;
    t.className = "form-control form-control-sm mt-1";
    t.style.width = "115px";
    t.setAttribute("data-f", "");
    t.setAttribute("aria-label", "Horário de " + d);
    caixa.appendChild(t);
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
  function atualizaHorario() {
    const hs = DIAS.filter(d => g("d" + d).checked).map(d => [d, fmt(g("h" + d).value)]);
    let txt = "";
    if (hs.length && hs.every(([, h]) => h)) {
      const iguais = hs.every(([, h]) => h === hs[0][1]);
      txt = iguais ? hs[0][1] : hs.map(([d, h]) => `${d} ${h}`).join(", ");
    }
    hor.value = txt;
    if (txt) hor.classList.remove("is-invalid");
  }
  const toggleH = () => DIAS.forEach(d => { g("h" + d).style.display = g("d" + d).checked ? "" : "none"; });

  document.addEventListener("input", e => { if (ID_DIA.test(e.target.id)) atualizaHorario(); });
  document.addEventListener("change", e => { if (ID_DIA.test(e.target.id)) { toggleH(); atualizaHorario(); } });

  // ============ PADRÕES LEMBRADOS ============
  function salvarPadroes() {
    const p = ler(); p.ped = p.ped || {};
    const esc = g("escola").value, ped = g("pedagoga").value.trim(), prof = g("prof").value.trim();
    if (esc) { p.escola = esc; if (ped) p.ped[esc] = ped; }
    if (prof) p.prof = prof;
    p.termo = { dias: DIAS.filter(d => g("d" + d).checked), horas: Object.fromEntries(DIAS.map(d => [d, g("h" + d).value])) };
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
    });
  }

  // pedagogo(a) lembrado(a) por escola
  const origEscola = window.aoMudarEscola;
  window.aoMudarEscola = function () {
    origEscola();
    const p = ler(), e = g("escola").value;
    if (e && !g("pedagoga").value.trim() && p.ped && p.ped[e]) g("pedagoga").value = p.ped[e];
  };

  // ============ ANO LETIVO AUTOMÁTICO + APLICAÇÃO AO ABRIR "NOVO" ============
  const anoAtual = () => String(new Date().getFullYear());
  const origPreencher = window.preencher;
  window.preencher = function (o) {
    origPreencher(o);
    const novo = !atualId; // sem estudante aberto = estudante novo
    if (!o || !o.anoLetivo) g("anoLetivo").value = anoAtual();
    if (novo) aplicarPadroes();
    toggleH();
    // estudantes antigos (só com texto de horário) mantêm o horário que já tinham
    if (DIAS.some(d => g("h" + d).value) || !(o && o.horario)) atualizaHorario();
  };

  // estado inicial da página
  g("anoLetivo").value = anoAtual();
  aplicarPadroes();
  toggleH();
  atualizaHorario();
})();
