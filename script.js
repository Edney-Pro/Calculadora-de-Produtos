// PARÂMETROS E VARIÁVEIS GLOBAIS
const TAXA_FIXA = 0.12; // 12% a.m.
const TOTAL_TELAS = 6;
const GARANTIAS = [
    { meses: 6, percentual: 5, nome: "Básica" },
    { meses: 12, percentual: 9, nome: "Standard" },
    { meses: 18, percentual: 12, nome: "Plus" },
    { meses: 24, percentual: 15, nome: "Premium" },
    { meses: 30, percentual: 18, nome: "Extendida" },
    { meses: 36, percentual: 20, nome: "Master" },
];

let telaAtual = 1;
let produtos = [];
let diaPagamento = 15;
let garantiaSelecionada = null;
let clientStatus = '', clientSituation = '', sourceInfo = '', indicadoName = '';

// INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
    setupCPFFormatting();
    criarVisoresGarantia();
    updateProdutosTotalDisplay();
});

// FUNÇÕES DE CÁLCULO
const calcularValorParcela = (valor, meses) => {
    if (meses <= 0) return valor;
    const i = TAXA_FIXA;
    const fator = (i * Math.pow(1 + i, meses)) / (Math.pow(1 + i, meses) - 1);
    return valor * fator;
};
const calcularValorTotalProdutos = () => produtos.reduce((total, p) => total + p.valor, 0);
const formatBRL = (valor) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// --- LÓGICA DAS TELAS ---

// TELA 1: DADOS PESSOAIS
function selectDiaPagamento(dia, element) {
    diaPagamento = dia;
    document.querySelectorAll('.dia-pagamento-container .btn-selection').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
    document.getElementById('diaSelecionadoDisplay').textContent = dia;
}

// TELA 4: PRODUTOS
function adicionarProduto() {
    const nomeInput = document.getElementById('produtoNome');
    const valorInput = document.getElementById('produtoValor');
    const nome = nomeInput.value.trim();
    const valor = parseFloat(valorInput.value);

    if (!nome || !valor || valor <= 0) {
        mostrarAlerta('Preencha nome e valor válidos.', 'warning');
        return;
    }
    
    produtos.push({ id: Date.now(), nome, valor });
    atualizarListaProdutos();
    nomeInput.value = '';
    valorInput.value = '';
    nomeInput.focus();
}

function removerProduto(index) {
    produtos.splice(index, 1);
    atualizarListaProdutos();
}

function atualizarListaProdutos() {
    const lista = document.getElementById('listaProdutos');
    lista.innerHTML = produtos.map((p, i) => `
        <div class="produto-card d-flex justify-content-between align-items-center">
            <strong>${p.nome}</strong>
            <div class="d-flex align-items-center gap-2">
                <span>${formatBRL(p.valor)}</span>
                <button type="button" class="btn btn-sm btn-danger" onclick="removerProduto(${i})"><i class="bi bi-trash"></i></button>
            </div>
        </div>`).join('');
    updateProdutosTotalDisplay();
}

function updateProdutosTotalDisplay() {
    const total = calcularValorTotalProdutos();
    document.getElementById('valorTotalProdutosDisplay').textContent = formatBRL(total);
}

// TELA 5: CONDIÇÕES DE PAGAMENTO
function criarVisoresGarantia() {
    const container = document.getElementById('garantiaVisoresContainer');
    container.innerHTML = GARANTIAS.map((g, index) => `
        <div class="col-6 col-md-4">
            <div class="visor-garantia" id="garantia-visor-${index}" onclick="selectGarantia(${index})">
                <div class="visor-garantia-nome">${g.nome} (${g.meses}M)</div>
                <div class="visor-garantia-parcela" id="garantia-parcela-${index}">-</div>
                <small>Parcela Mensal</small>
            </div>
        </div>`).join('');
}

function updateCondicoesDisplay() {
    const mesesPagamento = parseInt(document.getElementById('mesesPagamento').value);
    document.getElementById('mesesPagamentoDisplay').textContent = `${mesesPagamento} ${mesesPagamento === 1 ? 'mês' : 'meses'}`;
    
    const valorProdutos = calcularValorTotalProdutos();
    if (valorProdutos === 0) {
        GARANTIAS.forEach((_, index) => {
            document.getElementById(`garantia-parcela-${index}`).textContent = formatBRL(0);
        });
        return;
    };

    GARANTIAS.forEach((garantia, index) => {
        const valorComGarantia = valorProdutos * (1 + garantia.percentual / 100);
        const valorParcela = calcularValorParcela(valorComGarantia, mesesPagamento);
        document.getElementById(`garantia-parcela-${index}`).textContent = formatBRL(valorParcela);
    });
}

