import { classificarRisco, escaparHtml } from './utils.js';

/**
 * Conecta um modal simples (abrir/fechar/clique-fora-fecha) aos seus botões.
 * @param {HTMLElement} modal Elemento raiz do modal
 * @param {HTMLElement} btnAbrir Botão que abre o modal
 * @param {HTMLElement} btnFechar Botão que fecha o modal
 */
export function configurarModalSimples(modal, btnAbrir, btnFechar) {
    if (!modal || !btnAbrir || !btnFechar) return;
    btnAbrir.addEventListener('click', () => modal.classList.remove('hidden'));
    btnFechar.addEventListener('click', () => modal.classList.add('hidden'));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
    });
}

/**
 * Inicializa todos os modais informativos da página (privacidade,
 * acessibilidade, pesquisa, métricas), a tabela detalhada de chunks e o
 * fluxo de geração de relatório em PDF (via `window.print`).
 * @param {Array} historicoChunks Histórico de chunks processados, usado para
 * preencher a tabela detalhada e o relatório impresso
 */
export function inicializarModais(historicoChunks) {
    configurarModalSimples(
        document.getElementById('modal-privacidade'),
        document.getElementById('footer-privacidade-btn'),
        document.getElementById('close-modal-privacidade')
    );

    configurarModalSimples(
        document.getElementById('modal-acessibilidade'),
        document.getElementById('footer-acessibilidade-btn'),
        document.getElementById('close-modal-acessibilidade')
    );

    configurarModalSimples(
        document.getElementById('modal-pesquisa'),
        document.getElementById('footer-pesquisa-btn'),
        document.getElementById('close-modal-pesquisa')
    );

    configurarModalSimples(
        document.getElementById('modal-metricas'),
        document.getElementById('btn-info-metricas'),
        document.getElementById('close-modal-metricas')
    );

    const modalTabela = document.getElementById('modal-tabela');
    const btnCloseModal = document.getElementById('close-modal');
    const tabelaBody = document.getElementById('tabela-body');
    const cardsMetricas = document.querySelectorAll('.clickable');

    cardsMetricas.forEach(card => {
        card.addEventListener('click', () => {
            if (!tabelaBody) return;
            tabelaBody.innerHTML = '';

            historicoChunks.forEach(chunk => {
                const tr = document.createElement('tr');
                const risco = classificarRisco(chunk.probabilidade_ia);
                tr.innerHTML = `
                    <td># ${chunk.id + 1}</td>
                    <td style="font-size: 0.85em; max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escaparHtml(chunk.snippet || '')}">${escaparHtml(chunk.snippet || '-')}</td>
                    <td>${chunk.perplexity.toFixed(2)}</td>
                    <td>${chunk.burstiness.toFixed(4)}</td>
                    <td>${chunk.tokens || '-'}</td>
                    <td style="color: ${risco.cor}; font-weight: bold;">${risco.label}</td>
                    <td>${chunk.probabilidade_ia !== undefined && chunk.probabilidade_ia !== null ? (chunk.probabilidade_ia * 100).toFixed(1) + '%' : '-'}</td>
                `;
                tabelaBody.appendChild(tr);
            });

            if (modalTabela) modalTabela.classList.remove('hidden');
        });
    });

    if (btnCloseModal && modalTabela) {
        btnCloseModal.addEventListener('click', () => {
            modalTabela.classList.add('hidden');
        });
    }

    if (modalTabela) {
        modalTabela.addEventListener('click', (e) => {
            if (e.target === modalTabela) {
                modalTabela.classList.add('hidden');
            }
        });
    }

    // --- Lógica do Relatório PDF ---
    const btnDownloadPdf = document.getElementById('download-pdf-btn');
    const fileInput = document.getElementById('file-upload');
    const resMeanPerplexity = document.getElementById('res-mean-perplexity');
    const resMeanBurstiness = document.getElementById('res-mean-burstiness');
    const resMeanTokens = document.getElementById('res-mean-tokens');
    const resMeanProbabilidade = document.getElementById('res-mean-probabilidade');
    const repFilename = document.getElementById('rep-filename');
    const repDatetime = document.getElementById('rep-datetime');
    const repMeanPerplexity = document.getElementById('rep-mean-perplexity');
    const repMeanBurstiness = document.getElementById('rep-mean-burstiness');
    const repMeanTokens = document.getElementById('rep-mean-tokens');
    const repMeanProbabilidade = document.getElementById('rep-mean-probabilidade');
    const repTabelaBody = document.getElementById('rep-tabela-body');

    if (btnDownloadPdf) {
        btnDownloadPdf.addEventListener('click', () => {
            if (repFilename && fileInput) repFilename.textContent = fileInput.files[0] ? fileInput.files[0].name : '-';
            if (repDatetime) repDatetime.textContent = new Date().toLocaleString();

            if (repMeanPerplexity && resMeanPerplexity) repMeanPerplexity.textContent = resMeanPerplexity.textContent;
            if (repMeanBurstiness && resMeanBurstiness) repMeanBurstiness.textContent = resMeanBurstiness.textContent;
            if (repMeanTokens && resMeanTokens) repMeanTokens.textContent = resMeanTokens.textContent;
            if (repMeanProbabilidade && resMeanProbabilidade) repMeanProbabilidade.textContent = resMeanProbabilidade.textContent;

            if (repTabelaBody) {
                repTabelaBody.innerHTML = '';
                historicoChunks.forEach(chunk => {
                    const tr = document.createElement('tr');
                    const risco = classificarRisco(chunk.probabilidade_ia);

                    tr.innerHTML = `
                        <td style="padding: 6px; border: 1px solid #ddd; text-align: center;"># ${chunk.id + 1}</td>
                        <td style="padding: 6px; border: 1px solid #ddd; max-width: 250px; word-wrap: break-word;">${escaparHtml(chunk.snippet || '-')}</td>
                        <td style="padding: 6px; border: 1px solid #ddd; text-align: center;">${chunk.perplexity.toFixed(2)}</td>
                        <td style="padding: 6px; border: 1px solid #ddd; text-align: center;">${chunk.burstiness.toFixed(4)}</td>
                        <td style="padding: 6px; border: 1px solid #ddd; text-align: center;">${chunk.tokens || '-'}</td>
                        <td style="padding: 6px; border: 1px solid #ddd; text-align: center; color: ${risco.cor}; font-weight: bold;">${risco.label}</td>
                        <td style="padding: 6px; border: 1px solid #ddd; text-align: center;">${chunk.probabilidade_ia !== undefined && chunk.probabilidade_ia !== null ? (chunk.probabilidade_ia * 100).toFixed(1) + '%' : '-'}</td>
                    `;
                    repTabelaBody.appendChild(tr);
                });
            }

            const tituloOriginal = document.title;
            const nomeArquivo = (fileInput && fileInput.files[0]) ? fileInput.files[0].name.replace(/\.[^/.]+$/, '') : tituloOriginal;
            document.title = nomeArquivo;

            const restaurarTitulo = () => {
                document.title = tituloOriginal;
                window.removeEventListener('afterprint', restaurarTitulo);
            };
            window.addEventListener('afterprint', restaurarTitulo);

            window.print();
        });
    }
}
