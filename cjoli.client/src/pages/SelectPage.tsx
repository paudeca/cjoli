import { Card, Form } from "react-bootstrap";
import CJoliCard from "../components/CJoliCard";
import CJoliStack from "../components/CJoliStack";
import * as cjoliService from "../services/cjoliService";
import React from "react";
import { Tourney } from "../models";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

const SelectPage = () => {
  const [tourneys, setTourneys] = React.useState<Tourney[]>([]);
  const navigate = useNavigate();
  const { register } = useForm();

  React.useEffect(() => {
    const call = async () => {
      const data = await cjoliService.getTourneys();
      setTourneys(data);
    };
    call();
  }, []);
  return (
    <CJoliStack gap={0} className="col-md-8 mx-auto mt-5">
      <div className="p-2">
        <CJoliCard>
          <Card.Body>
            <Form.Select
              aria-label="Default select example"
              size="lg"
              {...register("tourney", {
                onChange: (e: React.FormEvent<HTMLInputElement>) => {
                  navigate(e.currentTarget.value);
                },
              })}
            >
              <option>Select a Tournament</option>
              {tourneys.map((t) => (
                <option key={t.id} value={t.uid}>
                  {t.name}
                </option>
              ))}
            </Form.Select>
          </Card.Body>
        </CJoliCard>
      </div>
    </CJoliStack>
  );
};

export default SelectPage;
