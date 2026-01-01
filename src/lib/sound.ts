export function makeSound(url: string) {
    const base = new Audio(url);
    base.preload = "auto";
    return () => {
        const clone = base.cloneNode(true) as HTMLAudioElement;
        void clone.play();
    };
}
