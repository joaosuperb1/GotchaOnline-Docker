/**
 * Classifica a probabilidade (0-1) do modelo em uma faixa de risco textual
 * @param {number|null|undefined} probabilidadeIA Probabilidade de 0 a 1
 * @returns {{label: string, cor: string, corFundo: string}}
 */
export function classificarRisco(probabilidadeIA) {
    if (probabilidadeIA === undefined || probabilidadeIA === null) {
        return { label: '-', cor: 'inherit', corFundo: 'transparent' };
    }
    if (probabilidadeIA < 0.34) {
        return { label: 'Risco Baixo', cor: '#2F9E41', corFundo: 'rgba(47, 158, 65, 0.12)' };
    }
    if (probabilidadeIA < 0.67) {
        return { label: 'Risco Médio', cor: '#c99a1c', corFundo: 'rgba(201, 154, 28, 0.12)' };
    }
    return { label: 'Risco Alto', cor: '#C8191E', corFundo: 'rgba(200, 25, 30, 0.12)' };
}

/**
 * Escapa caracteres especiais de HTML (inclusive aspas, para uso em atributos).
 * Necessário ao inserir via `innerHTML` texto vindo do documento enviado.
 * @param {string} texto Texto a escapar
 * @returns {string}
 */
export function escaparHtml(texto) {
    return String(texto).replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}
