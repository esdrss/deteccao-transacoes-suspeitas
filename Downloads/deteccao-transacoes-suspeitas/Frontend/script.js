const $ = (id) => document.getElementById(id);
const formatarMoeda = (valor) => {
    if (valor === null || valor === undefined || isNaN(valor)) return valor;

    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
};

const i18n = {
    pt: {
        title: "Detecção de Transações Suspeitas",
        themeLight: "Tema Claro",
        themeDark: "Tema Escuro",
        dirUpper: "Somente acima",
        dirLower: "Somente abaixo",
        dirBoth: "Ambos",
        lower: "inferior",
        upper: "superior",
        secUpload: "Enviar Arquivo",
        secConfig: "Configuração da Análise",
        secDatabase: "Base de dados",
        secResult: "Resultado da Análise",
        secChart: "Gráfico de Tendência e Anomalias",
        labelName: "Nome da base de dados (opcional)",
        labelFile: "Arquivo (.csv, .xlsx, .xls)",
        btnUpload: "Salvar base de dados",
        labelMethod: "Método",
        labelDirection: "Direção",
        labelColumn: "Coluna",
        labelStreaming: "Leitura em Lotes (CSV)",
        labelMaxSus: "Máx. suspeitas",
        placeholderName: "Ex.: Semana 02 - Pagamentos",
        hintUpload: "Dica: a coluna padrão é <b>valor</b> (você pode trocar em “Coluna”).",
        hintBatch: "Leitura em Lotes ajuda em CSV grande, mas só vale para <b>Sigma</b> e <b>Z-score</b>.",
        resultHint: "Selecione <b>Analisar</b> em alguma base de dados.",
        chartSubtitle: "Os pontos a vermelho destacam os valores considerados suspeitos.",
        legendNormal: "Transações Normais",
        legendSuspect: "Transações Suspeitas",
        modalTitle: "Análise Concluída! 🚀",
        btnTableOnly: "Apenas Tabela",
        btnViewChart: "📉 Ver Gráfico",
        chartAll: "Todos os Valores",
        chartNormalSingle: "Transação Normal",
        chartSuspectSingle: "Transação Suspeita",
        modalMsg1: "Foram encontradas ",
        modalMsg2: " transações suspeitas.<br><br>Deseja visualizar o gráfico de tendência agora?",
        thID: "ID",
        thName: "Nome",
        thFile: "Arquivo",
        thSize: "Tamanho",
        thDate: "Data de Envio",
        thLast: "Última análise",
        thActions: "Ações",
        analysisIn: "Análise em",
        columnLabel: "coluna",
        "data": "data",
        "id transação": "id transação",
        "nome": "nome",
        "categoria": "categoria",
        "estabelecimento": "estabelecimento",
        "método de pagamento": "método de pagamento",
        "cidade/uf": "cidade/uf",
        "valor": "valor",
        btnClose: "Fechar",
        btnAnalyze: "Analisar",
        btnReview: "Rever análise",
        btnRename: "Renomear",
        btnReplace: "Substituir",
        btnDelete: "Excluir",
        tblLoading: "Carregando...",
        tblEmpty: "Nenhum dataset salvo ainda.",
        tblNoAnalysis: "sem análise",
        tblSuspects: "suspeitas",
        cardMethod: "Método",
        cardStats: "Estatísticas",
        cardLimits: "Limites",
        cardSuspects: "Suspeitas",
        stat_mean: "média",
        stat_std: "desvio",
        stat_median: "mediana",
        btnBrowse: "Procurar...",
        noFileChosen: "Nenhum arquivo selecionado.",
        optNo: "Não",
        optYesBatch: "Sim (média/desvio)",
        defColumn: "valor",
        footerText: "Detecção de Transações Suspeitas - Por",
        errMissingCol: "A planilha precisa ter uma coluna chamada '{col}'.",
        errFewData: "Poucos dados na coluna '{col}' para calcular estatísticas.",
        errFewDataStd: "Poucos dados na coluna para calcular desvio padrão.",
        promptRename: "Novo nome do dataset:",
        confirmDelete: "Excluir dataset {id}?",
        msgRenamed: "Nome atualizado.",
        msgReplaced: "Arquivo substituído. (Resultado anterior limpo)",
        msgDeleted: "Dataset excluído.",
        msgSaved: "Dataset salvo:",
        errNoFile: "Escolha um arquivo.",
        optSigma: "Sigma (média ± k·desvio)",
        optZscore: "Z-score (|z| > k)",
        optIqr: "IQR (Q1/Q3 ± k·IQR)",
        optMad: "MAD (mediana ± k·MAD)",
    },
    en: {
        title: "Suspicious Transaction Detection",
        themeLight: "Light Theme",
        themeDark: "Dark Theme",
        dirUpper: "Only above",
        dirLower: "Only below",
        dirBoth: "Both",
        lower: "lower",
        upper: "upper",
        secUpload: "Upload File",
        secConfig: "Analysis Configuration",
        secDatabase: "Database",
        secResult: "Analysis Result",
        secChart: "Trend and Anomalies Chart",
        labelName: "Dataset name (optional)",
        labelFile: "File (.csv, .xlsx, .xls)",
        btnUpload: "Save dataset",
        labelMethod: "Method",
        labelDirection: "Direction",
        labelColumn: "Column",
        labelStreaming: "Batch Reading (CSV)",
        labelMaxSus: "Max. suspects",
        placeholderName: "e.g., Week 02 - Payments",
        hintUpload: "Tip: the default column is <b>value</b> (you can change it under “Column”).",
        hintBatch: "Batch Reading helps with large CSVs, but only applies to <b>Sigma</b> and <b>Z-score</b>.",
        resultHint: "Select <b>Analyze</b> in a database.",
        chartSubtitle: "Red dots highlight values considered suspicious.",
        legendNormal: "Normal Transactions",
        legendSuspect: "Suspicious Transactions",
        modalTitle: "Analysis Completed! 🚀",
        btnTableOnly: "Table Only",
        btnViewChart: "📉 View Chart",
        chartAll: "All Values",
        chartNormalSingle: "Normal Transaction",
        chartSuspectSingle: "Suspicious Transaction",
        modalMsg1: "Found ",
        modalMsg2: " suspicious transactions.<br><br>Would you like to view the trend chart now?",
        thID: "ID",
        thName: "Name",
        thFile: "File",
        thSize: "Size",
        thDate: "Upload Date",
        thLast: "Last Analysis",
        thActions: "Actions",
        analysisIn: "Analyzed on",
        columnLabel: "column",
        "data": "date",
        "id transação": "transaction id",
        "nome": "name",
        "categoria": "category",
        "estabelecimento": "establishment",
        "método de pagamento": "payment method",
        "cidade/uf": "city/state",
        "valor": "value",
        btnClose: "Close",
        btnAnalyze: "Analyze",
        btnReview: "Review analysis",
        btnRename: "Rename",
        btnReplace: "Replace",
        btnDelete: "Delete",
        tblLoading: "Loading...",
        tblEmpty: "No dataset saved yet.",
        tblNoAnalysis: "no analysis",
        tblSuspects: "suspects",
        cardMethod: "Method",
        cardStats: "Statistics",
        cardLimits: "Limits",
        cardSuspects: "Suspects",
        stat_mean: "mean",
        stat_std: "std",
        stat_median: "median",
        btnBrowse: "Browse...",
        noFileChosen: "No file chosen.",
        optNo: "No",
        optYesBatch: "Yes (mean/std)",
        defColumn: "value",
        footerText: "Suspicious Transaction Detection - By",
        errMissingCol: "The spreadsheet must have a column named '{col}'.",
        errFewData: "Not enough data in column '{col}' to calculate statistics.",
        errFewDataStd: "Not enough data to calculate standard deviation.",
        promptRename: "New dataset name:",
        confirmDelete: "Delete dataset {id}?",
        msgRenamed: "Name updated.",
        msgReplaced: "File replaced. (Previous result cleared)",
        msgDeleted: "Dataset deleted.",
        msgSaved: "Dataset saved:",
        errNoFile: "Please choose a file.",
        optSigma: "Sigma (mean ± k·std)",
        optZscore: "Z-score (|z| > k)",
        optIqr: "IQR (Q1/Q3 ± k·IQR)",
        optMad: "MAD (median ± k·MAD)",
    },
    es: {
        title: "Detección de Transacciones Sospechosas",
        themeLight: "Tema Claro",
        themeDark: "Tema Oscuro",
        dirUpper: "Solo por encima",
        dirLower: "Solo por debajo",
        dirBoth: "Ambos",
        lower: "inferior",
        upper: "superior",
        secUpload: "Subir Archivo",
        secConfig: "Configuración de Análisis",
        secDatabase: "Base de datos",
        secResult: "Resultado del Análisis",
        secChart: "Gráfico de Tendencia y Anomalías",
        labelName: "Nombre de la base de datos (opcional)",
        labelFile: "Archivo (.csv, .xlsx, .xls)",
        btnUpload: "Guardar base de datos",
        labelMethod: "Método",
        labelDirection: "Dirección",
        labelColumn: "Columna",
        labelStreaming: "Lectura en Lotes (CSV)",
        labelMaxSus: "Máx. sospechas",
        placeholderName: "Ej.: Semana 02 - Pagos",
        hintUpload: "Consejo: la columna predeterminada es <b>valor</b> (puedes cambiarla en “Columna”).",
        hintBatch: "La Lectura por Lotes ayuda con CSV grandes, pero solo funciona para <b>Sigma</b> y <b>Z-score</b>.",
        resultHint: "Selecciona <b>Analizar</b> en alguna base de datos.",
        chartSubtitle: "Los puntos en rojo resaltan los valores considerados sospechosos.",
        legendNormal: "Transacciones Normales",
        legendSuspect: "Transacciones Sospechosas",
        modalTitle: "¡Análisis Completado! 🚀",
        btnTableOnly: "Solo Tabla",
        btnViewChart: "📉 Ver Gráfico",
        chartAll: "Todos los Valores",
        chartNormalSingle: "Transacción Normal",
        chartSuspectSingle: "Transacción Sospechosa",
        modalMsg1: "Se encontraron ",
        modalMsg2: " transacciones sospechosas.<br><br>¿Deseas ver el gráfico de tendencia ahora?",
        thID: "ID",
        thName: "Nombre",
        thFile: "Archivo",
        thSize: "Tamaño",
        thDate: "Fecha de Subida",
        thLast: "Última Análisis",
        thActions: "Acciones",
        analysisIn: "Analizado el",
        columnLabel: "columna",
        "data": "fecha",
        "id transação": "id transacción",
        "nome": "nombre",
        "categoria": "categoría",
        "estabelecimento": "establecimiento",
        "método de pagamento": "método de pago",
        "cidade/uf": "ciudad/estado",
        "valor": "valor",
        btnClose: "Cerrar",
        btnAnalyze: "Analizar",
        btnReview: "Revisar análisis",
        btnRename: "Renombrar",
        btnReplace: "Reemplazar",
        btnDelete: "Eliminar",
        tblLoading: "Cargando...",
        tblEmpty: "Ningún conjunto de datos guardado aún.",
        tblNoAnalysis: "sin análisis",
        tblSuspects: "sospechosas",
        cardMethod: "Método",
        cardStats: "Estadísticas",
        cardLimits: "Límites",
        cardSuspects: "Sospechas",
        stat_mean: "media",
        stat_std: "desv",
        stat_median: "mediana",
        btnBrowse: "Examinar...",
        noFileChosen: "Ningún archivo seleccionado.",
        optNo: "No",
        optYesBatch: "Sí (media/desv)",
        defColumn: "valor",
        footerText: "Detección de Transacciones Sospechosas - Por",
        errMissingCol: "La hoja de cálculo debe tener una columna llamada '{col}'.",
        errFewData: "No hay suficientes datos en la columna '{col}' para calcular estadísticas.",
        errFewDataStd: "No hay suficientes datos para calcular la desviación estándar.",
        promptRename: "Nuevo nombre del dataset:",
        confirmDelete: "¿Eliminar dataset {id}?",
        msgRenamed: "Nombre actualizado.",
        msgReplaced: "Archivo reemplazado. (Resultado anterior borrado)",
        msgDeleted: "Dataset eliminado.",
        msgSaved: "Dataset guardado:",
        errNoFile: "Por favor, elige un archivo.",
        optSigma: "Sigma (media ± k·desv)",
        optZscore: "Z-score (|z| > k)",
        optIqr: "IQR (Q1/Q3 ± k·IQR)",
        optMad: "MAD (mediana ± k·MAD)",
    }
};

