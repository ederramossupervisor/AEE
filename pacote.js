(function () {
  const g = id => document.getElementById(id);

  // ---------- PWA ----------
  const head = document.head;
  [["manifest", "manifest.json"], ["apple-touch-icon", "apple-touch-icon.png"], ["icon", "icon-192.png"]].forEach(([rel, href]) => {
    const l = document.createElement("link"); l.rel = rel; l.href = href; head.appendChild(l);
  });
  const tc = document.createElement("meta"); tc.name = "theme-color"; tc.content = "#2b4acb"; head.appendChild(tc);
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }

  // ---------- biblioteca para juntar PDFs ----------
  let libPromise = null;
  function carregarLib() {
    if (window.PDFLib) return Promise.resolve();
    if (!libPromise) libPromise = new Promise((ok, erro) => {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js";
      s.onload = ok; s.onerror = () => erro(new Error("Não foi possível carregar a biblioteca de PDF (verifique a internet)."));
      document.head.appendChild(s);
    });
    return libPromise;
  }

  // ---------- captura o PDF de cada documento sem baixar ----------
  async function capturar(fn) {
    const Orig = window.jspdf.jsPDF;
    let doc = null;
    window.jspdf.jsPDF = function (...a) {
      const d = new Orig(...a);
      d.save = () => { doc = d; };
      return d;
    };
    try { await fn(); } finally { window.jspdf.jsPDF = Orig; }
    return doc ? doc.output("arraybuffer") : null;
  }

  const DOCS = [
    ["Informações iniciais", () => window.pdfInfo()],
    ["Estudo de caso", () => window.pdfEstudo()],
    ["PAEE", () => window.pdfPaee()],
    ["Termo de Matrícula", () => window.pdfTermo()]
  ];

  // ---------- interface ----------
  const aba = g("tabCadastro");
  const box = document.createElement("div");
  box.className = "border-top mt-4 pt-3";
  box.innerHTML = `
    <h6>Pacote completo (um único PDF)</h6>
    <div class="d-flex flex-wrap gap-3 mb-2">
      ${DOCS.map((d, i) => `<div class="form-check"><input class="form-check-input" type="checkbox" id="pk${i}" checked>
        <label class="form-check-label" for="pk${i}">${d[0]}</label></div>`).join("")}
    </div>
    <button class="btn btn-dark" id="btnPacote">Baixar pacote completo</button>
    <span id="pkMsg" class="ms-2 small text-muted"></span>`;
  aba.appendChild(box);

  g("btnPacote").onclick = async () => {
    const d = coletar();
    if (!d.nome.trim()) return alert("Informe o nome do estudante.");
    const escolhidos = DOCS.filter((_, i) => g("pk" + i).checked);
    if (!escolhidos.length) return alert("Marque ao menos um documento.");
    const msg = g("pkMsg"), btn = g("btnPacote");
    btn.disabled = true; msg.textContent = "Gerando...";
    try {
      await carregarLib();
      const saida = await PDFLib.PDFDocument.create();
      for (const [nome, fn] of escolhidos) {
        msg.textContent = "Gerando: " + nome + "...";
        const buf = await capturar(fn);
        if (!buf) continue;
        const src = await PDFLib.PDFDocument.load(buf);
        const pags = await saida.copyPages(src, src.getPageIndices());
        pags.forEach(p => saida.addPage(p));
      }
      const bytes = await saida.save();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
      a.download = `Pacote_AEE_${d.nome.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      msg.textContent = "Pronto!";
    } catch (e) {
      msg.textContent = ""; alert("Erro ao gerar o pacote: " + e.message);
    } finally { btn.disabled = false; }
  };
})();
