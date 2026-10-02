import { limparCena } from '../scene/index.js';

let historicoChunksRef = [];

/**
 * Define a referência (array mutável) do histórico de chunks usada ao
 * resetar a UI, para que `resetarUI` limpe os mesmos dados exibidos em main.js.
 * @param {Array} ref Array de histórico de chunks compartilhado com main.js
 */
export function setHistoricoChunksRef(ref) {
    historicoChunksRef = ref;
}

/**
 * Configura os elementos de upload: seleção de arquivo, drag-and-drop global
 * (com overlay visual) e reset da UI.
 * @returns {{resetarUI: function(): void}} Função para restaurar a UI ao estado inicial
 */
export function inicializarUploadHandlers() {
    const fileInput = document.getElementById('file-upload');
    const submitBtn = document.getElementById('submit-btn');
    const dropTitle = document.querySelector('.drop-title');
    const fileTypesInfo = document.getElementById('file-types-info');
    const uploadForm = document.getElementById('upload-form');

    const sectionUpload = document.getElementById('upload-section');
    const sectionLoading = document.getElementById('loading-section');
    const sectionResults = document.getElementById('results-section');
    const sectionHero = document.getElementById('hero-section');
    const btnReset = document.getElementById('reset-btn');

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                if (dropTitle) dropTitle.textContent = `Arquivo selecionado: ${e.target.files[0].name}`;
                if (fileTypesInfo) fileTypesInfo.classList.add('hidden');
                if (submitBtn) submitBtn.disabled = false;
            } else {
                resetarUI();
            }
        });
    }

    // Lógica de Drag and Drop Global
    const dropOverlay = document.createElement('div');
    dropOverlay.className = "fixed inset-0 z-[200] hidden bg-primary/20 backdrop-blur-sm border-4 border-dashed border-primary flex items-center justify-center pointer-events-none transition-all duration-300";
    dropOverlay.innerHTML = `<h2 class="text-4xl font-bold text-primary drop-shadow-lg bg-white/80 dark:bg-black/60 px-8 py-4 rounded-2xl">Solte o arquivo aqui</h2>`;
    document.body.appendChild(dropOverlay);

    let dragCounter = 0;

    document.addEventListener('dragenter', (e) => {
        e.preventDefault();
        dragCounter++;
        dropOverlay.classList.remove('hidden');
    });

    document.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    document.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dragCounter--;
        if (dragCounter === 0) {
            dropOverlay.classList.add('hidden');
        }
    });

    document.addEventListener('drop', (e) => {
        e.preventDefault();
        dragCounter = 0;
        dropOverlay.classList.add('hidden');

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0 && fileInput) {
            fileInput.files = e.dataTransfer.files;
            const event = new Event('change');
            fileInput.dispatchEvent(event);
        }
    });

    function resetarUI() {
        if (uploadForm) uploadForm.reset();
        if (dropTitle) dropTitle.textContent = 'Arraste seu arquivo ou clique aqui';
        if (fileTypesInfo) fileTypesInfo.classList.remove('hidden');
        if (submitBtn) submitBtn.disabled = true;

        if (sectionResults) sectionResults.classList.add('hidden');
        if (sectionLoading) sectionLoading.classList.add('hidden');
        if (sectionUpload) sectionUpload.classList.remove('hidden');
        if (sectionHero) sectionHero.classList.remove('hidden');
        
        if (historicoChunksRef) {
            historicoChunksRef.length = 0;
        }
        limparCena();

        const alertaTela = document.getElementById('res-injection-alert');
        const alertaRelatorio = document.getElementById('rep-injection-alert');
        if (alertaTela) alertaTela.classList.add('hidden');
        if (alertaRelatorio) alertaRelatorio.style.display = 'none';
    }

    if (btnReset) {
        btnReset.addEventListener('click', resetarUI);
    }

    return { resetarUI };
}
