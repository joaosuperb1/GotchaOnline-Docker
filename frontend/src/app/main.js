/**
 * Ponto de entrada da aplicação. Inicializa a cena 3D, o tema, os handlers de
 * upload/drag-and-drop e os modais, e conecta o envio do formulário ao
 * streaming NDJSON do backend.
 */
import { initThreeJS } from '../scene/index.js';
import { inicializarTema } from './theme.js';
import { inicializarUploadHandlers, setHistoricoChunksRef } from './uploadHandler.js';
import { inicializarModais } from './modals.js';
import { enviarArquivoStream } from './apiService.js';
import { processarEvento } from './eventProcessor.js';

document.addEventListener('DOMContentLoaded', () => {
    // Array mutável em memória para guardar histórico de todos os chunks processados
    const historicoChunks = [];
    setHistoricoChunksRef(historicoChunks);

    // 1. Inicializa o cenário 3D Three.js
    initThreeJS();

    // 2. Inicializa o tema (Modo Escuro / Claro)
    inicializarTema();

    // 3. Inicializa os handlers de upload e drag-and-drop
    const { resetarUI } = inicializarUploadHandlers();

    // 4. Inicializa os modais e a geração de PDF
    inicializarModais(historicoChunks);

    // 5. Configuração do envio do formulário
    const uploadForm = document.getElementById('upload-form');
    const fileInput = document.getElementById('file-upload');
    const sectionUpload = document.getElementById('upload-section');
    const sectionHero = document.getElementById('hero-section');
    const sectionLoading = document.getElementById('loading-section');

    if (uploadForm) {
        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const file = fileInput ? fileInput.files[0] : null;
            if (!file) return;

            // Transiciona estado da UI para Loading
            if (sectionUpload) sectionUpload.classList.add('hidden');
            if (sectionHero) sectionHero.classList.add('hidden');
            if (sectionLoading) sectionLoading.classList.remove('hidden');

            window.scrollTo({ top: 0, behavior: 'smooth' });

            try {
                await enviarArquivoStream(file, async (data) => {
                    await processarEvento(data, historicoChunks);
                });
            } catch (error) {
                console.error("Erro no processamento:", error);
                alert("Erro ao processar o arquivo. Detalhes: " + error.message);
                resetarUI();
            }
        });
    }
});
