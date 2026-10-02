/**
 * Shaders GLSL customizados do Gotcha Online.
 *
 * - `vertexShader`/`fragmentShader`: usados pelas folhas de papel (chunks) —
 *   desenham a textura de papel, a aura colorida (Perplexity) e a onda de
 *   varredura animada enquanto o chunk está sendo analisado.
 * - `bgVertexShader`/`bgFragmentShader`: usados pelo plano de fundo —
 *   desenham o grid quadriculado com "respiração" baseada em ruído 2D.
 */

export const vertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;

  void main() {
    vPosition = position;
    vUv = uv;

    // Define a posição final do vértice na tela sem rotação ou distorção
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const bgVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.999, 1.0);
  }
`;

export const bgFragmentShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uGrid;
  uniform float uIsIFStyle;
  uniform float uIsDarkMode;

  float hash(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }
  
  float noise2D(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
          mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
          mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
          f.y
      );
  }

  void main() {
      // Se não for estilo IF, não desenha o background
      if (uIsIFStyle < 0.5) {
          gl_FragColor = vec4(0.0);
          return;
      }

      vec2 gridUv = vUv * uGrid;
      vec2 cellId = floor(gridUv);
      vec2 cellUv = fract(gridUv);

      vec2 centeredUv = cellUv - 0.5;

      // Ruído para intensidade (animação lenta)
      float n = noise2D(cellId * 0.2 + uTime * 0.3);
      
      // Tamanho dinâmico baseado no ruído (menor quando n é menor)
      float sizeValue = mix(0.15, 0.42, n);
      vec2 size = vec2(sizeValue);
      
      float radius = 0.12; // Raio fixo para as bordas arredondadas
      vec2 q = abs(centeredUv) - size + vec2(radius);
      float d = min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - radius;
      
      // Anti-aliasing com constante bem pequena para maior nitidez (antes 0.02, agora 0.005)
      float edge = 0.005;
      float alpha = smoothstep(edge, -edge, d);

      // Cores para claro/escuro
      // Claro: quadrados verdes (cor IF) com opacidade bem baixa
      vec3 lightColor = vec3(0.184, 0.62, 0.255); // #2F9E41
      float lightAlphaMult = 0.7;
      
      // Escuro: quadrados verdes também (brilho verde)
      vec3 darkColor = vec3(0.184, 0.62, 0.255); // #2F9E41
      float darkAlphaMult = 0.5;

      vec3 finalColor = mix(lightColor, darkColor, uIsDarkMode);
      float finalAlphaMult = mix(lightAlphaMult, darkAlphaMult, uIsDarkMode);
      
      // Intensidade animada (mapa de ruído)
      float intensity = mix(0.1, 1.0, n);
      float finalAlpha = alpha * intensity * finalAlphaMult;

      // Fundo sólido
      vec3 bgLight = vec3(0.957, 0.965, 0.973); // #f4f6f8
      vec3 bgDark = vec3(0.102, 0.110, 0.118); // #1a1c1e
      vec3 bgColor = mix(bgLight, bgDark, uIsDarkMode);

      vec3 outColor = mix(bgColor, finalColor, finalAlpha);
      gl_FragColor = vec4(outColor, 1.0);
  }
`;

export const fragmentShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  uniform float uTime;
  uniform float uPerplexity; // 0.0 = IA (Vermelho), 1.0 = Humano (Azul)
  uniform float uBurstiness;
  uniform float uOpacity;
  uniform float uIsFinished; // 0.0 = Analisando, 1.0 = Concluido
  uniform float uId; // ID único da folha para gerar defasagem
  uniform sampler2D uTexture; // Textura do papel
  // Cores
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  // Pseudo-random e Noise Clássico
  float hash(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }
  
  float noise2D(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
          mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
          mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
          f.y
      );
  }
  void main() {
      // ==========================================
      // 1. A FOLHA (Papel/Pergaminho Moderno)
      // ==========================================
      vec4 texColor = texture2D(uTexture, vUv);
      // Cria um tom branco levemente amarelado e mistura sutilmente com a textura original
      vec3 paperColor = mix(texColor.rgb, vec3(0.98, 0.96, 0.90), 0.75);
      
      // ==========================================
      // COR DA AURA (Baseada na Perplexity)
      // ==========================================
      float h = 0.5;
      vec3 auraColor = mix(
          mix(uColor1, uColor2, uPerplexity / h), 
          mix(uColor2, uColor3, (uPerplexity - h) / (1.0 - h)), 
          step(h, uPerplexity)
      );
      // ==========================================
      // 2. ESTADO DE ANÁLISE: Onda de Varredura
      // ==========================================
      // Cria uma defasagem baseada no ID para que as ondas de cada folha sejam dessincronizadas
      float idOffset = uId * 13.37;

      // Duas ondas senoidais deslocadas em fase, amplitude e tempo
      float wave1 = sin(vUv.x * 8.0 + uTime * 2.5 + idOffset) * 0.12;
      float wave2 = sin(vUv.x * 14.0 - uTime * 1.8 + 2.0 - idOffset) * 0.06;
      
      // Faz a varredura subir e descer suavemente usando uma onda senoidal (sem o salto abrupto do fract)
      float scannerY = (sin(uTime * 1.2) * 0.5) + 0.5;
      
      // Calcula a distância da varredura ondulada
      float scanDist = abs(vUv.y - (scannerY + wave1 + wave2));
      
      // Cria o efeito de aura brilhante e difusa ao redor da onda
      float auraScanning = smoothstep(0.4, 0.0, scanDist) * 0.85;

      // ==========================================
      // 3. ESTADO CONCLUÍDO: Aura Estática Limpa (Sem movimento/ruído)
      // ==========================================
      vec2 center = vec2(0.5);
      float radialDist = distance(vUv, center);
      
      // Gradiente radial totalmente estático e limpo
      float auraStatic = smoothstep(0.65, 0.05, radialDist) * 0.7;

      // ==========================================
      // 4. TRANSIÇÃO E RESULTADO FINAL
      // ==========================================
      // Transição suave (mix) entre a onda de varredura e a cor estática final
      float finalAuraIntensity = mix(auraScanning, auraStatic, uIsFinished);
      finalAuraIntensity = clamp(finalAuraIntensity, 0.0, 1.0);

      // Mistura a cor de papel de fundo com a cor da métrica
      vec3 finalColor = mix(paperColor, auraColor, finalAuraIntensity);
      // Aplica a opacidade global da animação
      gl_FragColor = vec4(finalColor, uOpacity);
  }
`;
