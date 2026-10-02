import * as THREE from 'three';
import { vertexShader, fragmentShader } from './shaders.js';
import { criarSpriteIcone, criarQuadradoNo } from './treeNodes.js';

let folhas = [];
let nosArvore = [];
let numProcessadas = 0;
let texturaPapel = null;

// Carregador de textura
const textureLoader = new THREE.TextureLoader();
texturaPapel = textureLoader.load('textura-papel.jpg');

export function getFolhas() {
    return folhas;
}

export function getNosArvore() {
    return nosArvore;
}

/**
 * ANIMAÇÃO 1: SPLITTING - Cria e posiciona o grid de folhas (chunks) no Three.js
 * @param {THREE.Scene} scene A cena Three.js
 * @param {number} totalChunks Número total de chunks
 */
export function animarSeparacaoDeFolhas(scene, totalChunks) {
    numProcessadas = 0;

    // Limpa cena anterior se houver
    folhas.forEach(f => scene.remove(f.mesh));
    folhas = [];
    nosArvore.forEach(n => scene.remove(n));
    nosArvore = [];

    const baseScale = Math.min(2.0, 6.0 / Math.sqrt(totalChunks));
    const folhaWidth = 1.2 * baseScale;
    const folhaHeight = 1.68 * baseScale;

    const geometry = new THREE.PlaneGeometry(folhaWidth, folhaHeight);

    const colunas = Math.ceil(Math.sqrt(totalChunks));
    const linhas = Math.ceil(totalChunks / colunas);
    const espacamentoX = folhaWidth * 1.2;
    const espacamentoY = folhaHeight * 1.2;

    const offsetX = (colunas * espacamentoX) / 2 - (espacamentoX / 2);
    const offsetY = (linhas * espacamentoY) / 2 - (espacamentoY / 2);

    for (let i = 0; i < totalChunks; i++) {
        const material = new THREE.ShaderMaterial({
            uniforms: {
                uTexture: { value: texturaPapel },
                uTime: { value: 0 },
                uPerplexity: { value: 1.0 },
                uBurstiness: { value: 0.0 },
                uOpacity: { value: 0.0 },
                uIsFinished: { value: 0.0 },
                uId: { value: i * 1.0 },
                uColor1: { value: new THREE.Color('#318bf7') },
                uColor2: { value: new THREE.Color('#bada4c') },
                uColor3: { value: new THREE.Color('#e35058') }
            },
            vertexShader,
            fragmentShader,
            transparent: true,
            side: THREE.DoubleSide
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0, 0, 0);

        const row = Math.floor(i / colunas);
        const col = i % colunas;
        const targetX = (col * espacamentoX) - offsetX;
        const targetY = (row * -espacamentoY) + offsetY;

        mesh.renderOrder = 1;
        scene.add(mesh);

        folhas.push({
            id: i,
            mesh: mesh,
            targetPos: new THREE.Vector3(targetX, targetY, 0),
            basePos: new THREE.Vector3(targetX, targetY, 0),
            burstiness: 0,
            perplexity: 0,
            predicaoIA: null,
            isProcessed: false
        });
    }
}

/**
 * ANIMAÇÃO 2: MÉTRICAS - Atualiza a folha individual com base nos dados recebidos do backend
 */
export function atualizarFolha(chunkId, perplexity, burstiness, predicaoIA) {
    const folha = folhas[chunkId];
    if (!folha) return;

    folha.burstiness = burstiness;
    folha.perplexity = perplexity;
    folha.predicaoIA = predicaoIA;
    folha.isProcessed = true;

    numProcessadas++;

    const colunas = Math.ceil(Math.sqrt(folhas.length));
    const baseScale = Math.min(2.0, 6.0 / Math.sqrt(folhas.length));
    const folhaWidth = 1.2 * baseScale;
    const espacamentoX = folhaWidth * 1.2;
    const offsetX = (colunas * espacamentoX) / 2 - (espacamentoX / 2);

    const leftStackX = -offsetX - folhaWidth * 1.3;
    const leftStackY = 0;
    const leftStackZ = numProcessadas * 0.05;

    folha.targetPos.set(leftStackX, leftStackY, leftStackZ);
    folha.mesh.renderOrder = 0;

    if (numProcessadas === folhas.length) {
        folhas.forEach((f, idx) => {
            f.targetPos.set(0, -1, idx * 0.05);
        });
    }

    const maxPerplexity = 1000;
    const pNormalizada = Math.min(Math.max(perplexity / maxPerplexity, 0), 1);

    folha.mesh.material.uniforms.uPerplexity.value = pNormalizada;
    folha.mesh.material.uniforms.uBurstiness.value = burstiness;
}

/**
 * ANIMAÇÃO 3: INFERENCE - Árvore de decisão e convergência das folhas para Humano / IA
 * @param {THREE.Scene} scene A cena Three.js
 * @param {boolean} modoEscuroAtivo Estado do tema escuro
 */
export function animarFluxoInferencia(scene, modoEscuroAtivo = false) {
    return new Promise((resolve) => {
        const matRaiz = new THREE.MeshStandardMaterial({ color: 0xffcc00, emissive: 0xffcc00, emissiveIntensity: 0.6 });
        const noRaiz = new THREE.Mesh(new THREE.SphereGeometry(0.8, 32, 32), matRaiz);
        noRaiz.position.set(0, -1, 0);
        noRaiz.visible = false;
        scene.add(noRaiz);
        nosArvore.push(noRaiz);

        const noHumano = criarQuadradoNo(0x4da8da);
        noHumano.position.set(-4.5, -4.8, 0);
        noHumano.add(criarSpriteIcone('draw', modoEscuroAtivo));
        scene.add(noHumano);
        nosArvore.push(noHumano);

        const noIA = criarQuadradoNo(0xff3333);
        noIA.position.set(4.5, -4.8, 0);
        noIA.add(criarSpriteIcone('smart_toy', modoEscuroAtivo));
        scene.add(noIA);
        nosArvore.push(noIA);

        folhas.forEach(folha => {
            folha.burstiness = 0;
            folha.targetPos.copy(noRaiz.position);
        });

        setTimeout(() => {
            folhas.forEach(folha => {
                const classificadoComoIA = folha.predicaoIA != null
                    ? folha.predicaoIA === 1
                    : folha.perplexity < 300;
                folha.targetPos.copy(classificadoComoIA ? noIA.position : noHumano.position);
            });
        }, 1500);

        setTimeout(() => {
            folhas.forEach(f => {
                f.mesh.scale.set(0.01, 0.01, 0.01);
                f.mesh.material.uniforms.uIsFinished.value = 1.0;
            });
            nosArvore.forEach(n => n.scale.set(0.01, 0.01, 0.01));

            setTimeout(() => {
                limparCena(scene);
                resolve();
            }, 300);
        }, 3500);
    });
}

/**
 * Limpa objetos da cena e libera memória da GPU
 * @param {THREE.Scene} scene A cena Three.js
 */
export function limparCena(scene) {
    folhas.forEach(f => {
        if (scene) scene.remove(f.mesh);
        f.mesh.geometry.dispose();
        f.mesh.material.dispose();
    });
    folhas = [];

    const descartarMaterial = (material) => {
        if (!material) return;
        if (Array.isArray(material)) material.forEach(m => m.dispose());
        else material.dispose();
    };

    nosArvore.forEach(n => {
        n.children.forEach(child => {
            if (child.material) {
                if (child.material.map) child.material.map.dispose();
                descartarMaterial(child.material);
            }
            if (child.geometry && !child.isSprite) child.geometry.dispose();
        });
        if (scene) scene.remove(n);
        n.geometry.dispose();
        descartarMaterial(n.material);
    });
    nosArvore = [];
}
