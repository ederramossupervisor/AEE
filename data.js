(function () {
  // Campos de data dos documentos que começam com a data de hoje
  const CAMPOS = ["dataInfo", "pData", "dataTermo"];

  // data local (evita o erro de fuso horário do toISOString)
  const hoje = () => {
    const d = new Date(), p = n => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  };
  const preencherHoje = () => CAMPOS.forEach(id => {
    const e = document.getElementById(id);
    if (e && !e.value) e.value = hoje();
  });

  const orig = window.preencher;
  window.preencher = function (o) { orig(o); preencherHoje(); };
  preencherHoje();
})();
