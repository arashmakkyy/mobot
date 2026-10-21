// Injected by the manifest at document_start in the MAIN world.
// Runs before any page script, only inside the Mobot simulator iframe.
// Idempotent: Chrome re-runs this script on every iframe navigation, and the
// Window may be reused for same-origin navigations, so avoid the
// "Cannot redefine property: frameElement" error.
if (window.name === 'mobot-simulator') {
    try {
        const descriptor = Object.getOwnPropertyDescriptor(window, 'frameElement');
        const alreadySpoofed = descriptor && descriptor.configurable === false && typeof descriptor.get === 'function';
        if (!alreadySpoofed) {
            Object.defineProperty(window, 'frameElement', {
                get: function () { return null; },
                configurable: false
            });
        }
    } catch (e) { /* already frozen by a previous injection */ }
}

// Modal test bridge. The isolated content script cannot expose a function to
// the page's MAIN world, so define window.displayModale() only when the
// simulator explicitly asks for it. This keeps the global namespace of visited
// sites clean.
window.addEventListener('mobot:enable-modale-helper', function () {
    window.displayModale = function (key) {
        window.dispatchEvent(new CustomEvent('mobot:display-modale', { detail: key }));
    };
}, { once: true });
