export function makeSound(src: string, volume = 0.5) {
    const audio = new Audio(src);
    audio.preload = "auto";
    audio.volume = volume;
    audio.load();

    return () => {
        try {
            audio.currentTime = 0;
            audio.volume = volume;
            void audio.play();
        } catch {
        }
    };
}