let currentLang = localStorage.getItem('app-lang') || 'pt';

function updateUI() {
    const dict = i18n[currentLang] || i18n['pt'];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
            el.textContent = dict[key];
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (dict[key]) {
            el.placeholder = dict[key];
        }
    });

    document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const key = el.getAttribute('data-i18n-html');
        if (dict[key]) {
            el.innerHTML = dict[key];
        }
    });

    document.querySelectorAll('[data-i18n-val]').forEach(el => {
        const key = el.getAttribute('data-i18n-val');
        if (dict[key]) {
            const valAtual = el.value.toLowerCase();
            if (valAtual === 'valor' || valAtual === 'value') {
                el.value = dict[key];
            }
        }
    });
}

const langSelectElem = $('langSelect');
if (langSelectElem) {
    langSelectElem.value = currentLang;

    langSelectElem.addEventListener('change', async (e) => {
        currentLang = e.target.value;
        localStorage.setItem('app-lang', currentLang);
        updateUI();

        await refreshDatasets();

        const dict = i18n[currentLang] || i18n['pt'];
        $('resultHint').innerHTML = dict.resultHint;
        $('susHead').innerHTML = '';
        $('susBody').innerHTML = '';
        $('rMethod').textContent = '--';
        $('rStats').textContent = '--';
        $('rThresh').textContent = '--';
        $('rCount').textContent = '--';
        $('sessao-grafico').style.display = 'none';
    });
}

