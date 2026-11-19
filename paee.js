(function () {
  const g = id => document.getElementById(id);

  // ---------- listas (conforme o formulário oficial) ----------
  const TIPOS = ["Deficiência Auditiva e Surdez","Deficiência Física","Deficiência Intelectual / TEA","Altas Habilidades / Superdotação",
    "Deficiência Múltipla","Deficiência Visual","Cegueira","Baixa Visão","Surdocegueira"];
  const RECS = ["Auxílio ledor (deficiência visual, intelectual e TEA).",
    "Auxílio transcrição (alunos impossibilitados de escrever ou preencher o cartão de respostas)",
    "CD/Mídia com áudio (aluno com deficiência visual)","Guia-intérprete (surdocegueira)",
    "Tradutor-intérprete de Libras (surdos e com deficiência auditiva sinalizantes)",
    "Leitura labial (com deficiência auditiva não sinalizantes / que não se comunicam por Libras)",
    "Prova ampliada - Fonte 18 (com baixa visão)","Prova superampliada - Fonte 24 (com baixa visão)",
    "CD com áudio (alunos com deficiência visual)",
    "Prova de Língua Portuguesa como Segunda Língua (surdos e deficiência auditiva sinalizantes)",
    "Prova em Vídeo Libras (surdos e com deficiência auditiva sinalizantes)",
    "Material didático e prova em Braille (cegos ou com baixa visão que utilizem o Sistema Braille)","Nenhum"];
  const AEE = ["Desenvolvimento de funções cognitivas","Desenvolvimento de vida autônoma","Enriquecimento curricular","Ensino da informática acessível",
    "Ensino da Língua Portuguesa como Segunda Língua","Ensino das técnicas de cálculo no Soroban","Ensino do Sistema Braille",
    "Ensino de técnicas de orientação e mobilidade","Ensino da comunicação alternativa e aumentativa","Ensino da Libras",
    "Ensino uso de recursos ópticos e não ópticos"];
  const AREAS = ["ÁREA DE LINGUAGENS (Língua Portuguesa; Artes; Educação Física; Língua Estrangeira)",
    "ÁREA DE CIÊNCIAS DA NATUREZA (Ciências; Biologia; Química; Física) e MATEMÁTICA",
    "ÁREA DE CIÊNCIAS HUMANAS (Filosofia; Sociologia; História; Geografia)"];
  const EDICOES = ["2. ANÁLISE DOS RESULTADOS DA AVALIAÇÃO DIAGNÓSTICA – 1ª Edição (início do 1º trimestre)",
    "3. ANÁLISE DOS RESULTADOS DA AVALIAÇÃO DIAGNÓSTICA – Última Edição (final do 3º trimestre ou do semestre - EJA)"];
  const PLANO = ["4.2. ÁREA DE LINGUAGENS (Língua Portuguesa; Artes; Educação Física; Língua Estrangeira)","4.3. MATEMÁTICA",
    "4.4. ÁREA DE CIÊNCIAS DA NATUREZA (Ciências; Biologia; Química; Física)","4.5. ÁREA DE CIÊNCIAS HUMANAS (Filosofia; Sociologia; História; Geografia)"];
  const PERIODOS = ["1º Trimestre","2º Trimestre","3º Trimestre","1º Semestre","2º Semestre"];

  // ---------- construtores de HTML ----------
  const ck = (id, l) => `<div class="form-check"><input class="form-check-input" type="checkbox" id="${id}" data-f><label class="form-check-label" for="${id}">${l}</label></div>`;
  const ckList = (p, a, cols) => `<div class="col-12"><div class="row">${a.map((l, i) => `<div class="col-md-${12 / cols}">${ck(p + i, l)}</div>`).join("")}</div></div>`;
  const area = (id, l, c = "col-12", r = 3) => `<div class="${c}"><label class="form-label">${l}</label><textarea id="${id}" class="form-control" rows="${r}" data-f></textarea></div>`;
  const ti = t => `<div class="col-12"><h6 class="border-bottom pb-1 mt-2">${t}</h6></div>`;

  // ---------- aba ----------
  const btn = [...document.querySelectorAll(".nav-link")].find(b => b.textContent.trim() === "PAEE");
  btn.classList.remove("disabled");
  btn.setAttribute("data-bs-toggle", "tab");
  btn.setAttribute("data-bs-target", "#tabPaee");

  const pane = document.createElement("div");
  pane.className = "tab-pane fade"; pane.id = "tabPaee";
  pane.innerHTML = `
  <div class="row g-3">
    <div class="col-md-4"><label class="form-label">Período</label>
      <select id="pPeriodo" class="form-select" data-f><option value="">—</option>${PERIODOS.map(p => `<option>${p}</option>`).join("")}</select></div>
    <div class="col-md-4"><label class="form-label">Data de elaboração</label><input type="date" id="pData" class="form-control" data-f></div>
    ${ti("1. Organização do atendimento (Censo Escolar)")}
    ${ti("1.1. Tipo de deficiência / indicação ao AEE")}
    ${ckList("pT", TIPOS, 2)}
    <div class="col-md-4"><label class="form-label">1.2. Composição do atendimento</label>
      <select id="pComp" class="form-select" data-f><option value="">—</option><option>Individual</option><option>Em grupo</option></select></div>
    ${ti("1.3. Recursos para uso do aluno em sala de aula e nas avaliações do INEP")}
    ${ckList("pR", RECS, 1)}
    ${ti("1.4. Atendimento Educacional Especializado (AEE)")}
    ${ckList("pA", AEE, 2)}
    ${ti("1.4.1. Atividades a serem realizadas ao longo do trimestre na sala de recursos")}
    ${area("pObj", "Objetivos")}
    ${area("pAtiv", "Atividades a serem desenvolvidas (consultar item 1.4.)")}
    ${area("pRec", "Recursos a serem utilizados")}
    ${area("pAval", "Avaliação")}
    ${EDICOES.map((t, e) => ti(t) + AREAS.map((a, i) =>
      `<div class="col-12"><small class="fw-bold">${a}</small></div>` +
      area(`pAn${e}0${i}`, "Aprendizagens consolidadas (descritores/habilidades)", "col-md-6") +
      area(`pAn${e}1${i}`, "Aprendizagens não consolidadas (descritores/habilidades)", "col-md-6")).join("")).join("")}
    ${ti("4. Plano de trabalho")}
    ${area("pDesc", "4.1. Descrição do processo de ensino-aprendizagem")}
    ${PLANO.map((t, i) => `<div class="col-12"><small class="fw-bold">${t}</small></div>` +
      area(`pPl${i}0`, "Objetos de conhecimento (conteúdo)", "col-md-4") +
      area(`pPl${i}1`, "Metodologia e recursos", "col-md-4") +
      area(`pPl${i}2`, "Avaliação", "col-md-4")).join("")}
  </div>
  <button class="btn btn-success mt-3" onclick="pdfPaee()">Baixar PDF do PAEE</button>`;
  document.querySelector(".tab-content").appendChild(pane);

  // ---------- barra com quebra de linha (vale para todos os documentos) ----------
  window.barra = function (P, t) {
    const doc = P.doc;
    doc.setFont("helvetica", "bold"); doc.setFontSize(9.5);
    const l = doc.splitTextToSize(t, P.TW - 4), h = l.length * 4.4 + 2;
    need(P, h + 2);
    doc.setFillColor(220, 230, 241); doc.rect(P.M, P.y, P.TW, h, "FD");
    doc.text(l, P.W / 2, P.y + 4.3, { align: "center" });
    P.y += h + 2;
  };

  // ---------- helpers de PDF ----------
  function caixa(P, titulo, texto, min) {
    const doc = P.doc;
    doc.setFont("helvetica", "normal"); doc.setFontSize(9.5);
    const l = doc.splitTextToSize(texto || "", P.TW - 4), h = Math.max(min, 10 + l.length * 4.6);
    need(P, h);
    doc.rect(P.M, P.y, P.TW, h);
    doc.setFont("helvetica", "bold"); doc.text(titulo, P.M + 2, P.y + 4.5);
    doc.setFont("helvetica", "normal"); doc.text(l, P.M + 2, P.y + 9.5);
    P.y += h;
  }
  function cabecaDupla(P) {
    const doc = P.doc, w = P.TW / 2; need(P, 12);
    ["Aprendizagens consolidadas\n(Descritores/Habilidades)", "Aprendizagens não consolidadas\n(Descritores/Habilidades)"].forEach((t, k) => {
      doc.rect(P.M + k * w, P.y, w, 11);
      doc.setFont("helvetica", "bold"); doc.setFontSize(9.5);
      doc.text(t.split("\n"), P.M + k * w + w / 2, P.y + 4.5, { align: "center" });
    });
    P.y += 11;
  }
  function dupla(P, titulo, a, b, min) {
    const doc = P.doc, w = P.TW / 2;
    doc.setFont("helvetica", "bold"); doc.setFontSize(8.5);
    const tl = doc.splitTextToSize(titulo, w - 4), th = tl.length * 3.8 + 3;
    doc.setFont("helvetica", "normal"); doc.setFontSize(9.5);
    const la = doc.splitTextToSize(a || "", w - 4), lb = doc.splitTextToSize(b || "", w - 4);
    const h = Math.max(min, th + Math.max(la.length, lb.length) * 4.6 + 3);
    need(P, h);
    [[0, la], [1, lb]].forEach(([k, l]) => {
      const x = P.M + k * w;
      doc.rect(x, P.y, w, h);
      doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.text(tl, x + 2, P.y + 4);
      doc.setFont("helvetica", "normal"); doc.setFontSize(9.5); doc.text(l, x + 2, P.y + th + 3.5);
    });
    P.y += h;
  }

  // ---------- PDF ----------
  window.pdfPaee = async function () {
    const d = coletar();
    if (!d.nome.trim()) return alert("Preencha o cadastro do estudante.");
    const ah = d.tipoAtend === "AH/SD";
    const P = novoPdf(await carregarBrasao());

    barra(P, "PLANO DE ATENDIMENTO EDUCACIONAL ESPECIALIZADO - PAEE");
    txt(P, "Unidade Escolar: " + d.escola);
    txt(P, "Nome do estudante: " + d.nome);
    const per = x => marca(d.pPeriodo === x);
    txt(P, `Série/Turma: ${d.serie} ${d.turma}     Trimestre: 1º ${per("1º Trimestre")}  2º ${per("2º Trimestre")}  3º ${per("3º Trimestre")}     Semestre: 1º ${per("1º Semestre")}  2º ${per("2º Semestre")}`);
    txt(P, "Professor Especializado: " + d.prof);
    txt(P, `Pedagoga: ${d.pedagoga}     Data de elaboração: ${fmtData(d.pData)}`);

    barra(P, "1. ORGANIZAÇÃO DO ATENDIMENTO (CENSO ESCOLAR)");
    txt(P, "1.1. Tipo de Deficiência / Indicação ao AEE (coletados no Censo Escolar)");
    checks(P, TIPOS, i => d["pT" + i] || (ah && i === 3), 2);
    txt(P, `1.2. Composição do Atendimento:   ${marca(d.pComp === "Individual")} Individual     ${marca(d.pComp === "Em grupo")} Em grupo`);
    txt(P, "1.3. Recursos para uso do aluno em sala de aula e nas avaliações do INEP");
    checks(P, RECS, i => d["pR" + i], 1);
    txt(P, "1.4. ATENDIMENTO EDUCACIONAL ESPECIALIZADO (AEE)");
    checks(P, AEE, i => d["pA" + i], 2);
    barra(P, "1.4.1. ATIVIDADES A SEREM REALIZADAS AO LONGO DO TRIMESTRE NA SALA DE RECURSOS");
    caixa(P, "Objetivos:", d.pObj, 22);
    caixa(P, "Atividades a serem desenvolvidas (consultar item 1.4.):", d.pAtiv, 22);
    caixa(P, "Recursos a serem utilizados:", d.pRec, 22);
    caixa(P, "Avaliação:", d.pAval, 22);

    EDICOES.forEach((t, e) => {
      barra(P, t);
      cabecaDupla(P);
      AREAS.forEach((a, i) => dupla(P, a, d[`pAn${e}0${i}`], d[`pAn${e}1${i}`], 45));
    });

    barra(P, "4. PLANO DE TRABALHO");
    caixa(P, "4.1. Descrição do Processo de Ensino-Aprendizagem", d.pDesc, 28);
    PLANO.forEach((t, i) => {
      barra(P, t);
      caixa(P, "Objetos de conhecimento (conteúdo)", d[`pPl${i}0`], 24);
      caixa(P, "Metodologia e Recursos", d[`pPl${i}1`], 24);
      caixa(P, "Avaliação", d[`pPl${i}2`], 24);
    });

    need(P, 30);
    barra(P, "5. ASSINATURAS:");
    ["Professor/a especializado/a", "Pedagogo/a", "Diretor/a"]
      .forEach(n => txt(P, n + ": ______________________________________________________________"));

    P.doc.save(`PAEE_${d.nome.replace(/\s+/g, "_")}.pdf`);
  };
})();
