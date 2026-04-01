export function preloadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
        img.src = src;
    });
}

export function preloadAudio(src: string, volume = 0.5): Promise<HTMLAudioElement> {
    return new Promise((resolve, reject) => {
        const audio = new Audio();
        const onReady = () => {
            cleanup();
            audio.volume = volume;
            resolve(audio);
        };
        const onError = () => {
            cleanup();
            reject(new Error(`Failed to load audio: ${src}`));
        };
        const cleanup = () => {
            audio.removeEventListener("canplaythrough", onReady);
            audio.removeEventListener("error", onError);
        };

        audio.preload = "auto";
        audio.volume = volume;
        audio.addEventListener("canplaythrough", onReady, { once: true });
        audio.addEventListener("error", onError, { once: true });
        audio.src = src;
        audio.load();
    });
}