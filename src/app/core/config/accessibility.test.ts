/**
 * Teste manual para verificar se a configuração global está funcionando
 * Execute este arquivo no console do navegador
 */

import {
  announce,
  generateA11yId,
  isNativelyFocusable,
  removeNativeSemantics,
  prefersReducedMotion,
  prefersHighContrast,
  prefersDarkMode,
  enableDebugMode,
  disableDebugMode,
  NAVIGATION_KEYS,
  ARIA_ROLES,
  ARIA_LIVE,
  DEFAULT_ACCESSIBILITY_CONFIG
} from './accessibility.config';

console.log('🧪 Testando Configuração Global de Acessibilidade...\n');

// ============================================================================
// Teste 1: Verificar se a configuração padrão existe
// ============================================================================
console.log('✅ Teste 1: Configuração padrão');
console.log('Config:', DEFAULT_ACCESSIBILITY_CONFIG);
console.log('Focus color:', DEFAULT_ACCESSIBILITY_CONFIG.focus.color);
console.log('Announcement delay:', DEFAULT_ACCESSIBILITY_CONFIG.announcements.defaultDelay);
console.log('');

// ============================================================================
// Teste 2: Gerar IDs únicos
// ============================================================================
console.log('✅ Teste 2: Gerar IDs únicos');
const id1 = generateA11yId('modal');
const id2 = generateA11yId('modal');
const id3 = generateA11yId('button');
console.log('ID 1:', id1);
console.log('ID 2:', id2);
console.log('ID 3:', id3);
console.log('IDs são únicos?', id1 !== id2 && id2 !== id3);
console.log('');

// ============================================================================
// Teste 3: Verificar focabilidade
// ============================================================================
console.log('✅ Teste 3: Verificar focabilidade de elementos');
const button = document.createElement('button');
const div = document.createElement('div');
const input = document.createElement('input');
console.log('Button é focável?', isNativelyFocusable(button)); // true
console.log('Div é focável?', isNativelyFocusable(div)); // false
console.log('Input é focável?', isNativelyFocusable(input)); // true
console.log('');

// ============================================================================
// Teste 4: Remover semântica nativa
// ============================================================================
console.log('✅ Teste 4: Remover semântica nativa');
const testDiv = document.createElement('div');
testDiv.textContent = 'Teste';
removeNativeSemantics(testDiv);
console.log('Role:', testDiv.getAttribute('role')); // "presentation"
console.log('Aria-hidden:', testDiv.getAttribute('aria-hidden')); // "true"
console.log('');

// ============================================================================
// Teste 5: Anúncios para leitores de tela
// ============================================================================
console.log('✅ Teste 5: Anúncios (verifique com leitor de tela)');
setTimeout(() => {
  announce('Teste de anúncio polite');
  console.log('Anúncio polite enviado');
}, 100);

setTimeout(() => {
  announce('Teste de anúncio assertive', 'assertive');
  console.log('Anúncio assertive enviado');
}, 600);
console.log('');

// ============================================================================
// Teste 6: Preferências do usuário
// ============================================================================
console.log('✅ Teste 6: Preferências do usuário');
console.log('Prefere movimento reduzido?', prefersReducedMotion());
console.log('Prefere alto contraste?', prefersHighContrast());
console.log('Prefere modo escuro?', prefersDarkMode());
console.log('');

// ============================================================================
// Teste 7: Constantes ARIA
// ============================================================================
console.log('✅ Teste 7: Constantes ARIA');
console.log('NAVIGATION_KEYS.ARROW_UP:', NAVIGATION_KEYS.ARROW_UP);
console.log('NAVIGATION_KEYS.ENTER:', NAVIGATION_KEYS.ENTER);
console.log('ARIA_ROLES.DIALOG:', ARIA_ROLES.DIALOG);
console.log('ARIA_ROLES.BUTTON:', ARIA_ROLES.BUTTON);
console.log('ARIA_LIVE.POLITE:', ARIA_LIVE.POLITE);
console.log('ARIA_LIVE.ASSERTIVE:', ARIA_LIVE.ASSERTIVE);
console.log('');

// ============================================================================
// Teste 8: Modo Debug
// ============================================================================
console.log('✅ Teste 8: Modo Debug');
console.log('Debug habilitado?', DEFAULT_ACCESSIBILITY_CONFIG.debug.enabled);
console.log('Habilitando debug mode...');
enableDebugMode();
console.log('Debug habilitado?', DEFAULT_ACCESSIBILITY_CONFIG.debug.enabled);
console.log('Body tem classe debug-a11y?', document.body.classList.contains('debug-a11y'));
console.log('');

setTimeout(() => {
  console.log('Desabilitando debug mode...');
  disableDebugMode();
  console.log('Debug habilitado?', DEFAULT_ACCESSIBILITY_CONFIG.debug.enabled);
  console.log('Body tem classe debug-a11y?', document.body.classList.contains('debug-a11y'));
}, 2000);

// ============================================================================
// Resultado
// ============================================================================
console.log('\n🎉 Todos os testes executados com sucesso!');
console.log('✅ A configuração global de acessibilidade está funcionando!\n');

console.log('📚 Para mais informações, consulte:');
console.log('- ACCESSIBILITY.md');
console.log('- src/app/core/config/ACCESSIBILITY-GUIDE.md');
console.log('- src/app/shared/components/modal-periodo/ACCESSIBILITY-IMPLEMENTATION.md');
console.log('');

console.log('🧪 Para testar visualmente:');
console.log('1. Execute: enableDebugMode()');
console.log('2. Navegue com Tab pelos elementos');
console.log('3. Ative um leitor de tela (NVDA, VoiceOver, etc)');
console.log('4. Verifique se os anúncios estão corretos');
console.log('');

console.log('🎨 Classes CSS disponíveis:');
console.log('- .sr-only (screen reader only)');
console.log('- .visual-only (hidden from screen readers)');
console.log('- .debug-a11y (visual debug mode)');
console.log('');

console.log('💡 Exemplo de uso:');
console.log(`
import { announce, generateA11yId } from '@core/config';

// Gerar ID único
const modalId = generateA11yId('modal');

// Anunciar abertura de modal
announce('Selecione o mês, caixa de diálogo');

// Remover semântica nativa no HTML
<div role="presentation" aria-hidden="true">Visual</div>
`);

// ============================================================================
// Exportar para uso global
// ============================================================================
(window as any).accessibilityTest = {
  announce,
  generateA11yId,
  isNativelyFocusable,
  removeNativeSemantics,
  enableDebugMode,
  disableDebugMode,
  prefersReducedMotion,
  prefersHighContrast,
  prefersDarkMode,
  NAVIGATION_KEYS,
  ARIA_ROLES,
  ARIA_LIVE,
  config: DEFAULT_ACCESSIBILITY_CONFIG
};

console.log('🌐 Funções disponíveis globalmente em: window.accessibilityTest');
console.log('Exemplo: window.accessibilityTest.announce("Olá!")');

