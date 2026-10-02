import { defineConfig } from 'vite';

/**
 * Remove comentários HTML (`<!-- -->`) e linhas de comentário `//` dentro de
 * `<script>` inline (sem `src`) do `index.html` gerado. Os módulos JS/CSS já
 * saem sem comentários por padrão no `vite build` (minificação); este plugin
 * cobre o único arquivo que a minificação padrão não toca: o próprio HTML.
 * Roda apenas no build de produção (`apply: 'build'`), nunca no `vite dev`.
 */
function stripHtmlComments() {
    return {
        name: 'strip-html-comments',
        apply: 'build',
        transformIndexHtml: {
            order: 'post',
            handler(html) {
                return html
                    .replace(/<!--[\s\S]*?-->/g, '')
                    .replace(/(<script(?![^>]*\ssrc=)[^>]*>)([\s\S]*?)(<\/script>)/g, (_match, open, body, close) => {
                        const semComentarios = body
                            .split('\n')
                            .filter((linha) => !linha.trim().startsWith('//'))
                            .join('\n');
                        return `${open}${semComentarios}${close}`;
                    });
            }
        }
    };
}

export default defineConfig({
    plugins: [stripHtmlComments()]
});
