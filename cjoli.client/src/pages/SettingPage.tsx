import {
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Stack,
} from "react-bootstrap";
import { useForm } from "react-hook-form";
import { Tourney } from "../models";
import useUid from "../hooks/useUid";
import * as settingService from "../services/settingService";
import * as cjoliService from "../services/cjoliService";
import TourneySetting from "./setting/TourneySetting";
import TeamsSetting from "./setting/TeamsSetting";
import { useCJoli } from "../hooks/useCJoli";
import useScreenSize from "../hooks/useScreenSize";
import { useToast } from "../hooks/useToast";
import PhasesSetting from "./setting/PhasesSetting";
import Loading from "../components/Loading";
import { SettingProvider } from "../contexts/SettingContext";
import RanksSetting from "./setting/RanksSetting";
import { useQuery } from "@tanstack/react-query";

const SettingPage = () => {
  const { tourney, loadTourney, loadRanking } = useCJoli();
  const uid = useUid();
  const { register, handleSubmit, setValue } = useForm<Tourney>({
    values: tourney,
  });

  const { isMobile } = useScreenSize();
  const { showToast } = useToast();

  const { isLoading } = useQuery({
    queryKey: ["getRanking", uid],
    queryFn: async () => {
      const ranking = await cjoliService.getRanking(uid);
      loadRanking(ranking);
      return ranking;
    },
  });

  const submit = async (tourney: Tourney) => {
    await saveTourney(tourney);
  };

  const saveTourney = async (tourney: Tourney) => {
    const data = await settingService.importTourney(tourney);
    loadTourney(data);
    showToast("success", "Tourney updated");
    return true;
  };

  const buttons = (
    <Stack direction={isMobile ? "vertical" : "horizontal"} gap={3}>
      <div className="p-2">
        <Button variant="primary" type="submit" style={{ width: 200 }}>
          Save
        </Button>
      </div>
    </Stack>
  );

  if (!tourney) {
    return <></>;
  }

  return (
    <Loading ready={!isLoading}>
      <SettingProvider
        tourney={tourney}
        register={register}
        saveTourney={saveTourney}
        setValue={setValue}
      >
        <Container>
          <Card>
            <Row>
              <Col xs={12} className="p-5">
                <Form onSubmit={handleSubmit(submit)}>
                  {buttons}
                  <TourneySetting />
                  <TeamsSetting />
                  <PhasesSetting />
                  <RanksSetting />
                  {buttons}
                </Form>
              </Col>
            </Row>
          </Card>
        </Container>
      </SettingProvider>
    </Loading>
  );
};

export default SettingPage;
