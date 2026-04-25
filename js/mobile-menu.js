export function initializeMobileMenu() {
    try {
        const menuButton = document.getElementById('mobile-menu-button');
        if (menuButton) {
            menuButton.addEventListener('click', function() {
                const menu = document.getElementById('mobile-menu');
                if (menu) {
                    menu.classList.toggle('is-open');
                    const open = menu.classList.contains('is-open');
                    menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
                }
            });
        }
    } catch (error) {
        console.error('Error initializing mobile menu:', error);
    }
}