import { Card, Form } from "react-bootstrap";
import CJoliCard from "../components/CJoliCard";
import CJoliStack from "../components/CJoliStack";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useCJoli } from "../hooks/useCJoli";

const SelectPage = () => {
  const navigate = useNavigate();
  const { register } = useForm();
  const { tourneys, selectTourney } = useCJoli();

  return (
    <CJoliStack gap={0} className="col-md-8 mx-auto mt-5">
      <div className="p-2">
        <CJoliCard>
          <Card.Body>
            <Form.Select
              size="lg"
              {...register("tourney", {
                onChange: (e: React.FormEvent<HTMLInputElement>) => {
                  const uid = e.currentTarget.value;
                  const tourney = tourneys?.find((t) => t.uid == uid);
                  selectTourney(tourney!);
                  navigate(uid);
                },
              })}
            >
              <option>Select a Tournament</option>
              {tourneys?.map((t) => (
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
