const $ = (id) => document.getElementById(id);
const formatarMoeda = (valor) => {
    // Se não for número (ex: nomes, datas), retorna como está
    if (valor === null || valor === undefined || isNaN(valor)) return valor;

    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
};

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
        const msg = data.detail || data.erro || ('Erro HTTP ' + res.status);
        throw new Error(msg);
    }
    return data;
}

async function refreshDatasets() {
    const tbody = $('dsTbody');

    tbody.innerHTML = `<tr><td colspan="7">Carregando...</td></tr>`;

    try {
        const list = await apiJson('/datasets');
        if (list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7">Nenhum dataset salvo ainda.</td></tr>`;
            return;
        }

        tbody.innerHTML = '';
        for (const ds of list) {
            const last = ds.last_analysis_at
                ? pill(
                    `${(ds.last_analysis_method || '--').toUpperCase()} · ${ds.last_suspeitas_count ?? '--'} suspeitas`,
                    (ds.last_suspeitas_count || 0) > 0 ? 'pill-warn' : 'pill-ok'
                )
                : pill('sem análise', 'pill-info');

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
                <button class="btn btn-sm" data-act="analyze" data-id="${ds.id}">Analisar</button>
                <button class="btn2 btn-sm" data-act="view" data-id="${ds.id}">Rever análise</button>
                <button class="btn2 btn-sm" data-act="rename" data-id="${ds.id}">Renomear</button>
                <button class="btn2 btn-sm" data-act="replace" data-id="${ds.id}">Substituir</button>
                <button class="danger btn-sm" data-act="delete" data-id="${ds.id}">Excluir</button>
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

    // Lemos as variáveis de cor diretamente do CSS do body
    const rootStyles = getComputedStyle(document.body);
    const corTexto = rootStyles.getPropertyValue('--muted').trim() || '#94a3b8';
    const corLinha = rootStyles.getPropertyValue('--brand').trim() || '#6366f1';

    // Grade super suave dependendo do tema (claro ou escuro)
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const corGrid = isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)';

    // --- A MÁGICA DO GRADIENTE AQUI ---
    // Criamos um degradê vertical (do topo y=0 até a base y=350)
    const gradientArea = ctx.createLinearGradient(0, 0, 0, 350);
    // O '33' e o '00' no final são valores hexadecimais de opacidade (Alpha)
    gradientArea.addColorStop(0, corLinha + '33'); // ~20% de opacidade no topo (suave)
    gradientArea.addColorStop(1, corLinha + '00'); // 0% de opacidade (totalmente transparente) na base

    meuGrafico = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [
                {
                    label: 'Todos os Valores',
                    data: chartData.values,
                    borderColor: corLinha,
                    backgroundColor: gradientArea, // Aplicamos o gradiente
                    fill: true,                    // Obrigatório para o preenchimento aparecer!
                    borderWidth: 1.5,
                    pointRadius: 2,
                    tension: 0.1
                },
                {
                    label: 'Transações Suspeitas',
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
                // Formata a caixinha ao passar o mouse (Tooltip)
                tooltip: {
                    // Filtro para não exibir os dois juntos nas suspeitas
                    filter: function (tooltipItem, index, tooltipItems) {
                        // Se houver normal e suspeito no mesmo ponto, oculta o normal (dataset 0)
                        if (tooltipItems.length > 1 && tooltipItem.datasetIndex === 0) {
                            return false;
                        }
                        return true;
                    },
                    callbacks: {
                        label: function (context) {
                            let label = context.dataset.label || '';

                            // Substitui o texto "Todos os Valores" no tooltip
                            if (label === 'Todos os Valores') {
                                label = 'Transação Normal';
                            } else if (label === 'Transações Suspeitas') {
                                label = 'Transação Suspeita';
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
    $('resultHint').textContent =
        `Análise em ${new Date(result.analysis_at).toLocaleString('pt-BR')} · coluna: ${result.column}`;

    $('rMethod').textContent = String(result.method || '--').toUpperCase();
    $('rCount').textContent = result.quantidade_suspeitas ?? '--';

    const statsPairs = Object.entries(result.stats || {})
        .map(([k, v]) => `${k}=${v}`)
        .join(' · ');
    $('rStats').textContent = statsPairs || '--';

    const th = result.thresholds || {};
    $('rThresh').textContent = `lower=${th.lower ?? '--'} · upper=${th.upper ?? '--'}`;

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
            thEl.textContent = c;
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

                    msg.innerHTML = `Foram encontradas <b style="color: var(--danger); font-size: 16px;">${result.quantidade_suspeitas}</b> transações suspeitas.<br><br>Deseja visualizar o gráfico de tendência agora?`;

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
    clearMsg();

    const file = $('dsFile').files[0];
    if (!file) { showErr('Escolha um arquivo.'); return; }

    const btn = $('btnUpload');
    btn.disabled = true;

    const fd = new FormData();
    fd.append('arquivo', file);

    const name = $('dsName').value.trim();
    if (name) fd.append('name', name);

    try {
        const ds = await apiJson('/datasets', { method: 'POST', body: fd });
        showOk(`Dataset salvo: ${ds.id}`);
        $('dsName').value = '';
        $('dsFile').value = '';
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
    const newName = prompt('Novo nome do dataset:');
    if (!newName) return;

    clearMsg();
    try {
        const fd = new FormData();
        fd.append('name', newName);
        await apiJson(`/datasets/${id}`, { method: 'PUT', body: fd });
        await refreshDatasets();
        showOk('Nome atualizado.');
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

        clearMsg();
        try {
            const fd = new FormData();
            fd.append('arquivo', file);
            await apiJson(`/datasets/${id}`, { method: 'PUT', body: fd });
            await refreshDatasets();
            showOk('Arquivo substituído. (Resultado anterior foi limpo)');
        } catch (e) {
            showErr(e.message);
        } finally {
            input.value = '';
        }
    };
}

async function deleteDataset(id) {
    if (!confirm(`Excluir dataset ${id}?`)) return;

    clearMsg();
    try {
        await apiJson(`/datasets/${id}`, { method: 'DELETE' });
        await refreshDatasets();
        showOk('Dataset excluído.');
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
if (savedTheme === 'light') {
    htmlEl.setAttribute('data-theme', 'light');
    themeIcon.textContent = '🌙';
    btnThemeToggle.innerHTML = '<span id="themeIcon">🌙</span> Tema Escuro';
}

btnThemeToggle.addEventListener('click', () => {
    const currentTheme = htmlEl.getAttribute('data-theme');
    if (currentTheme === 'light') {
        htmlEl.removeAttribute('data-theme');
        localStorage.setItem('app-theme', 'dark');
        btnThemeToggle.innerHTML = '<span id="themeIcon">☀️</span> Tema Claro';
    } else {
        htmlEl.setAttribute('data-theme', 'light');
        localStorage.setItem('app-theme', 'light');
        btnThemeToggle.innerHTML = '<span id="themeIcon">🌙</span> Tema Escuro';
    }

    if (meuGrafico) {
        meuGrafico.update();
    }
});

// init
refreshDatasets().catch(e => showErr(e.message));