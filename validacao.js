(function () {
  const g = id => document.getElementById(id);
  const v = id => { const e = g(id); return e ? (e.value || "").trim() : ""; };
  const ch = id => { const e = g(id); return !!(e && e.checked); };
  const seq = (p, n) => Array.from({ length: n }, (_, i) => p + i);
  const algum = (p, n) => seq(p, n).some(ch);
  const norm = s => (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
  const DIAS_FUTURO = 30; // limite para "data futura demais" (item 56)

  // Turno e Ensino passam a começar vazios, para a validação fazer sentido
  ["turno", "ensino"].forEach(id => {
    const s = g(id);
    if (!s.querySelector('option[value=""]')) s.insertAdjacentHTML("afterbegin", '<option value="">Selecione...</option>');
    if (!atualId) s.value = "";
  });

  // ============ REGRAS ============
  function levantar(chaves) {
    const L = [];
    const add = (grupo, msg, ids, nivel = "erro", bloq = false) => L.push({ grupo, msg, ids, nivel, bloq });
    const exige = (grupo, id, msg) => { if (!v(id)) add(grupo, msg, [id]); };
    const ah = v("tipoAtend") === "AH/SD";
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    const limite = new Date(hoje.getTime() + DIAS_FUTURO * 864e5);
    const dia = s => new Date(s + "T00:00:00");
    const data = (grupo, id, rot) => {
      const s = v(id); if (!s) return;
      if (v("nasc") && s < v("nasc")) add(grupo, `${rot} é anterior à data de nascimento.`, [id], "aviso");
      else if (dia(s) > limite) add(grupo, `${rot} está mais de ${DIAS_FUTURO} dias no futuro.`, [id], "aviso");
    };

    // ---- Cadastro (vale para todos os documentos) ----
    const C = "Cadastro do estudante";
    if (!v("nome")) add(C, "Informe o nome do estudante.", ["nome"], "erro", true);
    exige(C, "escola", "Selecione a unidade escolar.");
    exige(C, "idAluno", "Informe o ID do estudante.");
    if (!v("nasc")) add(C, "Informe a data de nascimento.", ["nasc"]);
    else if (dia(v("nasc")) > hoje) add(C, "A data de nascimento não pode ser futura.", ["nasc"]);
    exige(C, "serie", "Informe a série/ano.");
    exige(C, "turma", "Informe a turma.");
    exige(C, "turno", "Selecione o turno.");
    exige(C, "ensino", "Selecione o ensino (Fundamental, Médio ou EJA).");
    if (!/^\d{4}$/.test(v("anoLetivo"))) add(C, "Informe o ano letivo com 4 dígitos (ex.: 2026).", ["anoLetivo"]);
    exige(C, "prof", "Informe o(a) professor(a) especializado(a).");
    exige(C, "pedagoga", "Informe o(a) pedagogo(a).");
    exige(C, "diretor", "Informe o(a) diretor(a).");

    // ---- Informações iniciais ----
    if (chaves.includes("info")) {
      const G = "Informações iniciais";
      if (!ah) {
        exige(G, "indicacao", "Informe a indicação ao AEE.");
        if (!algum("def", 9)) add(G, "Marque ao menos um tipo de deficiência/indicação (Censo Escolar).", seq("def", 9));
        if (!v("diag")) add(G, "Responda se há diagnóstico clínico.", ["diag"]);
        else if (v("diag") === "Sim") exige(G, "diagRes", "Informe o resultado do diagnóstico clínico (CID).");
        if (!v("alim")) add(G, "Responda se precisa de alimentação diferenciada.", ["alim"]);
        else if (v("alim") === "Sim") exige(G, "alimQual", "Informe qual alimentação diferenciada.");
        if (!v("transp")) add(G, "Responda se precisa de transporte escolar.", ["transp"]);
        if (!v("apoio")) add(G, "Responda se precisa de profissional de apoio escolar (cuidador(a)).", ["apoio"]);
      } else {
        if (!algum("ind", 5)) add(G, "Marque como o(a) estudante foi indicado(a).", seq("ind", 5));
        if (!algum("car", 19)) add(G, "Marque ao menos uma característica apontada pelos(as) professores(as).", seq("car", 19));
        exige(G, "ah1", "Preencha a pergunta 1 (outros interesses especiais).");
        exige(G, "ah2", "Preencha a pergunta 2 (características marcantes).");
        exige(G, "ah3", "Preencha a pergunta 3 (talentos mencionados pela família).");
      }
      exige(G, "dataInfo", "Informe a data das Informações iniciais.");
      data(G, "dataInfo", "A data das Informações iniciais");
    }

    // ---- Estudo de caso ----
    if (chaves.includes("estudo")) {
      const E = "Estudo de caso";
      exige(E, "ecEnc", "Informe a data do encaminhamento.");
      exige(E, "ecInicio", "Informe o início do atendimento.");
      if (v("ecEnc") && v("ecInicio") && v("ecInicio") < v("ecEnc"))
        add(E, "O início do atendimento não pode ser anterior ao encaminhamento.", ["ecInicio"]);
      data(E, "ecEnc", "A data do encaminhamento");
      data(E, "ecInicio", "O início do atendimento");
      if (!v("ecFoto")) add(E, "Inclua a foto do estudante.", ["ecFotoIn"]);
      [["ecSobre", "Sobre mim"], ["ecGosto", "O que eu gosto"], ["ecIncomoda", "Coisas que me incomodam"],
       ["ecEspera", "O que eu espero para este ano letivo"], ["ecTalentos", "Os meus talentos"]]
        .forEach(([id, r]) => exige(E, id, `Preencha "${r}".`));
      if (!ah) {
        if (!algum("ecP", 3)) add(E, "Marque como o(a) estudante se expressa (palavras, frases ou diálogo).", seq("ecP", 3));
        const fs = seq("ecS", 13).filter(i => !v(i));
        if (fs.length) add(E, `Responda os itens 1.2 a 1.14 da comunicação (faltam ${fs.length}).`, fs);
        const es = seq("ecE", 3).filter(i => !v(i));
        if (es.length) add(E, `Responda os itens 2.1 a 2.3 da organização da escola (faltam ${es.length}).`, es);
        ["Códigos e linguagens", "Ciências da natureza e matemática", "Ciências humanas e sociais"]
          .forEach((n, i) => exige(E, "ecA" + i, `Descreva as habilidades consolidadas em ${n} (item 3.${i + 1}).`));
        if (!algum("ecC", 9)) add(E, "Marque ao menos um comportamento (item 4.1).", seq("ecC", 9));
        if (!algum("ecO", 5)) add(E, "Marque o posicionamento em sala de aula (item 5.1).", seq("ecO", 5));
      } else {
        [["ecH", 10, "Habilidade intelectual"], ["ecK", 7, "Criatividade"], ["ecM", 7, "Motivação"], ["ecL", 6, "Liderança"]]
          .forEach(([p, n, r]) => { if (!algum(p, n)) add(E, `Marque ao menos uma habilidade em "${r}".`, seq(p, n)); });
      }
      exige(E, "ecRel", "Preencha o relatório pedagógico.");
    }

    // ---- PAEE ----
    if (chaves.includes("paee")) {
      const A = "PAEE";
      exige(A, "pPeriodo", "Selecione o período (trimestre ou semestre).");
      exige(A, "pData", "Informe a data de elaboração.");
      data(A, "pData", "A data de elaboração");
      if (!ah && !algum("pT", 9)) add(A, "Marque o tipo de deficiência/indicação (item 1.1).", seq("pT", 9));
      exige(A, "pComp", "Selecione a composição do atendimento (individual ou em grupo).");
      if (!algum("pR", 13)) add(A, 'Marque ao menos um recurso do item 1.3 (ou "Nenhum").', seq("pR", 13));
      if (!algum("pA", 11)) add(A, "Marque ao menos uma modalidade de AEE (item 1.4).", seq("pA", 11));
      [["pObj", "Objetivos"], ["pAtiv", "Atividades a serem desenvolvidas"], ["pRec", "Recursos a serem utilizados"], ["pAval", "Avaliação"]]
        .forEach(([id, r]) => exige(A, id, `Preencha "${r}" (item 1.4.1).`));
      const an = [0, 1].flatMap(e => [0, 1].flatMap(c => [0, 1, 2].map(i => `pAn${e}${c}${i}`)));
      if (an.every(i => !v(i))) add(A, "Preencha a análise da avaliação diagnóstica (1ª edição e/ou última edição).", an.slice(0, 6));
      exige(A, "pDesc", "Preencha a descrição do processo de ensino-aprendizagem (4.1).");
      const areas = ["Linguagens", "Matemática", "Ciências da natureza", "Ciências humanas"];
      const cols = ["conteúdo", "metodologia e recursos", "avaliação"];
      areas.forEach((n, i) => cols.forEach((c, j) => exige(A, `pPl${i}${j}`, `Plano de trabalho – ${n}: preencha ${c}.`)));
    }

    // ---- Termo ----
    if (chaves.includes("termo")) {
      const T = "Termo de Matrícula";
      exige(T, "responsavel", "Informe o nome do(a) responsável.");
      if (v("opcaoTermo") === "aceita") {
        const dias = ["dSEG", "dTER", "dQUA", "dQUI", "dSEX"];
        if (!dias.some(ch)) add(T, "Marque ao menos um dia da semana para o AEE.", dias);
        exige(T, "horario", "Informe o horário do atendimento.");
      } else exige(T, "motivo", "Informe os motivos da dispensa.");
      exige(T, "cidadeAssin", "Informe a cidade da assinatura.");
      exige(T, "dataTermo", "Informe a data da assinatura.");
      data(T, "dataTermo", "A data da assinatura");
    }

    // ---- Inconsistências (avisos) ----
    const I = "Possíveis inconsistências";
    if (chaves.includes("info")) {
      if (ah && algum("def", 9)) add(I, "O(a) estudante está como AH/SD, mas há deficiência marcada nas Informações iniciais (campos do modo Regular).", seq("def", 9).filter(ch), "aviso");
      const ahMarc = [...seq("ind", 5), ...seq("car", 19)].filter(ch);
      if (!ah && ahMarc.length) add(I, "O(a) estudante está como Regular, mas há campos de AH/SD marcados nas Informações iniciais.", ahMarc, "aviso");
    }
    if (chaves.includes("paee")) {
      const outros = seq("pT", 9).filter((id, i) => i !== 3 && ch(id));
      if (ah && outros.length) add(I, "O(a) estudante está como AH/SD, mas o PAEE marca outro tipo de deficiência/indicação.", outros, "aviso");
      if (!ah && ch("pT3")) add(I, "O(a) estudante está como Regular, mas o PAEE marca Altas Habilidades/Superdotação.", ["pT3"], "aviso");
    }
    return L;
  }

  // ============ MARCAÇÃO EM VERMELHO ============
  const limpar = () => document.querySelectorAll(".is-invalid").forEach(e => e.classList.remove("is-invalid"));
  const marcar = ids => ids.forEach(i => { const e = g(i); if (e) e.classList.add("is-invalid"); });
  const grupoDe = id => { const m = /^([A-Za-z]+)\d+$/.exec(id || ""); return m ? m[1] : null; };
  function desmarca(e) {
    const t = e.target; if (!t || !t.classList) return;
    t.classList.remove("is-invalid");
    const gr = grupoDe(t.id);
    if (gr && t.type === "checkbox")
      document.querySelectorAll(".is-invalid").forEach(x => { if (grupoDe(x.id) === gr) x.classList.remove("is-invalid"); });
  }
  document.addEventListener("input", desmarca);
  document.addEventListener("change", desmarca);

  // ============ JANELA DE PENDÊNCIAS ============
  document.body.insertAdjacentHTML("beforeend", `
  <div class="modal fade" id="valModal" tabindex="-1"><div class="modal-dialog modal-dialog-scrollable"><div class="modal-content">
    <div class="modal-header"><h5 class="modal-title" id="valTit"></h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
    <div class="modal-body" id="valCorpo"></div>
    <div class="modal-footer">
      <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Voltar e corrigir</button>
      <button type="button" class="btn btn-warning" id="valGo"></button>
    </div></div></div></div>`);

  function irPara(id) {
    const el = g(id); if (!el) return;
    const pane = el.closest(".tab-pane");
    const btn = pane && document.querySelector(`[data-bs-target="#${pane.id}"]`);
    if (btn) bootstrap.Tab.getOrCreateInstance(btn).show();
    setTimeout(() => { el.scrollIntoView({ block: "center" }); if (el.focus) el.focus(); }, 200);
  }

  function mostrar(titulo, L, podeContinuar, rotulo) {
    return new Promise(res => {
      const el = g("valModal"), inst = bootstrap.Modal.getOrCreateInstance(el);
      let decisao = false, alvo = null;
      g("valTit").textContent = titulo;
      const grupos = [...new Set(L.map(p => p.grupo))];
      g("valCorpo").innerHTML = grupos.map(gr => `<h6 class="mt-2">${gr}</h6><ul class="list-unstyled mb-2">` +
        L.filter(p => p.grupo === gr).map(p =>
          `<li><a href="#" data-id="${p.ids[0]}" class="${p.nivel === "erro" ? "text-danger" : "text-warning-emphasis"}">${p.nivel === "erro" ? "✖" : "⚠ Aviso:"} ${p.msg}</a></li>`).join("") + "</ul>").join("");
      const go = g("valGo");
      go.style.display = podeContinuar ? "" : "none"; go.textContent = rotulo;
      go.onclick = () => { decisao = true; inst.hide(); };
      g("valCorpo").onclick = e => {
        const a = e.target.closest("a[data-id]"); if (!a) return;
        e.preventDefault(); alvo = a.dataset.id; inst.hide();
      };
      const fim = () => { el.removeEventListener("hidden.bs.modal", fim); res(decisao); if (alvo) irPara(alvo); };
      el.addEventListener("hidden.bs.modal", fim);
      inst.show();
    });
  }

  const resumo = L => {
    const e = L.filter(p => p.nivel === "erro").length, a = L.length - e;
    return [e ? `${e} pendência(s) obrigatória(s)` : "", a ? `${a} aviso(s)` : ""].filter(Boolean).join(" e ");
  };

  // ============ DOCUMENTOS INDIVIDUAIS (itens 52, 53) ============
  async function conferir(chaves) {
    limpar();
    const L = levantar(chaves);
    if (!L.length) return true;
    marcar(L.flatMap(p => p.ids));
    return mostrar(resumo(L), L, !L.some(p => p.bloq), "Baixar assim mesmo");
  }
  [["pdfInfo", "info"], ["pdfEstudo", "estudo"], ["pdfPaee", "paee"], ["pdfTermo", "termo"]].forEach(([fn, k]) => {
    const orig = window[fn]; if (!orig) return;
    window[fn] = async function () {
      if (window.__semValidacao) return orig();
      if (await conferir([k])) return orig();
    };
  });

  // ============ PACOTE COMPLETO (item 55) ============
  const KEYS = ["info", "estudo", "paee", "termo"];
  const pk = g("btnPacote");
  if (pk && pk.onclick) {
    const orig = pk.onclick;
    pk.onclick = async function (e) {
      const chaves = KEYS.filter((_, i) => g("pk" + i) && g("pk" + i).checked);
      if (!chaves.length) return orig.call(this, e);
      limpar();
      const L = levantar(chaves);
      if (L.length) {
        marcar(L.flatMap(p => p.ids));
        const bloqueia = L.some(p => p.nivel === "erro");
        const ok = await mostrar(
          (bloqueia ? "Pacote bloqueado: " : "Pacote com avisos: ") + resumo(L), L, !bloqueia, "Gerar pacote assim mesmo");
        if (!ok) return;
      }
      window.__semValidacao = true;
      try { await orig.call(this, e); } finally { window.__semValidacao = false; }
    };
  }

  // ============ ESTUDANTE DUPLICADO (item 13) ============
  const salvarAnt = window.salvarAluno;
  window.salvarAluno = function () {
    const nome = norm(v("nome")), nasc = v("nasc");
    if (nome) {
      const dup = Object.entries(lerAlunos()).find(([id, a]) =>
        id !== atualId && norm(a.nome) === nome && (a.nasc || "") === nasc);
      if (dup && !confirm("Já existe um(a) estudante com o mesmo nome e data de nascimento. Salvar mesmo assim (ficará duplicado)?")) return;
    }
    salvarAnt();
  };
})();
