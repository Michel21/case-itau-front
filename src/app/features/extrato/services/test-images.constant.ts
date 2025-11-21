/**
 * Imagens de teste em base64 para demonstração
 * Use estas imagens para testar a funcionalidade de adicionar imagens ao XLS
 */

// Logo Bradesco simples (50x50px) - PNG vermelho
export const LOGO_BRADESCO_TEST = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8BQz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC';

// Logo azul (ícone pequeno 10x10px)
export const ICON_BLUE_TEST = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mNk+M9Qz0AEYBxVSF+FAAhKDveksOjmAAAAAElFTkSuQmCC';

// Logo verde (ícone pequeno 10x10px)
export const ICON_GREEN_TEST = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mNkYPhfz0AEYBxVSF+FAP5FDvcE1Si9AAAAAElFTkSuQmCC';

/**
 * Como usar:
 * 
 * import { LOGO_BRADESCO_TEST } from './test-images.constant';
 * 
 * await extratoService.generate('xls', data, config, {
 *   logoBase64: LOGO_BRADESCO_TEST
 * });
 */

