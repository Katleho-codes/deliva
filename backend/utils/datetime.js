"use strict";

// returns the current time in South Africa local time.
// a function so callers get a fresh timestamp per request
// instead of one frozen at module load.
export function now() {
    return new Date().toLocaleString("en-ZA", {
        timeZone: "Africa/Johannesburg",
    });
}

export default now;