updateUI();

function showErr(msg) {
    const box = $('errBox');
    $('errText').textContent = msg;
    box.style.display = 'block';
    $('okBox').style.display = 'none';
}

function showOk(msg) {
    const box = $('okBox');
    $('okText').textContent = msg;
    box.style.display = 'block';
    $('errBox').style.display = 'none';
}

function clearMsg() {
    $('errBox').style.display = 'none';
    $('okBox').style.display = 'none';
}

function fmtBytes(bytes) {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (!bytes && bytes !== 0) return '--';
    let i = 0; let v = bytes;
    while (v >= 1024 && i < sizes.length - 1) { v /= 1024; i++; }
    return v.toFixed(1) + ' ' + sizes[i];
}

function pill(html, cls) {
    return `<span class="pill ${cls}">${html}</span>`;
}

function getAnalyzeConfig() {
    return {
        method: $('method').value,
        k: Number($('k').value),
        direction: $('direction').value,
        column: $('column').value.trim() || 'valor',
        streaming: $('streaming').value === 'true',
        max_suspeitas: Number($('maxSus').value)
    };
}

async function apiJson(url, opts = {}) {
    const res = await fetch(url, opts);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        let msg = data.detail || data.erro || ('Erro HTTP ' + res.status);
        const dict = i18n[currentLang] || i18n['pt'];
        if (msg.startsWith('ERR_MISSING_COLUMN|')) {
            msg = dict.errMissingCol.replace('{col}', msg.split('|')[1]);
        } else if (msg.startsWith('ERR_FEW_DATA|')) {
            msg = dict.errFewData.replace('{col}', msg.split('|')[1]);
        } else if (msg === 'ERR_FEW_DATA_STD') {
            msg = dict.errFewDataStd;
        }

        throw new Error(msg);
    }
    return data;
}
async function refreshDatasets() {
    const tbody = $('dsTbody');
    const dict = i18n[currentLang] || i18n['pt'];
    tbody.innerHTML = `<tr><td colspan="7">${dict.tblLoading}</td></tr>`;

    try {
        const list = await apiJson('/datasets');
        if (list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7">${dict.tblEmpty}</td></tr>`;
            return;
        }

        tbody.innerHTML = '';
        for (const ds of list) {
            const last = ds.last_analysis_at
                ? pill(
                    `${(ds.last_analysis_method || '--').toUpperCase()} · ${ds.last_suspeitas_count ?? '--'} ${dict.tblSuspects}`,
                    (ds.last_suspeitas_count || 0) > 0 ? 'pill-warn' : 'pill-ok'
                )
                : pill(dict.tblNoAnalysis, 'pill-info');

            const tr = document.createElement('tr');
            tr.innerHTML = `
            <td><code>${ds.id}</code></td>
            <td>${escapeHtml(ds.name)}</td>
            <td>${escapeHtml(ds.original_filename)}</td>
            <td>${fmtBytes(ds.size_bytes)}</td>
            <td>${escapeHtml(new Date(ds.uploaded_at).toLocaleString('pt-BR'))}</td>
            <td>${last}</td>
            <td>
              <div class="actions">
                <button class="btn btn-sm" data-act="analyze" data-id="${ds.id}">${dict.btnAnalyze}</button>
                <button class="btn2 btn-sm" data-act="view" data-id="${ds.id}">${dict.btnReview}</button>
                <button class="btn2 btn-sm" data-act="rename" data-id="${ds.id}">${dict.btnRename}</button>
                <button class="btn2 btn-sm" data-act="replace" data-id="${ds.id}">${dict.btnReplace}</button>
                <button class="danger btn-sm" data-act="delete" data-id="${ds.id}">${dict.btnDelete}</button>
                <input type="file" accept=".csv,.xlsx,.xls" style="display:none" data-file="${ds.id}" />
              </div>
            </td>
          `;
            tbody.appendChild(tr);
        }
    } catch (e) {
        showErr(e.message);
    }
}

