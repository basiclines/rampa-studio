import "./index.css";
import { Composition } from "remotion";
import { RampaIntro } from "./compositions/RampaIntro";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="RampaIntro"
        component={RampaIntro}
        durationInFrames={780}
        fps={30}
        width={1080}
        height={1080}
      />
    </>
  );
};
