(function () {
  const g = id => document.getElementById(id);
  const DIAS = ["SEG", "TER", "QUA", "QUI", "SEX"];
  const NOMES = { SEG: "segunda", TER: "terça", QUA: "quarta", QUI: "quinta", SEX: "sexta" };
  const SUPER_PADRAO = "Héverton Filipe Gomes Dazílio"; // superintendente que já vem preenchido
  const KP = "aee_padroes";
  const ler = () => { try { return JSON.parse(localStorage.getItem(KP)) || {}; } catch (e) { return {}; } };
  const gravarP = p => { try { localStorage.setItem(KP, JSON.stringify(p)); } catch (e) {} };
  const hoje = () => {
    const d = new Date(), p = n => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  };

  // ============ ABA ============
  const nav = document.querySelector(".nav-tabs");
  nav.insertAdjacentHTML("beforeend",
    '<li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#tabOficio">Ofício</button></li>');

  // ícone da aba (carta) para o 6º item
  const st = document.createElement("style");
  st.textContent = `.nav-tabs .nav-item:nth-child(6) .nav-link{--ico:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='5' width='18' height='14' rx='2'/%3E%3Cpath d='m3 7 9 6 9-6'/%3E%3C/svg%3E")}`;
  document.head.appendChild(st);

  const ti = t => `<div class="col-12"><h6 class="border-bottom pb-1 mt-2">${t}</h6></div>`;
  const pane = document.createElement("div");
  pane.className = "tab-pane fade"; pane.id = "tabOficio";
  pane.innerHTML = `
  <div class="row g-3">
    ${ti("Dados do ofício")}
    <div class="col-md-6"><label class="form-label">Tipo de solicitação</label>
      <select id="ofTipo" class="form-select" data-f>
        <option value="aee">Atendimento especializado (AEE)</option>
        <option value="apoio">Profissional de apoio</option>
      </select></div>
    <div class="col-md-3"><label class="form-label">Nº do ofício</label>
      <input id="ofNum" class="form-control" data-f placeholder="ex.: 012/2026"></div>
    <div class="col-md-3"><label class="form-label">Data</label>
      <input type="date" id="ofData" class="form-control" data-f></div>
    ${ti("Destinatário")}
    <div class="col-12"><label class="form-label">Nome do(a) Superintendente Regional de Educação</label>
      <input id="ofSuper" class="form-control" data-f>
      <div class="form-text">Já vem preenchido e pode ser alterado. O nome novo fica lembrado para os próximos ofícios.</div></div>
    ${ti("Atendimento solicitado")}
    <div class="col-12"><label class="form-label">Dias e horário (texto do ofício)</label>
      <input id="ofHor" class="form-control" data-f placeholder="Gerado a partir do Termo de Matrícula">
      <div class="form-text">Sugerido a partir dos dias e horários do Termo. Você pode editar; apague o campo para gerar de novo.</div></div>
    ${ti("Assinatura")}
    <div class="col-md-6"><label class="form-label">Quem assina</label>
      <select id="ofAssin" class="form-select" data-f>
        <option value="ped">Pedagogo(a)</option>
        <option value="dir">Diretor(a)</option>
      </select></div>
  </div>
  <button class="btn btn-success mt-3" onclick="pdfOficio()">Baixar PDF do Ofício</button>`;
  document.querySelector(".tab-content").appendChild(pane);

  // ============ SUGESTÃO DE DIAS E HORÁRIO (a partir do Termo) ============
  const fmt = t => {
    const m = /^(\d{1,2}):(\d{2})/.exec(t || "");
    return m ? parseInt(m[1], 10) + "h" + (m[2] === "00" ? "" : m[2]) : "";
  };
  function sugerir() {
    const dias = DIAS.filter(x => g("d" + x) && g("d" + x).checked);
    if (!dias.length) return "";
    const hs = dias.map(x => fmt(g("h" + x) && g("h" + x).value));
    if (hs.some(h => !h)) return "";
    if (hs.every(h => h === hs[0])) {
      const l = dias.map(x => NOMES[x] + "s");
      if (l.length === 1) return `na ${NOMES[dias[0]]}-feira, no horário das ${hs[0]}`;
      return `nas ${l.slice(0, -1).join(", ")} e ${l[l.length - 1]}-feiras, no horário das ${hs[0]}`;
    }
    return "nos seguintes dias e horários: " + dias.map((x, i) => `${NOMES[x]}-feira às ${hs[i]}`).join("; ");
  }
  function autoHorario() {
    const e = g("ofHor");
    if (!e.value.trim() || e.value === e.dataset.auto) {
      const s = sugerir();
      e.value = s; e.dataset.auto = s;
    }
  }
  document.querySelector('[data-bs-target="#tabOficio"]').addEventListener("shown.bs.tab", autoHorario);

  // ============ PADRÕES (superintendente lembrado, data de hoje) ============
  g("ofSuper").addEventListener("change", () => {
    const v = g("ofSuper").value.trim();
    if (!v) return;
    const p = ler(); p.superint = v; gravarP(p);
  });
  function padroes() {
    if (!g("ofSuper").value.trim()) g("ofSuper").value = ler().superint || SUPER_PADRAO;
    if (!g("ofData").value) g("ofData").value = hoje();
  }
  const origPreencher = window.preencher;
  window.preencher = function (o) { origPreencher(o); delete g("ofHor").dataset.auto; padroes(); };
  padroes();

  // ============ PDF ============
  // parágrafo justificado com trechos em negrito
  function paragrafo(doc, partes, x, y, w, lh) {
    const pal = [];
    partes.forEach(p => String(p.t).split(/\s+/).filter(Boolean).forEach(t => pal.push({ t, b: !!p.b })));
    const medir = p => { doc.setFont("helvetica", p.b ? "bold" : "normal"); return doc.getTextWidth(p.t); };
    pal.forEach(p => { p.w = medir(p); });
    doc.setFont("helvetica", "normal");
    const sp = doc.getTextWidth(" ");
    const linhas = []; let atual = [], larg = 0;
    pal.forEach(p => {
      const nova = atual.length ? larg + sp + p.w : p.w;
      if (nova > w && atual.length) { linhas.push(atual); atual = [p]; larg = p.w; }
      else { atual.push(p); larg = nova; }
    });
    if (atual.length) linhas.push(atual);
    linhas.forEach((ln, i) => {
      const soma = ln.reduce((s, p) => s + p.w, 0);
      const esp = (i < linhas.length - 1 && ln.length > 1) ? (w - soma) / (ln.length - 1) : sp;
      let cx = x;
      ln.forEach(p => { doc.setFont("helvetica", p.b ? "bold" : "normal"); doc.text(p.t, cx, y); cx += p.w + esp; });
      y += lh;
    });
    return y;
  }

  function dataExtenso(v) {
    if (!v) return "____ de ________________ de 20____";
    const [yy, mm, dd] = v.split("-");
    return `${dd} de ${MESES[+mm - 1]} de ${yy}`;
  }

  window.pdfOficio = async function () {
    const d = coletar();
    if (!d.nome.trim()) return alert("Informe o nome do(a) estudante no Cadastro.");

    // conferência (pode baixar assim mesmo)
    document.querySelectorAll(".is-invalid").forEach(e => e.classList.remove("is-invalid"));
    const assinaDir = d.ofAssin === "dir";
    const falta = [];
    [["escola", "unidade escolar"], ["ofNum", "nº do ofício"], ["ofData", "data do ofício"], ["ofSuper", "nome do(a) superintendente"],
     ["serie", "série/ano"], ["turno", "turno"], ["ensino", "ensino"], ["ofHor", "dias e horário"],
     [assinaDir ? "diretor" : "pedagoga", assinaDir ? "nome do(a) diretor(a)" : "nome do(a) pedagogo(a)"]]
      .forEach(([id, r]) => { if (!(g(id).value || "").trim()) { falta.push(r); g(id).classList.add("is-invalid"); } });
    if (falta.length && !confirm("Faltam: " + falta.join(", ") + ".\n\nBaixar o ofício assim mesmo?")) return;

    const brasao = await carregarBrasao();
    const doc = new window.jspdf.jsPDF({ unit: "mm", format: "a4" });
    const W = 210, M = 22, TW = W - 2 * M, escola = (d.escola || "").trim(), cidade = (d.cidade || "").trim();

    // cabeçalho
    if (brasao) { const w = 22, h = w * brasao.h / brasao.w; doc.addImage(brasao.data, "PNG", (W - w) / 2, 10, w, h); }
    doc.setFontSize(9); doc.setFont("helvetica", "normal");
    doc.text("GOVERNO DO ESTADO DO ESPÍRITO SANTO", W / 2, 33, { align: "center" });
    doc.text("SECRETARIA DE ESTADO DA EDUCAÇÃO", W / 2, 37.5, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.text(doc.splitTextToSize((escola || "UNIDADE ESCOLAR").toUpperCase(), TW), W / 2, 42, { align: "center" });

    // número, local e data
    let y = 62;
    doc.setFontSize(11);
    doc.text("Ofício Nº " + (d.ofNum.trim() || "________"), M, y); y += 9;
    doc.text(`${cidade || "____________________"}, ${dataExtenso(d.ofData)}`, W - M, y, { align: "right" }); y += 16;

    // remetente e destinatário
    const dir = doc.splitTextToSize("Da Direção da " + (escola || "____________________"), TW);
    doc.text(dir, M, y); y += dir.length * 5.6 + 1.5;
    const dest = doc.splitTextToSize(
      "Ao(À) Ilmo(a).: Superintendente Regional de Educação de Afonso Cláudio Sr(a). " + (d.ofSuper.trim() || "____________________"), TW);
    doc.text(dest, M, y); y += dest.length * 5.6 + 8;

    // corpo
    const serie = d.serie.trim() || "____";
    const noNa = /s[ée]rie/i.test(serie) ? "na" : "no";
    const ensino = { "Fundamental": "do Ensino Fundamental", "Médio": "do Ensino Médio", "EJA": "da Educação de Jovens e Adultos (EJA)" }[d.ensino] || "do ensino ________";
    const turno = (d.turno || "").toLowerCase() || "________";
    const tail = d.ofHor.trim() || "no horário das ____";
    const matricula = `, matriculado(a) ${noNa} ${serie} ${ensino}, turno ${turno}, para atendimento ${tail}.`;
    const base = `A Direção da ${escola || "____________________"}, vem por meio deste solicitar `;
    const partes = d.ofTipo === "apoio"
      ? [{ t: base + "disponibilização de " }, { t: "profissional de apoio", b: 1 },
         { t: " para atendimento às demandas do(a) estudante " + d.nome.trim() + matricula }]
      : [{ t: base + "o " }, { t: "atendimento especializado do AEE", b: 1 },
         { t: " para atender às demandas do(a) estudante " + d.nome.trim() + matricula }];
    doc.setFontSize(11);
    y = paragrafo(doc, partes, M, y, TW, 6.6) + 8;

    // fecho e assinatura
    doc.setFont("helvetica", "normal");
    doc.text("Atenciosamente,", M, y); y += 30;
    doc.line(W / 2 - 40, y, W / 2 + 40, y); y += 5;
    const quem = (assinaDir ? d.diretor : d.pedagoga).trim();
    if (quem) { doc.setFontSize(10); doc.text(quem, W / 2, y, { align: "center" }); y += 4.8; }
    doc.setFontSize(10);
    doc.text(assinaDir ? "Diretor(a)" : "Pedagogo(a)", W / 2, y, { align: "center" });

    // linha final
    doc.setLineWidth(0.3); doc.line(M, 278, W - M, 278);
    doc.setFontSize(8); doc.setTextColor(110);
    doc.text(`${escola.toUpperCase()}${cidade ? " · " + cidade + " – ES" : ""}`, W / 2, 282.5, { align: "center" });
    doc.setTextColor(0);

    doc.save(`Oficio_${d.ofTipo === "apoio" ? "apoio" : "AEE"}_${d.nome.trim().replace(/\s+/g, "_")}.pdf`);
  };
})();
