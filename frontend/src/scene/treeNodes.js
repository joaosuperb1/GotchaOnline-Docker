import * as THREE from 'three';

// Pré-aquece a fonte de ícones para que os glifos já estejam prontos ao desenhar os sprites
if (typeof document !== 'undefined' && document.fonts && document.fonts.load) {
    document.fonts.load('64px "Material Symbols Outlined"').catch(() => { });
}

/**
 * Cria um sprite 2D com um glifo do Material Symbols Outlined desenhado em um canvas.
 * @param {string} nomeIcone Nome do ícone no Material Symbols
 * @param {boolean} modoEscuroAtivo Estado do tema escuro
 * @param {number} offsetZ Posição Z
 */
export function criarSpriteIcone(nomeIcone, modoEscuroAtivo = false, offsetZ = 0.06) {
    const tamanho = 128;
    const canvas = document.createElement('canvas');
    canvas.width = tamanho;
    canvas.height = tamanho;
    const ctx = canvas.getContext('2d');
    ctx.font = `${Math.round(tamanho * 0.62)}px "Material Symbols Outlined"`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = modoEscuroAtivo ? '#ffffff' : '#111111';
    ctx.shadowColor = modoEscuroAtivo ? 'rgba(0, 0, 0, 0.35)' : 'rgba(255, 255, 255, 0.6)';
    ctx.shadowBlur = tamanho * 0.06;
    ctx.fillText(nomeIcone, tamanho / 2, tamanho / 2 + tamanho * 0.03);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(1.3, 1.3, 1.3);
    sprite.position.set(0, 0, offsetZ);
    sprite.renderOrder = 10;
    return sprite;
}

/**
 * Cria um nó 2D no estilo squircle (quadrado de cantos arredondados)
 * @param {number|string} corHex Cor em hexadecimal
 */
export function criarQuadradoNo(corHex) {
    const tamanho = 1.7;
    const raio = 0.35;

    const shape = new THREE.Shape();
    const x = -tamanho / 2;
    const y = -tamanho / 2;
    shape.moveTo(x + raio, y);
    shape.lineTo(x + tamanho - raio, y);
    shape.quadraticCurveTo(x + tamanho, y, x + tamanho, y + raio);
    shape.lineTo(x + tamanho, y + tamanho - raio);
    shape.quadraticCurveTo(x + tamanho, y + tamanho, x + tamanho - raio, y + tamanho);
    shape.lineTo(x + raio, y + tamanho);
    shape.quadraticCurveTo(x, y + tamanho, x, y + tamanho - raio);
    shape.lineTo(x, y + raio);
    shape.quadraticCurveTo(x, y, x + raio, y);

    const geo = new THREE.ShapeGeometry(shape);
    const material = new THREE.MeshBasicMaterial({
        color: corHex,
        transparent: true,
        opacity: 0.88,
        depthTest: false,
        side: THREE.DoubleSide
    });
    const quadrado = new THREE.Mesh(geo, material);
    quadrado.renderOrder = 5;

    const points = shape.getPoints(16);
    const geometryPoints = new THREE.BufferGeometry().setFromPoints(points);
    const contorno = new THREE.Line(
        geometryPoints,
        new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, depthTest: false })
    );
    contorno.renderOrder = 6;
    quadrado.add(contorno);

    return quadrado;
}
