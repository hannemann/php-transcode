/**
 * Icon Utilities - Custom Icon Font Implementation
 * 
 * This replaces the iconify library with a custom icon font solution.
 * Provides utilities for icon mapping, class generation, and legacy support.
 */

// Icon mapping from MDI names to custom icon classes
const ICON_MAP = {
  'mdi-close': 'icon-close',
  'mdi-play': 'icon-play',
  'mdi-chevron-down': 'icon-chevron-down',
  'mdi-chevron-right': 'icon-chevron-right',
  'mdi-menu-down-outline': 'icon-menu-down',
  'mdi-content-save-outline': 'icon-save',
  'mdi-tools': 'icon-tools',
  'mdi-scissors': 'icon-scissors',
  'mdi-content-copy': 'icon-copy',
  'mdi-plus-outline': 'icon-plus',
  'mdi-minus-outline': 'icon-minus',
  'mdi-plus-box-outline': 'icon-plus-box',
  'mdi-minus-box-outline': 'icon-minus-box',
  'mdi-trash-can-outline': 'icon-trash',
  'mdi-reload': 'icon-reload',
  'mdi-cog-outline': 'icon-cog',
  'mdi-loading': 'icon-loading',
  'mdi-circle-outline': 'icon-circle-outline',
  'mdi-thumb-up-outline': 'icon-thumb-up',
  'mdi-alert-box-outline': 'icon-alert-box',
  'mdi-alert-outline': 'icon-alert',
  'mdi-alert-circle-outline': 'icon-alert-circle',
  'mdi-skull-crossbones-outline': 'icon-skull',
  'mdi-folder': 'icon-folder',
  'mdi-filmstrip': 'icon-filmstrip',
  'mdi-note-text-outline': 'icon-note-text',
  'mdi-file-image-outline': 'icon-file-image',
  'mdi-file': 'icon-file',
  'mdi-motion-play-outline': 'icon-motion-play',
  'mdi-swap-vertical-bold': 'icon-swap-vertical',
  'mdi-swap-horizontal-bold': 'icon-swap-horizontal',
  'mdi-mouse': 'icon-mouse',
  'mdi-checkbox-blank-outline': 'icon-checkbox-blank',
  'mdi-checkbox-marked-outline': 'icon-checkbox-marked'
};

// File type to icon mapping
const FILE_TYPE_ICONS = {
  video: 'icon-filmstrip',
  text: 'icon-note-text',
  image: 'icon-file-image',
  directory: 'icon-folder',
  default: 'icon-file'
};

/**
 * Convert MDI icon name to custom icon class
 * @param {string} mdiName - MDI icon name (e.g., 'mdi-close')
 * @returns {string} Custom icon class (e.g., 'icon-close')
 */
export function mapMdiToCustom(mdiName) {
  return ICON_MAP[mdiName] || 'icon-file';
}

/**
 * Get icon class for file type
 * @param {string} fileType - File type ('video', 'text', 'image', etc.)
 * @param {boolean} isDirectory - Whether it's a directory
 * @returns {string} Icon class name
 */
export function getFileIcon(fileType, isDirectory = false) {
  if (isDirectory) {
    return FILE_TYPE_ICONS.directory;
  }
  return FILE_TYPE_ICONS[fileType] || FILE_TYPE_ICONS.default;
}

/**
 * Create icon HTML with custom font
 * @param {string} iconClass - Icon class (e.g., 'icon-close')
 * @param {string} size - Size modifier ('xs', 'sm', 'md', 'lg', 'xl')
 * @param {string} color - Color modifier ('success', 'info', 'warning', 'error', 'muted')
 * @returns {string} HTML string
 */
export function createIcon(iconClass, size = '', color = '') {
  const classes = ['custom-icon', iconClass];
  if (size) classes.push(`icon-${size}`);
  if (color) classes.push(`icon-${color}`);
  
  return `<span class="${classes.join(' ')}" aria-hidden="true"></span>`;
}

/**
 * Create icon stack HTML (replaces iconify stack pattern)
 * @param {string} baseIcon - Base icon class
 * @param {string} hoverIcon - Hover icon class
 * @param {string} size - Size modifier
 * @returns {string} HTML string
 */
export function createIconStack(baseIcon, hoverIcon, size = '') {
  const sizeClass = size ? ` icon-${size}` : '';
  
  return `
    <div class="icon-stack${sizeClass}">
      ${createIcon(baseIcon, '', '')}
      ${createIcon(hoverIcon, '', '')}
    </div>
  `;
}

/**
 * Legacy support - Convert old iconify data-icon to custom icon
 * Scans DOM and replaces iconify elements with custom icons
 * @param {Element|Document} root - Root element to scan (defaults to document)
 */
export function replaceIconifyElements(root = document) {
  const iconifyElements = root.querySelectorAll('.iconify[data-icon]');
  
  iconifyElements.forEach(element => {
    const mdiName = element.getAttribute('data-icon');
    const customClass = mapMdiToCustom(mdiName);
    
    // Replace element attributes
    element.classList.remove('iconify');
    element.classList.add('custom-icon', customClass);
    element.removeAttribute('data-icon');
    element.setAttribute('aria-hidden', 'true');
  });
}

/**
 * Initialize custom icons in a web component
 * Call this in connectedCallback of web components
 * @param {Element} element - Component's shadowRoot or element
 */
export function initializeIcons(element) {
  replaceIconifyElements(element);
}

/**
 * Get icon name for toast notifications
 * @param {string} type - Toast type ('success', 'info', 'warning', 'error')
 * @returns {string} Icon class name
 */
export function getToastIcon(type) {
  const toastIcons = {
    success: 'icon-thumb-up',
    info: 'icon-alert-box',
    warning: 'icon-alert',
    error: 'icon-alert-circle'
  };
  
  return toastIcons[type] || 'icon-alert-box';
}

/**
 * Dynamic icon creation with attributes
 * @param {Object} options - Icon options
 * @param {string} options.icon - Icon name or MDI name
 * @param {string} options.size - Size modifier
 * @param {string} options.color - Color modifier
 * @param {boolean} options.loading - Add loading animation
 * @param {boolean} options.stack - Create icon stack
 * @param {string} options.hoverIcon - Hover icon for stack
 * @returns {string} HTML string
 */
export function createDynamicIcon(options) {
  const {
    icon,
    size = '',
    color = '',
    loading = false,
    stack = false,
    hoverIcon = ''
  } = options;
  
  if (stack && hoverIcon) {
    return createIconStack(icon, hoverIcon, size);
  }
  
  const iconClass = icon.startsWith('mdi-') ? mapMdiToCustom(icon) : icon;
  const classes = ['custom-icon', iconClass];
  
  if (size) classes.push(`icon-${size}`);
  if (color) classes.push(`icon-${color}`);
  if (loading) classes.push('icon-loading');
  
  return `<span class="${classes.join(' ')}" aria-hidden="true"></span>`;
}

// Export constants for external use
export { ICON_MAP, FILE_TYPE_ICONS };

// Default export with all utilities
export default {
  mapMdiToCustom,
  getFileIcon,
  createIcon,
  createIconStack,
  replaceIconifyElements,
  initializeIcons,
  getToastIcon,
  createDynamicIcon,
  ICON_MAP,
  FILE_TYPE_ICONS
};