function escapeHtml(s) {
    return String(s ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

let meuGrafico = null;

function desenharGrafico(chartData) {
    const sessaoGrafico = $('sessao-grafico');
    const dict = i18n[currentLang] || i18n['pt'];

    if (!chartData) {
        sessaoGrafico.style.display = 'none';
        return;
    }

    sessaoGrafico.style.display = 'block';
    const larguraIdeal = chartData.labels.length * 10;
    $('boxGrafico').style.width = larguraIdeal > window.innerWidth ? larguraIdeal + 'px' : '100%';
    const ctx = $('graficoLinha').getContext('2d');

    if (meuGrafico) {
        meuGrafico.destroy();
    }

    const rootStyles = getComputedStyle(document.body);
    const corTexto = rootStyles.getPropertyValue('--muted').trim() || '#94a3b8';
    const corLinha = rootStyles.getPropertyValue('--brand').trim() || '#6366f1';
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const corGrid = isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)';
    const gradientArea = ctx.createLinearGradient(0, 0, 0, 350);
    gradientArea.addColorStop(0, corLinha + '33');
    gradientArea.addColorStop(1, corLinha + '00');

    meuGrafico = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [
                {
                    label: dict.chartAll,
                    data: chartData.values,
                    borderColor: corLinha,
                    backgroundColor: gradientArea,
                    fill: true,
                    borderWidth: 1.5,
                    pointRadius: 2,
                    tension: 0.1
                },
                {
                    label: dict.legendSuspect,
                    data: chartData.suspeitos,
                    backgroundColor: '#ef4444',
                    borderColor: '#ef4444',
                    borderWidth: 0,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    pointStyle: 'circle'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    filter: function (tooltipItem, index, tooltipItems) {
                        if (tooltipItems.length > 1 && tooltipItem.datasetIndex === 0) {
                            return false;
                        }
                        return true;
                    },
                    callbacks: {
                        label: function (context) {
                            let label = context.dataset.label || '';

                            if (label === dict.chartAll) {
                                label = dict.chartNormalSingle;
                            } else if (label === dict.legendSuspect) {
                                label = dict.chartSuspectSingle;
                            }

                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += formatarMoeda(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: corTexto },
                    grid: { color: corGrid }
                },
                y: {
                    ticks: {
                        color: corTexto,
                        // Formata os números do eixo Y
                        callback: function (value) {
                            return formatarMoeda(value);
                        }
                    },
                    grid: { color: corGrid }
                }
            }
        }
    });
}