function selectGarantia(index) {
    garantiaSelecionada = GARANTIAS[index];
    document.querySelectorAll('.visor-garantia').forEach(v => v.classList.remove('active'));
    document.getElementById(`garantia-visor-${index}`).classList.add('active');
}

// --- NAVEGAÇÃO E VALIDAÇÃO ---
function avancarTela() {
    if (!validarTelaAtual()) return;
    if (telaAtual < TOTAL_TELAS) {
        telaAtual++;
        atualizarExibicaoTela();
    }
}
function voltarTela() {
    if (telaAtual > 1) {
        telaAtual--;
        atualizarExibicaoTela();
    }
}
function atualizarExibicaoTela() {
    document.querySelectorAll('.etapa').forEach(el => el.classList.remove('active'));
    const novaTela = document.getElementById(`tela${telaAtual}`);
    if (novaTela) novaTela.classList.add('active');
    
    if (telaAtual === 5) { updateCondicoesDisplay(); }
    if (telaAtual === TOTAL_TELAS) { atualizarResumo(); }
    
    document.getElementById('progressBar').style.width = `${(telaAtual / TOTAL_TELAS) * 100}%`;
    document.querySelector('.content-wrapper').scrollTo(0, 0);
}

function validarTelaAtual() {
    indicadoName = sourceInfo === 'indicado' ? document.getElementById('clientIndicado').value.trim() : '';

    switch (telaAtual) {
        case 1:
            const nomeValido = document.getElementById('clientName').value.trim().length > 2;
            const cpfValido = document.getElementById('clientCPF').value.replace(/\D/g, '').length === 11;
            if (!nomeValido || !cpfValido) mostrarAlerta('Nome e CPF são obrigatórios.', 'warning');
            return nomeValido && cpfValido;
        case 2:
            if (!clientStatus) mostrarAlerta('Selecione seu status de cliente.', 'warning');
            return !!clientStatus;
        case 3:
            if (clientStatus === 'yes' && !clientSituation) { mostrarAlerta('Selecione sua situação atual.', 'warning'); return false; }
            if (clientStatus === 'no' && !sourceInfo) { mostrarAlerta('Selecione como nos conheceu.', 'warning'); return false; }
            if (sourceInfo === 'indicado' && !indicadoName) { mostrarAlerta('Informe quem o indicou.', 'warning'); return false; }
            return true;
        case 4:
            if (produtos.length === 0) mostrarAlerta('Adicione pelo menos um produto.', 'warning');
            return produtos.length > 0;
        case 5:
            if (!garantiaSelecionada) mostrarAlerta('Selecione um plano de garantia.', 'warning');
            return !!garantiaSelecionada;
        default:
            return true;
    }
}

// Lógica de seleção das telas 2 e 3
function selectClientStatus(status, el) {
    clientStatus = status;
    document.querySelectorAll('#tela2 .btn-selection').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    if (status === 'create') { if (confirm('Sair para criar cadastro?')) window.location.href = '#'; return; }
    document.getElementById('clientStatusOptions').classList.toggle('hidden', status !== 'yes');
    document.getElementById('nonClientForm').classList.toggle('hidden', status !== 'no');
    setTimeout(avancarTela, 200);
}
function selectClientSituation(situation, el) {
    clientSituation = situation;
    document.querySelectorAll('#clientStatusOptions .btn-selection').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    setTimeout(avancarTela, 200);
}
function selectSource(source, el) {
    sourceInfo = source;
    document.querySelectorAll('#nonClientForm .btn-selection').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    document.getElementById('indicadoField').classList.toggle('hidden', source !== 'indicado');
    if (source !== 'indicado') setTimeout(avancarTela, 200);
}

