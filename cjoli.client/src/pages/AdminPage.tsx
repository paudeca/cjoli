import {
  Accordion,
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
} from "react-bootstrap";
import CJoliStack from "../components/CJoliStack";
import CJoliCard from "../components/CJoliCard";
import { useApi } from "../hooks/useApi";
import { useMutation, useQuery } from "@tanstack/react-query";
import Loading from "../components/Loading";
import { useCJoli } from "../hooks/useCJoli";
import Select, { MultiValue } from "react-select";
import { useState } from "react";
import { User } from "../models";
import { useToast } from "../hooks/useToast";

const AdminPage = () => {
  const { listUsers } = useApi();
  const { tourneys } = useCJoli();
  const { isLoading, data: users } = useQuery(listUsers());
  const [datas, setDatas] = useState<Record<number, number[]>>({});
  const { saveUserAdminConfig } = useApi();
  const { showToast } = useToast();

  const { mutate: saveAdmins } = useMutation(
    saveUserAdminConfig({
      onSuccess: () => {
        showToast("success", "User config saved");
      },
    })
  );

  const options = tourneys?.map((t) => ({ label: t.name, value: t.id }));

  const onChange =
    (u: User) => (val: MultiValue<{ label: string; value: number }>) => {
      const values = val.map((v) => v.value);
      setDatas({ ...datas, [u.id]: values });
    };

  return (
    <Loading ready={!isLoading}>
      <Container>
        <Card>
          <Row>
            <Col xs={12} className="p-5">
              <CJoliStack gap={0} className="col-md-8 mx-auto mt-5">
                <div className="p-2">
                  <CJoliCard>
                    <Accordion>
                      {users?.map((u) => {
                        const adminTourneys = u.configs
                          ?.filter((c) => c.isAdmin)
                          .map((c) => c.tourneyId);
                        const defaultValue = options?.filter((o) =>
                          adminTourneys?.includes(o.value)
                        );
                        return (
                          <Accordion.Item key={u.id} eventKey={u.login}>
                            <Accordion.Header>{u.login}</Accordion.Header>
                            <Accordion.Body>
                              <Form.Group className="mb-3">
                                <Form.Label>Admin in Tourneys</Form.Label>
                                <Select
                                  isMulti
                                  options={options}
                                  defaultValue={defaultValue}
                                  onChange={onChange(u)}
                                />
                              </Form.Group>
                              <Button
                                onClick={() => {
                                  saveAdmins({
                                    user: u,
                                    admins: datas[u.id] || adminTourneys,
                                  });
                                }}
                              >
                                Save
                              </Button>
                            </Accordion.Body>
                          </Accordion.Item>
                        );
                      })}
                    </Accordion>
                  </CJoliCard>
                </div>
              </CJoliStack>
            </Col>
          </Row>
        </Card>
      </Container>
    </Loading>
  );
};

export default AdminPage;