function renderResult(result, isReview = false) {
    const dictMsg = i18n[currentLang] || i18n['pt'];
    const localeStr = currentLang === 'en' ? 'en-US' : currentLang === 'es' ? 'es-ES' : 'pt-BR';
    const dataFormatada = new Date(result.analysis_at).toLocaleString(localeStr);

    const colTraduzida = dictMsg[result.column.toLowerCase()] || result.column;
    $('resultHint').textContent = `${dictMsg.analysisIn} ${dataFormatada} · ${dictMsg.columnLabel}: ${colTraduzida}`;

    $('rMethod').textContent = String(result.method || '--').toUpperCase();
    $('rCount').textContent = result.quantidade_suspeitas ?? '--';
    const statsPairs = Object.entries(result.stats || {})
        .map(([k, v]) => {
            const nomeEstatistica = dictMsg['stat_' + k] || k;
            return `${nomeEstatistica}=${v}`;
        })
        .join(' · ');
    $('rStats').textContent = statsPairs || '--';
    const th = result.thresholds || {};
    const dict = i18n[currentLang] || i18n['pt'];
    $('rThresh').textContent = `${dict.lower}=${th.lower ?? '--'} · ${dict.upper}=${th.upper ?? '--'}`;

    const head = $('susHead');
    const body = $('susBody');
    head.innerHTML = '';
    body.innerHTML = '';

    const rows = result.suspeitas || [];
    if (rows.length === 0) {
        head.innerHTML = '<th>Resultado</th>';
        body.innerHTML = `<tr><td>Nenhuma suspeita encontrada.</td></tr>`;
    } else {
        const cols = Object.keys(rows[0]);
        for (const c of cols) {
            const thEl = document.createElement('th');
            thEl.textContent = dictMsg[c.toLowerCase()] || c;
            head.appendChild(thEl);
        }
        const colAlvo = result.column;
        let linhasHTML = '';
        for (const r of rows) {
            linhasHTML += `<tr>${cols.map(c => {
                let valorTd = r[c];

                if (c === colAlvo && !isNaN(valorTd) && valorTd !== null) {
                    valorTd = formatarMoeda(valorTd);
                }

                return `<td>${escapeHtml(valorTd)}</td>`;
            }).join('')}</tr>`;
        }
        body.innerHTML = linhasHTML;

        $('truncMsg').textContent = result.truncated
            ? `⚠️ A lista de suspeitas foi limitada a ${$('maxSus').value}. Total real: ${result.quantidade_suspeitas}.`
            : '';

        $('sessao-grafico').style.display = 'none';

        if (result.chart_data) {
            if (isReview) {
                desenharGrafico(result.chart_data);
                $('sessao-grafico').style.display = 'block';
                setTimeout(() => {
                    $('sessao-grafico').scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 50);
            } else {
                setTimeout(() => {
                    const modal = $('modalGrafico');
                    const msg = $('modalMsg');
                    const btnSim = $('btnSimGrafico');
                    const btnNao = $('btnNaoGrafico');
                    const btnX = $('btnFecharX');

                    const dictMsg = i18n[currentLang] || i18n['pt'];
                    msg.innerHTML = `${dictMsg.modalMsg1}<b style="color: var(--danger); font-size: 16px;">${result.quantidade_suspeitas}</b>${dictMsg.modalMsg2}`;

                    modal.style.display = 'flex';

                    btnNao.onclick = () => modal.style.display = 'none';
                    btnX.onclick = () => modal.style.display = 'none';

                    btnSim.onclick = () => {
                        modal.style.display = 'none';
                        desenharGrafico(result.chart_data);
                        setTimeout(() => {
                            $('sessao-grafico').scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 50);
                    };
                }, 150);
            }
        }
    }
}

async function handleUpload() {
    const dict = i18n[currentLang] || i18n['pt'];
    const file = $('dsFile').files[0];
    if (!file) {
        showErr(dict.errNoFile);
        return;
    }

    const btn = $('btnUpload');
    btn.disabled = true;
    const fd = new FormData();
    fd.append('arquivo', file);
    const name = $('dsName').value.trim();
    if (name) fd.append('name', name);

    try {
        const ds = await apiJson('/datasets', { method: 'POST', body: fd });
        showOk(`${dict.msgSaved} ${ds.id}`);
        $('dsName').value = '';
        $('dsFile').value = '';
        $('fileNameDisplay').textContent = dict.noFileChosen;
        $('fileNameDisplay').setAttribute('data-i18n', 'noFileChosen');
        await refreshDatasets();
    } catch (e) {
        showErr(e.message);
    } finally {
        btn.disabled = false;
    }
}

async function analyze(id) {
    clearMsg();
    const cfg = getAnalyzeConfig();

    try {
        const result = await apiJson(`/datasets/${id}/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cfg)
        });
        renderResult(result);
        await refreshDatasets();
    } catch (e) {
        showErr(e.message);
    }
}

async function viewLast(id) {
    clearMsg();
    try {
        const result = await apiJson(`/datasets/${id}/result`);
        renderResult(result, true);
    } catch (e) {
        showErr(e.message);
    }
}

async function renameDataset(id) {
    const dict = i18n[currentLang] || i18n['pt'];
    const newName = prompt(dict.promptRename);
    if (!newName) return;

    clearMsg();
    try {
        const fd = new FormData();
        fd.append('name', newName);
        await apiJson(`/datasets/${id}`, { method: 'PUT', body: fd });
        await refreshDatasets();
        showOk(dict.msgRenamed);
    } catch (e) {
        showErr(e.message);
    }
}

async function replaceFile(id) {
    const input = document.querySelector(`input[data-file="${id}"]`);
    input.click();
    input.onchange = async () => {
        const file = input.files[0];
        if (!file) return;

        const dict = i18n[currentLang] || i18n['pt'];
        clearMsg();
        try {
            const fd = new FormData();
            fd.append('arquivo', file);
            await apiJson(`/datasets/${id}`, { method: 'PUT', body: fd });
            await refreshDatasets();
            showOk(dict.msgReplaced);
        } catch (e) {
            showErr(e.message);
        } finally {
            input.value = '';
        }
    };
}

async function deleteDataset(id) {
    const dict = i18n[currentLang] || i18n['pt'];
    if (!confirm(dict.confirmDelete.replace('{id}', id))) return;

    clearMsg();
    try {
        await apiJson(`/datasets/${id}`, { method: 'DELETE' });
        await refreshDatasets();
        showOk(dict.msgDeleted);
    } catch (e) {
        showErr(e.message);
    }
}

$('btnUpload').addEventListener('click', handleUpload);
$('btnCloseErr').addEventListener('click', () => $('errBox').style.display = 'none');
$('btnCloseOk').addEventListener('click', () => $('okBox').style.display = 'none');

$('method').addEventListener('change', () => {
    const m = $('method').value;
    const defaults = { sigma: 3, zscore: 3, iqr: 1.5, mad: 3.5 };
    $('k').value = defaults[m] ?? 3;
});

$('dsTbody').addEventListener('click', (ev) => {
    const btn = ev.target.closest('button');
    if (!btn) return;

    const act = btn.getAttribute('data-act');
    const id = btn.getAttribute('data-id');
    if (!act || !id) return;

    if (act === 'analyze') analyze(id);
    if (act === 'view') viewLast(id);
    if (act === 'rename') renameDataset(id);
    if (act === 'replace') replaceFile(id);
    if (act === 'delete') deleteDataset(id);
});

const btnThemeToggle = $('btnThemeToggle');
const themeIcon = $('themeIcon');
const htmlEl = document.documentElement;

const savedTheme = localStorage.getItem('app-theme') || 'dark';

// Verifica o tema inicial e ajusta a etiqueta de tradução
if (savedTheme === 'light') {
    htmlEl.setAttribute('data-theme', 'light');
    $('themeIcon').textContent = '🌙';
    $('themeText').setAttribute('data-i18n', 'themeDark');
    updateUI(); // Chama a tradução para ajustar o texto na hora
}

btnThemeToggle.addEventListener('click', () => {
    const currentTheme = htmlEl.getAttribute('data-theme');
    if (currentTheme === 'light') {
        htmlEl.removeAttribute('data-theme');
        localStorage.setItem('app-theme', 'dark');
        $('themeIcon').textContent = '☀️';
        $('themeText').setAttribute('data-i18n', 'themeLight');
    } else {
        htmlEl.setAttribute('data-theme', 'light');
        localStorage.setItem('app-theme', 'light');
        $('themeIcon').textContent = '🌙';
        $('themeText').setAttribute('data-i18n', 'themeDark');
    }

    updateUI();

    if (meuGrafico) {
        meuGrafico.update();
    }
});
$('dsFile').addEventListener('change', (e) => {
    const display = $('fileNameDisplay');
    if (e.target.files.length > 0) {
        display.textContent = e.target.files[0].name;
        display.removeAttribute('data-i18n');
    } else {
        display.setAttribute('data-i18n', 'noFileChosen');
        updateUI();
    }
});
// init
refreshDatasets().catch(e => showErr(e.message));