// --- TELA FINAL: RESUMO E WHATSAPP ---
function atualizarResumo() {
    const nome = document.getElementById('clientName').value.trim();
    const cpf = document.getElementById('clientCPF').value.trim();
    const meses = parseInt(document.getElementById('mesesPagamento').value);
    const valorProdutos = calcularValorTotalProdutos();
    const valorComGarantia = valorProdutos * (1 + garantiaSelecionada.percentual / 100);
    const valorParcela = calcularValorParcela(valorComGarantia, meses);
    
    // **LÓGICA DE NOTIFICAÇÃO RESTAURADA AQUI**
    let mensagemStatusHTML = '';
    if (clientStatus === 'yes') {
        if (clientSituation === 'no') {
            mensagemStatusHTML = '<div class="summary-alert alert-success"><strong>✓ PROBABILIDADE ALTA:</strong> Cliente com parcelas em dia tem alta chance de aprovação.</div>';
        } else {
            mensagemStatusHTML = '<div class="summary-alert alert-warning"><strong>⚠️ ATENÇÃO:</strong> Cliente com parcelas em atraso. A regularização é necessária.</div>';
        }
    } else if (clientStatus === 'no') {
        mensagemStatusHTML = '<div class="summary-alert alert-info"><strong>📋 NOVO CLIENTE:</strong> Simulação sujeita à nossa política de análise de crédito.</div>';
    }

    document.getElementById('dadosPessoaisContent').innerHTML = `<p><strong>Cliente:</strong> ${nome}<br><strong>CPF:</strong> ${cpf}</p>${mensagemStatusHTML}`;
    document.getElementById('produtosSelecionadosContent').innerHTML = produtos.map(p => `<div class="d-flex justify-content-between"><span>${p.nome}</span> <span>${formatBRL(p.valor)}</span></div>`).join('') + `<hr><p class="d-flex justify-content-between"><strong>Total:</strong> <strong>${formatBRL(valorProdutos)}</strong></p>`;
    document.getElementById('garantiaContent').innerHTML = `<p><strong>Plano:</strong> ${garantiaSelecionada.nome}<br><strong>Duração:</strong> ${garantiaSelecionada.meses} meses</p>`;
    document.getElementById('condicoesPagamentoContent').innerHTML = `<p><strong>Valor Total (c/ garantia):</strong> ${formatBRL(valorComGarantia)}<br><strong>Parcelamento:</strong> ${meses}x de <strong>${formatBRL(valorParcela)}</strong></p>`;
    
    const formatarData = data => data.toLocaleDateString('pt-BR');
    const calcularDataFutura = (m, d) => { const dt = new Date(); dt.setMonth(dt.getMonth() + m); dt.setDate(Math.min(d, new Date(dt.getFullYear(), dt.getMonth() + 1, 0).getDate())); return dt; };
    document.getElementById('cronogramaPagamentoContent').innerHTML = `<p><strong>Dia de Vencimento:</strong> ${diaPagamento}<br><strong>1ª Parcela:</strong> ${formatarData(calcularDataFutura(1, diaPagamento))}<br><strong>Última Parcela:</strong> ${formatarData(calcularDataFutura(meses, diaPagamento))}</p>`;
}

function enviarWhatsApp() {
    if (!validarTelaAtual()) return;
    const nome = document.getElementById('clientName').value.trim();
    const meses = parseInt(document.getElementById('mesesPagamento').value);
    const valorProdutos = calcularValorTotalProdutos();
    const valorComGarantia = valorProdutos * (1 + garantiaSelecionada.percentual / 100);
    const valorParcela = calcularValorParcela(valorComGarantia, meses);

    let statusMsg = '';
    if (clientStatus === 'yes') {
        statusMsg = clientSituation === 'no' ? 'Cliente (parcelas em dia)' : 'Cliente (com pendência)';
    } else {
        statusMsg = sourceInfo === 'indicado' ? `Novo Cliente (indicado por: ${indicadoName})` : `Novo Cliente (fonte: ${sourceInfo})`;
    }

    const produtosMsg = produtos.map(p => `\n• ${p.nome} - ${formatBRL(p.valor)}`).join('');

    const message = `*🛒 SIMULAÇÃO DE PRODUTOS NOVOS (SEM ENTRADA)*\n\n` +
                  `*Cliente:* ${nome}\n*Status:* ${statusMsg}\n\n` +
                  `*Produtos Selecionados:*${produtosMsg}\n*Total Produtos:* ${formatBRL(valorProdutos)}\n\n` +
                  `*Garantia Escolhida:*\nPlano ${garantiaSelecionada.nome} (${garantiaSelecionada.meses} meses)\n\n` +
                  `*Condições de Pagamento:*\n` +
                  `Valor Total (c/ garantia): *${formatBRL(valorComGarantia)}*\n` +
                  `Parcelamento: *${meses}x de ${formatBRL(valorParcela)}*\n` +
                  `Vencimento: Dia ${diaPagamento}\n\n` +
                  `_Simulação sujeita à análise de crédito._`;

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
}

// --- UTILITÁRIOS ---
function mostrarAlerta(mensagem, tipo = 'warning') {
    const icons = { warning: 'exclamation-triangle-fill', success: 'check-circle-fill' };
    const alerta = document.createElement('div');
    alerta.className = `alert alert-${tipo} position-fixed top-0 start-50 translate-middle-x mt-3`;
    alerta.style.zIndex = '9999';
    alerta.innerHTML = `<i class="bi bi-${icons[tipo]} me-2"></i><span>${mensagem}</span>`;
    document.body.appendChild(alerta);
    setTimeout(() => alerta.remove(), 3000);
}

function setupCPFFormatting() {
    document.getElementById('clientCPF').addEventListener('input', e => {
        let v = e.target.value.replace(/\D/g, '').substring(0, 11);
        v = v.replace(/(\d{3})(\d)/, '$1.$2');
        v = v.replace(/(\d{3})(\d)/, '$1.$2');
        v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        e.target.value = v;
    });
}