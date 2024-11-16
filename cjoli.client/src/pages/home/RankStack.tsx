import CJoliStack from "../../components/CJoliStack";
import RankTable from "../rank/RankTable";

const RankStack = () => {
  return (
    <CJoliStack gap={0} className="col-md-8 mx-auto mt-5">
      <div className="p-2">
        <RankTable />
      </div>
    </CJoliStack>
  );
};

export default RankStack;
