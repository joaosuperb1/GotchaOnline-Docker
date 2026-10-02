import { BACKEND_URL, HF_TOKEN } from './config.js';

/**
 * Envia o arquivo ao backend e consome a resposta em streaming NDJSON
 * @param {File} file Arquivo a ser analisado
 * @param {function(object): void} onEventCallback Callback chamado a cada evento lido
 */
export async function enviarArquivoStream(file, onEventCallback) {
    const formData = new FormData();
    formData.append('file', file);

    const headers = HF_TOKEN ? { 'Authorization': HF_TOKEN } : undefined;

    const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers,
        body: formData
    });

    if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const linhas = buffer.split('\n');
        buffer = linhas.pop();

        for (const linha of linhas) {
            if (linha.trim() === '') continue;

            try {
                const data = JSON.parse(linha);
                await onEventCallback(data);
            } catch (e) {
                console.error("Erro ao processar linha de log:", e, "Linha:", linha);
            }
        }
    }
}
