/**
 * Echo exposes an expressive API for subscribing to channels and listening
 * for events that are broadcast by Laravel. Echo and event broadcasting
 * allows your team to easily build robust real-time web applications.
 */
import Echo from "laravel-echo";

import Pusher from "pusher-js";
window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: "reverb",
    key: WEBSOCKETS_APP_KEY,
    wsHost: location.hostname,
    wsPort: WEBSOCKETS_PORT,
    forceTLS: false,
    enabledTransports: ["ws"],
});

window.html = String.raw;
window.css = String.raw;
