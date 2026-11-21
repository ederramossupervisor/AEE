(function () {
  const g = id => document.getElementById(id);
  const LIM = 285; // limite útil da página (mm)

  // ============ 1. BACKUP ============
  const KB = "aee_ultimo_backup";
  const aba = g("tabCadastro");
  const box = document.createElement("div");
  box.className = "border-top mt-4 pt-3";
  box.innerHTML = `
    <h6>Backup dos estudantes</h6>
    <div id="bkAviso" class="small mb-2"></div>
    <div class="d-flex flex-wrap gap-2">
      <button class="btn btn-outline-primary btn-sm" id="bkExp">Exportar backup</button>
      <button class="btn btn-outline-secondary btn-sm" id="bkImpBtn">Importar backup</button>
      <input type="file" id="bkImp" accept=".json,application/json" style="display:none">
    </div>`;
  aba.appendChild(box);

  function avisoBackup() {
    const el = g("bkAviso");
    const n = Object.keys(lerAlunos()).length;
    let ult = null; try { ult = localStorage.getItem(KB); } catch (e) {}
    if (!n) { el.className = "small mb-2 text-muted"; el.textContent = "Nenhum estudante salvo ainda."; return; }
    const dias = ult ? Math.floor((Date.now() - new Date(ult)) / 864e5) : null;
    if (dias === null) { el.className = "small mb-2 text-danger"; el.textContent = `${n} estudante(s) salvo(s) e nenhum backup feito. Exporte um backup.`; }
    else if (dias > 30) { el.className = "small mb-2 text-warning-emphasis"; el.textContent = `Último backup há ${dias} dias. Vale exportar um novo.`; }
    else { el.className = "small mb-2 text-success"; el.textContent = `${n} estudante(s). Último backup: ${new Date(ult).toLocaleDateString("pt-BR")}.`; }
  }

  g("bkExp").onclick = () => {
    const alunos = lerAlunos();
    if (!Object.keys(alunos).length) return alert("Não há estudantes salvos para exportar.");
    const dados = { app: "aee", versao: 1, exportado: new Date().toISOString(), alunos };
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(dados)], { type: "application/json" }));
    a.download = `backup_aee_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    try { localStorage.setItem(KB, new Date().toISOString()); } catch (e) {}
    avisoBackup();
  };

  g("bkImpBtn").onclick = () => g("bkImp").click();
  g("bkImp").onchange = e => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const j = JSON.parse(r.result);
        const novos = j && j.alunos ? j.alunos : j;
        if (!novos || typeof novos !== "object" || Array.isArray(novos)) throw new Error("formato inválido");
        const ids = Object.keys(novos);
        if (!ids.length) throw new Error("o arquivo não tem estudantes");
        if (!ids.every(id => novos[id] && typeof novos[id] === "object" && "nome" in novos[id])) throw new Error("formato inválido");
        const atuais = lerAlunos();
        const repetidos = ids.filter(id => atuais[id]).length;
        if (!confirm(`Importar ${ids.length} estudante(s)?` + (repetidos ? `\n${repetidos} já existe(m) neste aparelho e será(ão) substituído(s) pela versão do backup.` : ""))) return;
        gravar({ ...atuais, ...novos });
        atualizarLista(); avisoBackup();
        alert("Backup importado.");
      } catch (err) { alert("Não foi possível importar: " + err.message + "."); }
      g("bkImp").value = "";
    };
    r.readAsText(f);
  };

  const salvarOrig = window.salvarAluno;
  window.salvarAluno = function () { salvarOrig(); avisoBackup(); };
  const excluirOrig = window.excluirAluno;
  window.excluirAluno = function () { excluirOrig(); avisoBackup(); };
  avisoBackup();

  // ============ 2. TEXTOS LONGOS QUEBRANDO PÁGINA ============
  // ---- justificação de texto corrido ----
  // linhasJ: quebra o texto em linhas e marca, em .fim, quais são a última linha de cada parágrafo
  window.linhasJ = function (doc, texto, w) {
    const out = [], fim = [];
    String(texto || "").split(/\r\n|\r|\n/).forEach(par => {
      const ls = par === "" ? [""] : doc.splitTextToSize(par, w);
      ls.forEach((t, i) => { out.push(t); fim.push(i === ls.length - 1); });
    });
    out.fim = fim;
    return out;
  };
  // desenha uma linha; justifica quando ela não é a última do parágrafo
  window.linhaJ = function (doc, t, ultima, x, y, w) {
    const justifica = !ultima && t.trim() && !/ {3,}|_{3,}/.test(t) && doc.getTextWidth(t) > w * 0.55;
    // o jsPDF só justifica linhas que têm uma linha seguinte; a "" ao lado serve para isso
    if (justifica) doc.text([t, ""], x, y, { align: "justify", maxWidth: w });
    else doc.text(t, x, y);
  };
  // desenha várias linhas com o mesmo espaçamento do doc.text(array)
  window.desenhaJ = function (doc, linhas, x, y, w) {
    const passo = doc.getLineHeightFactor() * doc.getFontSize() / doc.internal.scaleFactor;
    linhas.forEach((t, i) => window.linhaJ(doc, t, linhas.fim ? linhas.fim[i] : true, x, y + i * passo, w));
  };

  // texto corrido (relatórios, observações etc.) — justificado
  window.txt = function (P, t) {
    const doc = P.doc;
    doc.setFont("helvetica", "normal"); doc.setFontSize(9.5);
    const l = window.linhasJ(doc, t, P.TW);
    l.forEach((ln, i) => {
      need(P, 4.6);
      doc.setFont("helvetica", "normal"); doc.setFontSize(9.5);
      window.linhaJ(doc, ln, l.fim[i], P.M, P.y + 3.5, P.TW); P.y += 4.6;
    });
    P.y += 1.5;
  };

  // quadro de largura total que continua na página seguinte
  window.caixaLonga = function (P, titulo, texto, min) {
    const doc = P.doc;
    doc.setFont("helvetica", "normal"); doc.setFontSize(9.5);
    const lines = doc.splitTextToSize(texto || "", P.TW - 4);
    let i = 0, first = true;
    const desenha = (ls, h) => {
      doc.rect(P.M, P.y, P.TW, h);
      doc.setFont("helvetica", "bold"); doc.setFontSize(9.5);
      doc.text(first ? titulo : titulo + " (continuação)", P.M + 2, P.y + 4.5);
      doc.setFont("helvetica", "normal"); doc.text(ls, P.M + 2, P.y + 9.5);
      P.y += h;
    };
    while (true) {
      const rest = lines.length - i, h1 = 10 + rest * 4.6;
      const hTot = Math.max(first ? min : 0, h1), free = LIM - P.y;
      if (hTot <= free) { desenha(lines.slice(i), hTot); break; }
      if (h1 <= free || free < 20) { need(P, 999); continue; }
      const n = Math.floor((free - 10) / 4.6);
      desenha(lines.slice(i, i + n), 10 + n * 4.6);
      i += n; first = false;
    }
  };

  // quadro de duas colunas (consolidadas × não consolidadas) que continua na página seguinte
  window.duplaLonga = function (P, titulo, a, b, min) {
    const doc = P.doc, w = P.TW / 2;
    doc.setFont("helvetica", "bold"); doc.setFontSize(8.5);
    const tl = doc.splitTextToSize(titulo, w - 4), th = tl.length * 3.8 + 3;
    doc.setFont("helvetica", "normal"); doc.setFontSize(9.5);
    const la = doc.splitTextToSize(a || "", w - 4), lb = doc.splitTextToSize(b || "", w - 4);
    let i = 0, first = true;
    const desenha = (n, h) => {
      [la, lb].forEach((l, k) => {
        const x = P.M + k * w;
        doc.rect(x, P.y, w, h);
        doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.text(tl, x + 2, P.y + 4);
        doc.setFont("helvetica", "normal"); doc.setFontSize(9.5);
        doc.text(l.slice(i, i + n), x + 2, P.y + th + 3.5);
      });
      P.y += h;
    };
    while (true) {
      const rest = Math.max(la.length - i, lb.length - i, 0), h1 = th + rest * 4.6 + 3;
      const hTot = Math.max(first ? min : 0, h1), free = LIM - P.y;
      if (hTot <= free) { desenha(rest, hTot); break; }
      if (h1 <= free || free < th + 14) { need(P, 999); continue; }
      const n = Math.floor((free - th - 3) / 4.6);
      desenha(n, th + n * 4.6 + 3);
      i += n; first = false;
    }
  };

  // ============ 3. NOMES SOB AS LINHAS DE ASSINATURA ============
  // assinaturas(P, rotulos, semBarra): se semBarra for true, não imprime o título "Assinaturas"
  window.assinaturas = function (P, rotulos, semBarra) {
    const d = coletar(), doc = P.doc;
    const nomeDe = r => {
      const s = r.toLowerCase();
      if (s.includes("diretor")) return d.diretor;
      if (s.includes("pedagog")) return d.pedagoga;
      if (s.includes("professor")) return d.prof;
      if (s.includes("respons") || s.includes("pais")) return d.responsavel;
      return "";
    };
    if (!semBarra) barra(P, "Assinaturas");
    rotulos.forEach(r => {
      need(P, 14);
      doc.setFont("helvetica", "normal"); doc.setFontSize(9.5); doc.setTextColor(0);
      const rt = r + ": ", w = doc.getTextWidth(rt), y = P.y + 8;
      doc.text(rt, P.M, y);
      doc.line(P.M + w, y, P.M + P.TW, y);
      const n = nomeDe(r);
      if (n) { doc.setFontSize(8.5); doc.setTextColor(80); doc.text(n, P.M + w, y + 4); doc.setTextColor(0); }
      P.y += 14;
    });
  };
})();
