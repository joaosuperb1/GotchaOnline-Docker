/**
 * Configuração do ambiente e endpoints da API. `VITE_BACKEND_URL` e
 * `VITE_HF_TOKEN` são injetadas em tempo de build pelo Vite (ver
 * frontend/Dockerfile); os valores abaixo são o fallback para o demo público
 * hospedado no Hugging Face Spaces.
 */
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://superbi-gotcha-online-api.hf.space/processar';
export const HF_TOKEN = import.meta.env.VITE_HF_TOKEN || null;
