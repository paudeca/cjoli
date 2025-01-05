import CJoliStack from "../../components/CJoliStack";
import RankTableTourney from "../rank/RankTableTourney";

const RankStack = () => {
  return (
    <CJoliStack gap={0} className="col-md-8 mx-auto mt-5" data-testid="rank">
      <div className="p-2">
        <RankTableTourney />
      </div>
    </CJoliStack>
  );
};

export default RankStack;
