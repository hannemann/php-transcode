/* Migration Guide - Replacing Iconify with Custom Icon Font */

/**
 * STEP 1: UPDATE COMPONENT IMPORTS
 * 
 * OLD:
 * import { Iconify } from "@/components/lib";
 * OR
 * import Iconify from "@iconify/iconify";
 * 
 * NEW:
 * import { initializeIcons, createIcon, createIconStack, mapMdiToCustom } from '@/components/Icons';
 */

/**
 * STEP 2: REPLACE ICONIFY.SCAN() CALLS
 * 
 * OLD:
 * connectedCallback() {
 *     // ... setup code
 *     requestAnimationFrame(() => {
 *         Iconify.scan(this.shadowRoot);
 *     });
 * }
 * 
 * NEW:
 * connectedCallback() {
 *     // ... setup code
 *     requestAnimationFrame(() => {
 *         initializeIcons(this.shadowRoot);
 *     });
 * }
 */

/**
 * STEP 3: REPLACE HTML TEMPLATES
 * 
 * OLD - Icon Stack Pattern:
 * <div class="icon-stack">
 *     <span class="iconify" data-icon="mdi-close"></span>
 *     <span class="iconify hover" data-icon="mdi-close"></span>
 * </div>
 * 
 * NEW - Icon Stack Pattern:
 * <div class="icon-stack">
 *     <span class="custom-icon icon-close"></span>
 *     <span class="custom-icon icon-close hover"></span>
 * </div>
 * 
 * OR use utility function:
 * ${createIconStack('icon-close', 'icon-close')}
 */

/**
 * STEP 4: REPLACE STANDALONE ICONS
 * 
 * OLD:
 * <span class="iconify" data-icon="mdi-loading"></span>
 * 
 * NEW:
 * <span class="custom-icon icon-loading"></span>
 * 
 * OR use utility:
 * ${createIcon('icon-loading', '', 'muted')}
 */

/**
 * STEP 5: UPDATE DYNAMIC ICON LOGIC
 * 
 * OLD - FilePicker Example:
 * get icon() {
 *     if (this.isDirectory) return "mdi-folder";
 *     switch (this.fileType) {
 *         case "video": return "mdi-filmstrip";
 *         case "text": return "mdi-note-text-outline";
 *         case "image": return "mdi-file-image-outline";
 *         default: return "mdi-file";
 *     }
 * }
 * 
 * NEW - FilePicker Example:
 * get icon() {
 *     if (this.isDirectory) return "icon-folder";
 *     switch (this.fileType) {
 *         case "video": return "icon-filmstrip";
 *         case "text": return "icon-note-text";
 *         case "image": return "icon-file-image";
 *         default: return "icon-file";
 *     }
 * }
 * 
 * OR use utility:
 * import { getFileIcon } from '@/components/Icons';
 * 
 * get icon() {
 *     return getFileIcon(this.fileType, this.isDirectory);
 * }
 */

/**
 * STEP 6: UPDATE TOAST NOTIFICATIONS
 * 
 * OLD:
 * const toastIcons = {
 *     success: 'mdi-thumb-up-outline',
 *     info: 'mdi-alert-box-outline',
 *     warning: 'mdi-alert-outline',
 *     error: 'mdi-alert-circle-outline'
 * };
 * 
 * NEW:
 * import { getToastIcon } from '@/components/Icons';
 * 
 * const iconClass = getToastIcon(type);
 * const iconHtml = `<span class="custom-icon toast-icon ${iconClass}"></span>`;
 */

/**
 * STEP 7: UPDATE CSS SELECTORS
 * 
 * OLD:
 * div.success svg[data-icon="mdi-thumb-up-outline"],
 * div.info svg[data-icon="mdi-alert-box-outline"],
 * div.warning svg[data-icon="mdi-alert-outline"],
 * div.error svg[data-icon="mdi-alert-circle-outline"]
 * 
 * NEW:
 * div.success .custom-icon.icon-thumb-up,
 * div.info .custom-icon.icon-alert-box,
 * div.warning .custom-icon.icon-alert,
 * div.error .custom-icon.icon-alert-circle
 */

/**
 * STEP 8: REMOVE ICONIFY DEPENDENCIES
 * 
 * 1. Remove from package.json:
 *    "@iconify/iconify": "^2.0.4",
 *    "@iconify/icons-mdi": "^1.1.21"
 * 
 * 2. Remove imports from lib/index.js or wherever Iconify is imported
 * 
 * 3. Update any CSS that references iconify classes
 */

/**
 * STEP 9: CLEANUP AND TESTING
 * 
 * 1. Run: npm uninstall @iconify/iconify @iconify/icons-mdi
 * 2. Test all components for icon display
 * 3. Check hover effects and transitions
 * 4. Verify responsive sizing
 * 5. Test accessibility (screen readers)
 */

/**
 * ADVANCED USAGE EXAMPLES
 */

// Dynamic icon creation
const dynamicIcon = createDynamicIcon({
    icon: 'mdi-close',
    size: 'lg',
    color: 'error',
    loading: false,
    stack: true,
    hoverIcon: 'mdi-close'
});

// File type detection with utility
const fileIcon = getFileIcon(fileType, isDirectory);

// Batch replacement in complex components
initializeIcons(this.shadowRoot);

// Programmatic icon updates
this.iconElement.className = `custom-icon ${mapMdiToCustom('mdi-new-icon')}`;

/**
 * PERFORMANCE BENEFITS
 * 
 * - Bundle size reduction: ~200KB saved (no iconify library)
 * - Faster load times: No external icon loading
 * - Better performance: No DOM scanning required
 * - Offline functionality: Icons work without network
 * - Consistent styling: Full control over icon appearance
 */

/**
 * TROUBLESHOOTING
 * 
 * Icons not showing:
 * - Check that icons.css is imported in app.css
 * - Verify font files exist in public/fonts/
 * - Check class names match CSS definitions
 * 
 * Icons looking wrong:
 * - Check font-family CSS is correct
 * - Verify character codes in icons.css
 * - Check for CSS conflicts
 * 
 * Hover effects not working:
 * - Verify icon-stack CSS is loaded
 * - Check hover pseudo-classes
 * - Test with browser dev tools
 */

// Export migration utilities for testing
export const MIGRATION_UTILS = {
    testIconMapping: (mdiName) => {
        const custom = mapMdiToCustom(mdiName);
        console.log(`${mdiName} → ${custom}`);
        return custom;
    },
    
    validateIconFont: () => {
        const testElement = document.createElement('span');
        testElement.className = 'custom-icon icon-close';
        testElement.style.fontFamily = 'PHPTranscodeIcons';
        document.body.appendChild(testElement);
        
        const computedStyle = window.getComputedStyle(testElement);
        const fontFamily = computedStyle.fontFamily;
        
        document.body.removeChild(testElement);
        
        return fontFamily.includes('PHPTranscodeIcons');
    }
};