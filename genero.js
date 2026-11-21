(function () {
  // Cada regra é [padrão, troca]. Todas são seguras para rodar mais de uma vez.
  const REGRAS = [
    [/Pedagog(?:o\/a|a|o)(?!\(a\))/g, "Pedagogo(a)"],
    [/\b([Pp])rofessor(?:\/a|\(a\))?([ \u00a0])([Ee])specializad(?:o\/a|o\(a\)|o)/g,
      (m, p, s, e) => `${p}rofessor(a)${s}${e}specializado(a)`],
    [/\bprofessor( do AEE| regente)/g, "professor(a)$1"],
    [/Diretor(?:\/a)?(?![(\w])/g, "Diretor(a)"],
    [/Instrutor(?!\(a\))(?= de Libras)/g, "Instrutor(a)"],
    [/Tradutor(?!\()-intérprete/g, "Tradutor(a)-intérprete"],
    [/\(cuidador\)/g, "(cuidador(a))"],
    [/\bledor\b(?!\()/g, "ledor(a)"],
    [/\bcegos\b(?!\()/g, "cegos(as)"],
    [/\bsurdos\b(?!\()/g, "surdos(as)"],
    [/\balunos\b(?!\()/g, "alunos(as)"],
    [/\baluno\b(?!\()/g, "aluno(a)"],
    [/\bpelo\/a\b/g, "pelo(a)"],
    [/\bmatriculado\b(?!\()/g, "matriculado(a)"],
    [/determinado colega/g, "determinado(a) colega"],
    [/PELOS \(AS\) PROFESSORES\?/g, "PELOS(AS) PROFESSORES(AS)?"]
  ];
  const norm = x => {
    if (Array.isArray(x)) return x.map(norm);
    if (typeof x !== "string") return x;
    return REGRAS.reduce((s, [re, t]) => s.replace(re, t), x);
  };

  // ---- tela ----
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: n => n.parentElement && /^(SCRIPT|STYLE|TEXTAREA)$/.test(n.parentElement.tagName)
      ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
  });
  const nos = []; while (w.nextNode()) nos.push(w.currentNode);
  nos.forEach(n => { const t = norm(n.nodeValue); if (t !== n.nodeValue) n.nodeValue = t; });

  // ---- PDFs (texto e medidas passam pela mesma troca) ----
  const Orig = window.jspdf.jsPDF;
  const Novo = function (...a) {
    const d = new Orig(...a);
    const t = d.text.bind(d), s = d.splitTextToSize.bind(d), gw = d.getTextWidth.bind(d);
    d.text = (x, ...r) => t(norm(x), ...r);
    d.splitTextToSize = (x, ...r) => s(norm(x), ...r);
    d.getTextWidth = x => gw(norm(x));
    return d;
  };
  Novo.prototype = Orig.prototype;
  window.jspdf.jsPDF = Novo;
})();
