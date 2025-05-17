const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('./check-inactivity.js').then(registration => {
                // Set up activity tracking
                const updateActivity = () => {
                    navigator.serviceWorker.controller?.postMessage({
                        type: 'UPDATE_ACTIVITY'
                    });
                };

                // Track various user activities
                ['mousemove', 'keydown', 'scroll', 'touchstart'].forEach(evt => {
                    document.addEventListener(evt, updateActivity, { passive: true });
                });
                // // Listen for inactivity messages from service worker
                // navigator.serviceWorker.addEventListener("message", (event) => {
                //   if (event.data.type === "INACTIVITY_DETECTED") {
                //     console.log("Inactivity detected");
                //   }
                // });
                return registration;
            });
            if (registration.installing) {
                console.log('Service worker installing');
            } else if (registration.waiting) {
                console.log('Service worker installed');
            } else if (registration.active) {
                console.log('Service worker active');
            }
        } catch (error) {
            console.error(`Registration failed with ${error}`);
        }
    }
};

registerServiceWorker();
