import * as THREE from 'three';
import {
    criarBackground,
    atualizarGridBackground,
    atualizarTimeBackground,
    atualizarUniformsBackground
} from './background.js';
import {
    animarSeparacaoDeFolhas as splitFolhas,
    atualizarFolha as updateFolha,
    animarFluxoInferencia as inferenciaFolhas,
    limparCena as resetCena,
    getFolhas
} from './leafManager.js';

let scene, camera, renderer;
let estadoAtual = 'aguardando'; // 'aguardando', 'processando', 'inferencia'
const clock = new THREE.Clock();
let modoEscuroAtivo = false;

/**
 * Inicializa a cena Three.js, câmera, renderizador, luzes e redimensionamento
 */
export function initThreeJS() {
    const canvas = document.getElementById('three-canvas');
    if (!canvas) return;

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 15;

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        atualizarGridBackground();
    });

    criarBackground(scene);
    animate();
}

/**
 * Loop principal de animação e renderização
 */
function animate() {
    requestAnimationFrame(animate);
    const tempo = clock.getElapsedTime();

    atualizarTimeBackground(tempo);

    const folhas = getFolhas();
    folhas.forEach(folha => {
        if (folha.mesh.material.uniforms) {
            folha.mesh.material.uniforms.uTime.value = tempo;

            if (folha.mesh.material.uniforms.uOpacity.value < 1.0) {
                folha.mesh.material.uniforms.uOpacity.value += 0.02;
            }
        }

        if (estadoAtual === 'processando' && !folha.isProcessed) {
            const hoverZ = Math.sin(tempo * 2.2 + folha.id * 0.7) * 0.22;
            const targetComHover = folha.targetPos.clone();
            targetComHover.z += hoverZ;

            folha.mesh.position.lerp(targetComHover, 0.06);

            const targetRotX = Math.sin(tempo * 1.4 + folha.id) * 0.04;
            const targetRotY = Math.cos(tempo * 1.1 + folha.id * 1.3) * 0.05;
            folha.mesh.rotation.x += (targetRotX - folha.mesh.rotation.x) * 0.08;
            folha.mesh.rotation.y += (targetRotY - folha.mesh.rotation.y) * 0.08;
        } else {
            folha.mesh.position.lerp(folha.targetPos, 0.07);
            folha.mesh.rotation.x += (0 - folha.mesh.rotation.x) * 0.12;
            folha.mesh.rotation.y += (0 - folha.mesh.rotation.y) * 0.12;
            folha.mesh.rotation.z += (0 - folha.mesh.rotation.z) * 0.12;
        }

        const targetFinished = (folha.isProcessed || estadoAtual === 'inferencia' || estadoAtual === 'aguardando') ? 1.0 : 0.0;
        folha.mesh.material.uniforms.uIsFinished.value += (targetFinished - folha.mesh.material.uniforms.uIsFinished.value) * 0.05;
    });

    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

/**
 * Dispara a animação de "splitting": cria e distribui as folhas (chunks) na
 * cena e marca o estado atual como 'processando'.
 * @param {number} totalChunks Número total de chunks recebidos do backend
 */
export function animarSeparacaoDeFolhas(totalChunks) {
    estadoAtual = 'processando';
    splitFolhas(scene, totalChunks);
}

/**
 * Repassa as métricas de um chunk processado para a folha correspondente na cena.
 * @param {number} chunkId Índice do chunk
 * @param {number} perplexity Perplexity calculada para o chunk
 * @param {number} burstiness Burstiness calculada para o chunk
 * @param {number|null} predicaoIA Predição do ExtraTrees (0=Humano, 1=IA) ou null
 */
export function atualizarFolha(chunkId, perplexity, burstiness, predicaoIA) {
    updateFolha(chunkId, perplexity, burstiness, predicaoIA);
}

/**
 * Dispara a animação final de inferência (convergência das folhas para os nós
 * "Humano"/"IA") e volta o estado para 'aguardando' ao concluir.
 * @returns {Promise<void>} Resolvida quando a animação termina
 */
export function animarFluxoInferencia() {
    estadoAtual = 'inferencia';
    return inferenciaFolhas(scene, modoEscuroAtivo).then(() => {
        estadoAtual = 'aguardando';
    });
}

/** Remove todas as folhas e nós da cena e volta o estado para 'aguardando'. */
export function limparCena() {
    estadoAtual = 'aguardando';
    resetCena(scene);
}

/**
 * Atualiza o uniform do shader de fundo indicando se o estilo visual do IF está ativo.
 * @param {string} estilo Caminho da folha de estilo atual (ex: '/styleIF.css')
 */
export function setEstiloAtual(estilo) {
    atualizarUniformsBackground(estilo === '/styleIF.css', modoEscuroAtivo);
}

/**
 * Atualiza o estado global de modo escuro e propaga para o shader de fundo.
 * @param {boolean} isDark Se o modo escuro está ativo
 */
export function setModoEscuro(isDark) {
    modoEscuroAtivo = isDark;
    atualizarUniformsBackground(undefined, isDark);
}
