// Kept separate from device.ts (a client module) so the server layout can
// import the plain string. Must stay in sync with detectDevice().
/**
 * Inline script for <head>: sets data-device on <html> before first paint so
 * CSS can gate expensive effects per platform without waiting for React.
 */
export const DEVICE_BOOT_SCRIPT = `(function(){try{var u=navigator.userAgent,t=navigator.maxTouchPoints>0,d=/iP(hone|od|ad)/.test(u)||(/Macintosh/.test(u)&&navigator.maxTouchPoints>1)?"ios":/Android/i.test(u)?"android":(t&&matchMedia("(max-width: 767px)").matches)?"mobile":"desktop";document.documentElement.setAttribute("data-device",d)}catch(e){}})();`;
