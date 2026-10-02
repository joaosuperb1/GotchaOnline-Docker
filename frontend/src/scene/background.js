import * as THREE from 'three';
import { bgVertexShader, bgFragmentShader } from './shaders.js';

let bgMesh = null;

/**
 * Cria a malha do plano de fundo interativo com o shader original do Gotcha
 * @param {THREE.Scene} scene A cena Three.js
 */
export function criarBackground(scene) {
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uGrid: { value: new THREE.Vector2(10, 10) },
            uIsIFStyle: { value: 1.0 },
            uIsDarkMode: { value: 0.0 }
        },
        vertexShader: bgVertexShader,
        fragmentShader: bgFragmentShader,
        transparent: true,
        depthWrite: false,
        depthTest: false
    });

    bgMesh = new THREE.Mesh(geometry, material);
    bgMesh.renderOrder = -100;
    scene.add(bgMesh);

    atualizarGridBackground();
    return bgMesh;
}

/**
 * Recalcula a quantidade de colunas e linhas do grid de fundo conforme o tamanho da janela
 */
export function atualizarGridBackground() {
    if (!bgMesh) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const idealSize = 80.0; // Tamanho ideal de cada quadradinho
    const cols = Math.round(w / idealSize);
    const rows = Math.round(h / idealSize);
    bgMesh.material.uniforms.uGrid.value.set(cols, rows);
}

/**
 * Atualiza o tempo da animação do background
 * @param {number} elapsedTime 
 */
export function atualizarTimeBackground(elapsedTime) {
    if (bgMesh && bgMesh.material.uniforms) {
        bgMesh.material.uniforms.uTime.value = elapsedTime;
    }
}

/**
 * Atualiza as variáveis de estilo no shader de fundo
 * @param {boolean} isIFStyle Se o estilo IF está ativo
 * @param {boolean} isDarkMode Se o modo escuro está ativo
 */
export function atualizarUniformsBackground(isIFStyle, isDarkMode) {
    if (bgMesh && bgMesh.material.uniforms) {
        if (isIFStyle !== undefined) bgMesh.material.uniforms.uIsIFStyle.value = isIFStyle ? 1.0 : 0.0;
        if (isDarkMode !== undefined) bgMesh.material.uniforms.uIsDarkMode.value = isDarkMode ? 1.0 : 0.0;
    }
}

export function getBgMesh() {
    return bgMesh;
}
