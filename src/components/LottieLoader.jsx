import { Player } from "@lottiefiles/react-lottie-player";
import loadingAnim from "../assets/lottie/loading.json";

export default function LottieLoader() {
    return (
        <div className="flex items-center justify-center py-8">
            <Player autoplay loop src={loadingAnim} style={{ height: 120, width: 120 }} />
        </div>
    );
}
