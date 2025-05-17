const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds
// const INACTIVITY_TIMEOUT = 100; // 15 minutes in milliseconds

// Function to check inactivity
async function checkInactivity() {
    try {
        // Retrieve the last activity time from cache
        const cache = await caches.open('inactivity-cache');
        const lastActivityRequest = await cache.match('last-activity');
        if (lastActivityRequest) {
            const lastActivityTime = parseInt(await lastActivityRequest.text());
            const currentTime = Date.now();

            if (currentTime - lastActivityTime > INACTIVITY_TIMEOUT) {
                // Inactivity detected - perform your action
                self.clients.matchAll().then(clients => {
                    clients.forEach(client => {
                        client.postMessage({
                            type: 'INACTIVITY_DETECTED',
                            message: 'User has been inactive for 15 minutes'
                        });
                    });
                });
            }
        }
    } catch (error) {
        self.console.error('Inactivity check failed:', error);
    }
}

async function checkExpiration(credentials, type) {
    try {
        const expirationDate = new Date(Number(credentials.expiresOn) * 1000 - 100000);
        // const expirationDate = new Date("2024-11-26");
        const currentTime = Date.now();
        if (currentTime > expirationDate) {
            self.clients.matchAll().then(clients => {
                clients.forEach(client => {
                    client.postMessage({
                        type: type === undefined ? 'TOKEN_EXPIRED' : 'TOKEN_EXPIRED_LOADING',
                        // type: "LOG",
                        message: 'The token has expired'
                    });
                });
            });
        } else {
            self.clients.matchAll().then(clients => {
                clients.forEach(client => {
                    client.postMessage({
                        // type: "TOKEN_VALID",
                        type: 'LOG',
                        message: 'The token is valid'
                    });
                });
            });
        }
    } catch (error) {
        console.error('Inactivity check failed:', error);
    }
}

// Periodically check for inactivity
setInterval(checkInactivity, 30000); // Check every minute

// Listener to update last activity time from page
self.addEventListener('message', async event => {
    if (event.data.type === 'UPDATE_ACTIVITY') {
        const cache = await caches.open('inactivity-cache');
        await cache.put('last-activity', new Response(Date.now().toString()));
    } else {
        checkExpiration(event.data.data, event.data.type);
    }
});
