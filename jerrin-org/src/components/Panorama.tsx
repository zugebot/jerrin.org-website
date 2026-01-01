export default function Panorama() {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden">
            <div
                className="fixed inset-0 w-[calc(100%+0.6vw)] h-[calc(100%+1vh)] -ml-[0.3vw] -mt-[0.6vh] blur-[0.2vw] animate-panorama"
                style={{
                    backgroundImage: 'url("/assets/panorama_light.png")',
                    backgroundRepeat: "repeat-x",
                    backgroundSize: "cover",
                }}
            />
        </div>
    );
}
