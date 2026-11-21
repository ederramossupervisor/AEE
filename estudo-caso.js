(function () {
  const g = id => document.getElementById(id);

  // ---------- listas (conforme o formulário oficial) ----------
  const FALA = ["Atende quando chamado","Responde a comando simples","Reconta histórias","Transmite recados",
    "Participa na roda da conversa","Apresenta repertório de fala adequado à idade","Relata fatos/acontecimentos do dia a dia",
    "Descreve imagens, objetos e pessoas","Narra fatos e histórias","Faz perguntas oportunas","Argumenta com coerência no discurso",
    "Usa linguagem verbal para expressar desejos, necessidades e sentimentos","Participa de interações verbais em sala, respeitando turnos de fala"];
  const ESC = ["Apresenta acessibilidade arquitetônica?","As salas de aula possuem mobiliário adequado?","Há interação com a família?"];
  const RH = ["Instrutor de Libras","Intérprete de Libras","Profissional de apoio (cuidador)","Professor especializado em DI",
    "Professor especializado em DA","Professor especializado em DV","Professor especializado em AH/SD","Professor especializado em surdocegueira"];
  const AREAS = ["Códigos e linguagens e suas tecnologias","Ciências da natureza, matemática e suas tecnologias","Ciências humanas e sociais aplicadas"];
  const COMP = ["Isola-se.","Estranha mudança de ambiente.","Adapta-se facilmente ao meio.","Aceita bem ordens.",
    "Apresenta agressividade, apatia ou teimosia.","Estereotipia.","Apresenta sensibilidade sonora.","Apresenta sensibilidade à iluminação.",
    "Tem afinidade com determinado colega da sala de aula."];
  const POS = ["Na primeira fileira.","Na fileira intermediária.","Na última fila.","Próximo à janela.","Próximo à porta."];
  const HI = ["Habilidade de lidar com abstrações.","Facilidade para lembrar informações.","Vocabulário avançado para idade ou série.",
    "Facilidade em perceber relações de causa e efeito.","Habilidade de fazer observações perspicazes e sutis.","Grande bagagem sobre um tópico específico.",
    "Habilidade de entender princípios não diretamente observados.","Grande bagagem de informações sobre uma variedade de tópicos.",
    "Habilidade para aplicar aprendizagens de uma situação para a outra.","Habilidade de fazer generalizações."];
  const CR = ["Senso de humor.","Habilidade de pensamento imaginativo.","Atitude não conformista.",
    "Pensamento divergente, não linear. Aquele que explora várias opções e tenta diferentes possibilidades para a resolução de um problema ou questões.",
    "Habilidade de adaptar, melhorar ou modificar ideias.","Habilidade para produzir respostas incomuns, únicas ou inteligentes.",
    "Disposição para fantasiar, brincar e manipular ideias."];
  const MO = ["Persistência quando se busca atingir um objetivo ou na realização de tarefas.","Interesse constante por certos tópicos ou problemas.",
    "Autonomia no processo de aprendizagem.","Envolvimento intenso quando trabalha certos temas ou problemas.",
    "Persistência em procurar informações sobre tópicos de seu interesse.","Compromisso com projetos de longa duração.",
    "Pouca necessidade de motivação externa para finalizar um trabalho que inicialmente se mostrou estimulante."];
  const LI = ["Autoconfiança quando interage com colegas da sua idade.","Comportamento cooperativo ao trabalhar com os outros.",
    "Habilidade de articular ideias e de se comunicar bem com os outros.","Habilidade de organizar e trazer estrutura a coisas, pessoas e situações.",
    "Tendência a dirigir as atividades quando está envolvido com outras pessoas.","Compromisso."];

  // ---------- construtores de HTML ----------
  const ck = (id, l) => `<div class="form-check"><input class="form-check-input" type="checkbox" id="${id}" data-f><label class="form-check-label" for="${id}">${l}</label></div>`;
  const ckList = (p, a, cols = 1) => `<div class="col-12"><div class="row">${a.map((l, i) => `<div class="col-md-${12 / cols}">${ck(p + i, l)}</div>`).join("")}</div></div>`;
  const area = (id, l, r = 3) => `<div class="col-12"><label class="form-label">${l}</label><textarea id="${id}" class="form-control" rows="${r}" data-f></textarea></div>`;
  const dt = (id, l) => `<div class="col-md-6"><label class="form-label">${l}</label><input type="date" id="${id}" class="form-control" data-f></div>`;
  const sl = (id, l, o) => `<div class="col-md-6"><label class="form-label small mb-0">${l}</label><select id="${id}" class="form-select form-select-sm" data-f><option value="">—</option>${o.map(x => `<option>${x}</option>`).join("")}</select></div>`;
  const ti = t => `<div class="col-12"><h6 class="border-bottom pb-1 mt-2">${t}</h6></div>`;

  // ---------- aba ----------
  const btn = [...document.querySelectorAll(".nav-link")].find(b => b.textContent.trim() === "Estudo de caso");
  btn.classList.remove("disabled");
  btn.setAttribute("data-bs-toggle", "tab");
  btn.setAttribute("data-bs-target", "#tabEstudo");

  const pane = document.createElement("div");
  pane.className = "tab-pane fade"; pane.id = "tabEstudo";
  pane.innerHTML = `
  <div class="row g-3">
    ${dt("ecEnc", "Data do encaminhamento")}${dt("ecInicio", "Início do atendimento")}
    ${ti("Instrumento de suporte ao estudo de caso")}
    <div class="col-12">
      <label class="form-label">Foto do estudante</label>
      <div class="d-flex align-items-center gap-3">
        <img id="ecFotoImg" style="display:none;max-height:110px" class="border rounded">
        <div>
          <input type="file" id="ecFotoIn" accept="image/*" class="form-control form-control-sm">
          <button type="button" class="btn btn-sm btn-outline-danger mt-1" id="ecFotoRem">Remover foto</button>
        </div>
        <input type="hidden" id="ecFoto" data-f>
      </div>
    </div>
    ${area("ecSobre", "Sobre mim")}
    ${area("ecGosto", "O que eu gosto")}
    ${area("ecIncomoda", "Coisas que me incomodam")}
    ${area("ecEspera", "O que eu espero para este ano letivo")}
    ${area("ecTalentos", "Os meus talentos")}

    <div id="ecReg" class="col-12"><div class="row g-3">
      ${ti("Informações gerais")}
      ${ti("1. Sistema linguístico utilizado pelo estudante (comunicação)")}
      <div class="col-12"><label class="form-label d-block">1.1. Se expressa por meio de linguagem verbal</label>
        <div class="d-flex gap-3">${ck("ecP0", "Palavras")}${ck("ecP1", "Frases")}${ck("ecP2", "Diálogo")}</div></div>
      ${FALA.map((l, i) => sl("ecS" + i, `1.${i + 2}. ${l}`, ["Sim", "Não", "Algumas vezes"])).join("")}
      ${ti("2. Em relação à organização da escola")}
      ${ESC.map((l, i) => sl("ecE" + i, `2.${i + 1}. ${l}`, ["Sim", "Não"])).join("")}
      <div class="col-12"><label class="form-label d-block">2.4. Quanto aos recursos humanos</label></div>
      ${ckList("ecR", RH, 2)}
      ${ti("3. Percepção da equipe pedagógica (habilidades consolidadas)")}
      ${AREAS.map((l, i) => area("ecA" + i, `3.${i + 1}. ${l}`)).join("")}
      ${ti("4. Interação social – 4.1. Comportamento")}
      ${ckList("ecC", COMP, 1)}
      <div class="col-12"><label class="form-label">Outras questões</label><input id="ecCo" class="form-control" data-f></div>
      ${ti("5. Posicionamento em sala de aula – 5.1. O estudante posiciona-se")}
      ${ckList("ecO", POS, 2)}
    </div></div>

    <div id="ecAH" class="col-12" style="display:none"><div class="row g-3">
      ${ti("Informações gerais")}
      ${ti("1. Habilidade intelectual")}${ckList("ecH", HI)}
      ${ti("2. Criatividade")}${ckList("ecK", CR)}
      ${ti("3. Motivação")}${ckList("ecM", MO)}
      ${ti("4. Liderança")}${ckList("ecL", LI)}
    </div></div>

    ${ti("Relatório pedagógico e observações")}
    ${area("ecRel", "Relatório pedagógico", 8)}
    ${area("ecObs", "Outras observações", 3)}
  </div>
  <button class="btn btn-success mt-3" onclick="pdfEstudo()">Baixar PDF do Estudo de caso</button>`;
  document.querySelector(".tab-content").appendChild(pane);

  // ---------- foto ----------
  function fotoUI() {
    const v = g("ecFoto").value, im = g("ecFotoImg");
    im.src = v || ""; im.style.display = v ? "" : "none";
  }
  g("ecFotoIn").onchange = e => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      const im = new Image();
      im.onload = () => {
        const k = Math.min(1, 400 / Math.max(im.width, im.height));
        const c = document.createElement("canvas");
        c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
        c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
        g("ecFoto").value = c.toDataURL("image/jpeg", 0.8);
        fotoUI(); g("ecFotoIn").value = "";
      };
      im.src = r.result;
    };
    r.readAsDataURL(f);
  };
  g("ecFotoRem").onclick = () => { g("ecFoto").value = ""; fotoUI(); };

  // ---------- alterna Regular / AH-SD ----------
  function toggle() {
    const ah = g("tipoAtend").value === "AH/SD";
    g("ecReg").style.display = ah ? "none" : "";
    g("ecAH").style.display = ah ? "" : "none";
  }
  const preOrig = window.preencher;
  window.preencher = function (o) { preOrig(o); fotoUI(); toggle(); };
  const tipoOrig = window.aoMudarTipo;
  window.aoMudarTipo = function () { tipoOrig(); toggle(); };
  toggle();

  // ---------- PDF ----------
  const opt3 = v => ["Sim", "Não", "Algumas vezes"].map(o => `${v === o ? "( X )" : "(    )"} ${o}`).join("   ");
  const opt2 = v => ["Sim", "Não"].map(o => `${v === o ? "( X )" : "(    )"} ${o}`).join("   ");

  function medir(P, w, texto, min) {
    P.doc.setFont("helvetica", "normal"); P.doc.setFontSize(9.5);
    const l = window.linhasJ(P.doc, texto, w - 4);
    return { l, h: Math.max(min, 10 + l.length * 4.6) };
  }
  function quadro(P, x, y, w, h, titulo, linhas) {
    const doc = P.doc;
    doc.rect(x, y, w, h);
    doc.setFont("helvetica", "bold"); doc.setFontSize(9.5); doc.text(titulo, x + 2, y + 4.5);
    doc.setFont("helvetica", "normal"); window.desenhaJ(doc, linhas, x + 2, y + 9.5, w - 4);
  }
  function quadroInteiro(P, titulo, texto, min) {
    const m = medir(P, P.TW, texto, min);
    need(P, m.h); quadro(P, P.M, P.y, P.TW, m.h, titulo, m.l); P.y += m.h;
  }
  function pagina(P) { P.doc.addPage(); P.y = cabecalho(P.doc, P.brasao) + 2; }

  window.pdfEstudo = async function () {
    const d = coletar();
    if (!d.nome.trim()) return alert("Preencha o cadastro do estudante.");
    const ah = d.tipoAtend === "AH/SD";
    const P = novoPdf(await carregarBrasao()), doc = P.doc;

    // --- página 1 ---
    barra(P, ah ? "ESTUDO DE CASO – AH/SD" : "ESTUDO DE CASO");
    txt(P, "Unidade escolar: " + d.escola);
    txt(P, "Nome do estudante: " + d.nome);
    txt(P, `ID: ${d.idAluno}     Turma/Série/Ano: ${d.turma} / ${d.serie}     Data de nascimento: ${fmtData(d.nasc)}`);
    txt(P, "Professor especializado: " + d.prof);
    txt(P, `Data do encaminhamento: ${fmtData(d.ecEnc)}     Início do atendimento: ${fmtData(d.ecInicio)}`);
    barra(P, "INSTRUMENTO DE SUPORTE AO ESTUDO DE CASO:");

    const wS = P.TW - 45, mS = medir(P, wS, d.ecSobre, 60);
    need(P, mS.h);
    const x = P.M, y = P.y;
    doc.rect(x, y, 45, mS.h);
    doc.setFont("helvetica", "normal"); doc.setFontSize(9.5); doc.text("Foto:", x + 2, y + 4.5);
    if (d.ecFoto) {
      try {
        const pr = doc.getImageProperties(d.ecFoto);
        let iw = 41, ih = iw * pr.height / pr.width;
        if (ih > mS.h - 10) { ih = mS.h - 10; iw = ih * pr.width / pr.height; }
        doc.addImage(d.ecFoto, "JPEG", x + 2 + (41 - iw) / 2, y + 7, iw, ih);
      } catch (e) { /* segue sem foto */ }
    }
    quadro(P, x + 45, y, wS, mS.h, "Sobre mim:", mS.l);
    P.y += mS.h;

    quadroInteiro(P, "O que eu gosto:", d.ecGosto, 38);
    quadroInteiro(P, "Coisas que me incomodam:", d.ecIncomoda, 38);

    const w2 = P.TW / 2, m1 = medir(P, w2, d.ecEspera, 40), m2 = medir(P, w2, d.ecTalentos, 40), h2 = Math.max(m1.h, m2.h);
    need(P, h2);
    quadro(P, P.M, P.y, w2, h2, "O que eu espero para este ano letivo:", m1.l);
    quadro(P, P.M + w2, P.y, w2, h2, "Os meus talentos:", m2.l);
    P.y += h2;
    doc.setFont("helvetica", "normal"); doc.setFontSize(8);
    doc.text("Adaptação do documento de Mário Pereira (coord.) (2017). Pertencer & Participar para Aprender. Edição ASSOL", P.M, P.y + 4);

    // --- páginas seguintes ---
    pagina(P);
    barra(P, "INFORMAÇÕES GERAIS:");
    if (!ah) {
      barra(P, "1. SISTEMA LINGUÍSTICO UTILIZADO PELO ESTUDANTE (COMUNICAÇÃO):");
      txt(P, `1.1. Se expressa por meio de linguagem verbal:   ${marca(d.ecP0)} Palavras   ${marca(d.ecP1)} Frases   ${marca(d.ecP2)} Diálogo`);
      FALA.forEach((l, i) => txt(P, `1.${i + 2}. ${l}:  ${opt3(d["ecS" + i])}`));
      barra(P, "2. EM RELAÇÃO À ORGANIZAÇÃO DA ESCOLA:");
      ESC.forEach((l, i) => txt(P, `2.${i + 1}. ${l}  ${opt2(d["ecE" + i])}`));
      txt(P, "2.4. Quanto aos recursos humanos:");
      checks(P, RH, i => d["ecR" + i], 2);
      barra(P, "3. PERCEPÇÃO DA EQUIPE PEDAGÓGICA EM RELAÇÃO AO DESENVOLVIMENTO DO ESTUDANTE NAS ÁREAS DE CONHECIMENTO");
      AREAS.forEach((l, i) => txt(P, `3.${i + 1}. ${l} (habilidades consolidadas pelo estudante):\n${d["ecA" + i] || ""}\n`));
      barra(P, "4. INTERAÇÃO SOCIAL");
      txt(P, "4.1. Comportamento:");
      checks(P, [...COMP, "Outras questões: " + d.ecCo], i => i < COMP.length ? d["ecC" + i] : !!d.ecCo, 1);
      barra(P, "5. POSICIONAMENTO EM SALA DE AULA");
      txt(P, "5.1. Na sala de aula o estudante posiciona-se:");
      checks(P, POS, i => d["ecO" + i], 2);
      barra(P, "6. RELATÓRIO PEDAGÓGICO:");
      txt(P, d.ecRel || "\n\n\n");
      barra(P, "7. OUTRAS OBSERVAÇÕES:");
      txt(P, d.ecObs || "\n\n");
      need(P, 30); barra(P, "8. ASSINATURAS:");
    } else {
      [["1. HABILIDADE INTELECTUAL", HI, "ecH"], ["2. CRIATIVIDADE", CR, "ecK"], ["3. MOTIVAÇÃO", MO, "ecM"], ["4. LIDERANÇA", LI, "ecL"]]
        .forEach(([t, arr, p]) => { barra(P, t); checks(P, arr, i => d[p + i], 1); });
      barra(P, "5. RELATÓRIO PEDAGÓGICO:");
      txt(P, d.ecRel || "\n\n\n");
      barra(P, "6. OUTRAS OBSERVAÇÕES:");
      txt(P, d.ecObs || "\n\n");
      need(P, 30); barra(P, "7. ASSINATURAS:");
    }
    ["CP ou Pedagogo", "Professor Especializado", "Pais ou Responsável legal"]
      .forEach(n => txt(P, n + ": ______________________________________________________________"));

    doc.save(`Estudo_de_caso_${d.nome.replace(/\s+/g, "_")}.pdf`);
  };
})();
