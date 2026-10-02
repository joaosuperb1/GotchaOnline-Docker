import { setModoEscuro, setEstiloAtual } from '../scene/index.js';

/**
 * Restaura o tema salvo (claro/escuro) e conecta o botão de alternância,
 * persistindo a escolha em localStorage e propagando o estado para os
 * shaders da cena 3D via `setModoEscuro`/`setEstiloAtual`.
 */
export function inicializarTema() {
    const btnThemeMode = document.getElementById('theme-mode-btn');

    const savedMode = localStorage.getItem('if-color-mode');
    if (savedMode === 'dark') {
        document.body.classList.add('dark-mode');
    }

    setModoEscuro(document.body.classList.contains('dark-mode'));
    setEstiloAtual('/styleIF.css');

    if (btnThemeMode) {
        btnThemeMode.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            const currentMode = isDark ? 'dark' : 'light';
            localStorage.setItem('if-color-mode', currentMode);
            setModoEscuro(isDark);
        });
    }
}
