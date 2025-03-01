import {
  Accordion,
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Stack,
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
import ConfirmationModal from "../modals/ConfirmationModal";
import { useModal } from "../hooks/useModal";

const AdminPage = () => {
  const { listUsers } = useApi();
  const { tourneys } = useCJoli();
  const { isLoading, data: users } = useQuery(listUsers());
  const [datas, setDatas] = useState<Record<number, number[]>>({});
  const { saveUserAdminConfig, removeUser } = useApi();
  const { showToast } = useToast();
  const { setShowWithData: showConfirmDeleteUser } =
    useModal<User>("confirmDeleteUser");
  const { mutateAsync: doRemoveUser } = useMutation(removeUser());

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
                              <Stack direction="horizontal" gap={3}>
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
                                <Button
                                  variant="danger"
                                  onClick={() => showConfirmDeleteUser(true, u)}
                                >
                                  Delete User
                                </Button>
                              </Stack>
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
        <ConfirmationModal<User>
          id="confirmDeleteUser"
          title="Delete User"
          onConfirm={doRemoveUser}
          message={(user) =>
            `Are you sure you want to remove this user '${user.login}' ?`
          }
        />
      </Container>
    </Loading>
  );
};

export default AdminPage;
