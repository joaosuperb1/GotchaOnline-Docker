import { animarSeparacaoDeFolhas, atualizarFolha, animarFluxoInferencia } from '../scene/index.js';
import { classificarRisco } from './utils.js';

/**
 * Preenche e exibe o aviso de prompt injection na tela de resultados e no
 * relatório de impressão. Os trechos entram via `textContent` (nunca HTML),
 * pois vêm do documento enviado.
 * @param {Array<{trecho: string, contexto: string}>} ocorrencias Trechos suspeitos
 */
function mostrarAlertaInjecao(ocorrencias) {
    const preencher = (lista, estilo) => {
        if (!lista) return;
        lista.replaceChildren();
        ocorrencias.forEach(({ trecho, contexto }) => {
            const li = document.createElement('li');
            li.textContent = `“${contexto || trecho}”`;
            if (estilo) li.style.cssText = estilo;
            lista.appendChild(li);
        });
    };

    const alertaTela = document.getElementById('res-injection-alert');
    const alertaRelatorio = document.getElementById('rep-injection-alert');
    preencher(document.getElementById('res-injection-list'));
    preencher(document.getElementById('rep-injection-list'), 'word-wrap: break-word;');
    if (alertaTela) alertaTela.classList.remove('hidden');
    if (alertaRelatorio) alertaRelatorio.style.display = 'block';
}

/**
 * Processador centralizado de eventos retornados via streaming NDJSON
 * @param {object} data Dados do evento
 * @param {Array} historicoChunks Array mutável onde os dados dos chunks são acumulados
 */
export async function processarEvento(data, historicoChunks) {
    if (data.erro) throw new Error(data.erro);

    const resStatusBox = document.getElementById('res-status-box');
    const resSuspeita = document.getElementById('res-suspeita');
    const resInstructions = document.getElementById('res-instructions');

    const resMeanPerplexity = document.getElementById('res-mean-perplexity');
    const resMeanBurstiness = document.getElementById('res-mean-burstiness');
    const resMeanTokens = document.getElementById('res-mean-tokens');
    const resMeanProbabilidade = document.getElementById('res-mean-probabilidade');

    const sectionLoading = document.getElementById('loading-section');
    const sectionResults = document.getElementById('results-section');

    switch (data.evento) {
        case "conversao_pdf": {
            console.log("Iniciando conversão...");
            const loadingText = document.querySelector('#loading-section p');
            if (loadingText) loadingText.textContent = "Convertendo PDF para análise (isso pode levar alguns segundos)...";
            break;
        }

        case "alerta_injecao": {
            console.warn("Possível prompt injection detectado:", data.ocorrencias);
            mostrarAlertaInjecao(data.ocorrencias || []);
            break;
        }

        case "split": {
            console.log(`Criando ${data.total_chunks} folhas...`);
            const loadingTextSplit = document.querySelector('#loading-section p');
            if (loadingTextSplit) loadingTextSplit.textContent = "Analisando métricas... Aguarde.";
            animarSeparacaoDeFolhas(data.total_chunks);
            break;
        }

        case "metricas_chunk": {
            console.log(`Chunk ${data.chunk_id} processado! P: ${data.perplexity}, B: ${data.burstiness}, Predição IA: ${data.predicao_ia}`);
            atualizarFolha(data.chunk_id, data.perplexity, data.burstiness, data.predicao_ia);
            historicoChunks.push({
                id: data.chunk_id,
                snippet: data.snippet,
                perplexity: data.perplexity,
                burstiness: data.burstiness,
                tokens: data.tokens,
                predicao_ia: data.predicao_ia,
                probabilidade_ia: data.probabilidade_ia
            });
            break;
        }

        case "resultado_final": {
            console.log("Iniciando fluxo de inferência...");
            const finalLoadingText = document.querySelector('#loading-section p');
            if (finalLoadingText) finalLoadingText.textContent = "Compilando resultados na ExtraTrees...";

            await animarFluxoInferencia();

            if (resMeanPerplexity) resMeanPerplexity.textContent = data.media_perplexity;
            if (resMeanBurstiness) resMeanBurstiness.textContent = data.media_burstiness;
            if (resMeanTokens) resMeanTokens.textContent = data.media_tokens;
            if (resMeanProbabilidade) {
                resMeanProbabilidade.textContent = data.media_probabilidade_ia !== undefined && data.media_probabilidade_ia !== null 
                    ? `${(data.media_probabilidade_ia * 100).toFixed(2)}%` 
                    : '-';
            }

            const riscoGeral = classificarRisco(data.media_probabilidade_ia);
            if (resSuspeita) {
                resSuspeita.textContent = riscoGeral.label.replace('Risco ', '');
                resSuspeita.style.color = riscoGeral.cor;
            }
            if (resStatusBox) {
                resStatusBox.style.borderColor = riscoGeral.cor;
                resStatusBox.style.backgroundColor = riscoGeral.corFundo;
            }
            if (resInstructions) resInstructions.textContent = data.instrucoes;

            if (sectionLoading) sectionLoading.classList.add('hidden');
            if (sectionResults) sectionResults.classList.remove('hidden');
            break;
        }
    }
}
