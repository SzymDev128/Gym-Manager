"use client";
import { useState, useMemo } from "react";
import useSWR from "swr";
import axios from "axios";
import {
  Box,
  Container,
  Heading,
  Text,
  Spinner,
  Table,
  Button,
  Badge,
  Flex,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { useAuth } from "@/contexts/AuthContext";

interface TrainerRecord {
  id: number; // employee id
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  trainer: {
    trainerId: number;
    specialization: string;
    experienceYears: number;
    supervisorId: number | null;
    supervisor?: {
      trainerId: number;
      specialization: string;
      employee: { user: { firstName: string; lastName: string } };
    } | null;
    subordinates: {
      trainerId: number;
      specialization: string;
      employee: { user: { firstName: string; lastName: string } };
    }[];
    classes: { id: number; name: string; startTime: string }[];
  } | null;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function TrainersPage() {
  const { user } = useAuth();
  const { data, error, isLoading, mutate } = useSWR<TrainerRecord[]>(
    "/api/employees?role=trainer",
    fetcher
  );
  const { data: roleData } = useSWR<{ id: number; name: string }[]>(
    "/api/roles?names=ADMIN,RECEPTIONIST,TRAINER",
    fetcher
  );

  const canManage = useMemo(() => {
    if (!user || !roleData) return false;
    const allowed = new Set(roleData.map((r) => r.id));
    return allowed.has(user.roleId);
  }, [user, roleData]);

  const [editingSupervisorFor, setEditingSupervisorFor] = useState<
    number | null
  >(null);
  const [newSupervisorId, setNewSupervisorId] = useState<string>("");

  const trainers = useMemo(() => {
    return (data || []).filter((e) => e.trainer);
  }, [data]);

  const handleSaveSupervisor = async () => {
    if (editingSupervisorFor === null) return;
    const trainerEmployeeId = editingSupervisorFor; // employee id == trainer id
    const supervisorId = newSupervisorId ? Number(newSupervisorId) : null;
    // prevent self-reference
    if (supervisorId === trainerEmployeeId) {
      toaster.create({
        title: "Błąd",
        description: "Trener nie może być własnym przełożonym",
        type: "error",
        duration: 4000,
      });
      return;
    }
    try {
      await axios.patch(`/api/employees/${trainerEmployeeId}`, {
        supervisorId,
      });
      toaster.create({
        title: "Zapisano",
        description: "Przełożony został zaktualizowany",
        type: "success",
        duration: 3000,
      });
      setEditingSupervisorFor(null);
      setNewSupervisorId("");
      mutate();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toaster.create({
        title: "Błąd",
        description: e?.response?.data?.error || "Nie udało się zapisać",
        type: "error",
        duration: 5000,
      });
    }
  };

  return (
    <Box minH="100vh" bg="gray.900">
      <Container maxW="container.xl" py={8}>
        <Heading color="white" mb={2}>
          👥 Hierarchia trenerów
        </Heading>
        <Text color="gray.400" mb={6}>
          Zarządzaj relacją przełożony → podwładny (związek unarny w modelu
          Trainer)
        </Text>
        {isLoading ? (
          <Box textAlign="center" py={10}>
            <Spinner size="xl" />
          </Box>
        ) : error ? (
          <Box
            bg="red.900"
            p={4}
            borderRadius="md"
            border="1px solid"
            borderColor="red.700"
          >
            <Text color="red.200">Nie udało się pobrać trenerów.</Text>
          </Box>
        ) : (
          <Box
            bg="black"
            borderRadius="lg"
            border="1px solid"
            borderColor="gray.800"
            overflow="hidden"
          >
            <Table.Root size="sm" variant="outline">
              <Table.Header>
                <Table.Row bg="black">
                  <Table.ColumnHeader
                    color="gray.200"
                    py={4}
                    borderColor="gray.600"
                  >
                    ID
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                    color="gray.200"
                    py={4}
                    borderColor="gray.600"
                  >
                    Imię i nazwisko
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                    color="gray.200"
                    py={4}
                    borderColor="gray.600"
                  >
                    Specjalizacja
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                    color="gray.200"
                    py={4}
                    borderColor="gray.600"
                  >
                    Doświadczenie
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                    color="gray.200"
                    py={4}
                    borderColor="gray.600"
                  >
                    Przełożony
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                    color="gray.200"
                    py={4}
                    borderColor="gray.600"
                  >
                    Podwładni
                  </Table.ColumnHeader>
                  {canManage && (
                    <Table.ColumnHeader
                      color="gray.200"
                      py={4}
                      borderColor="gray.600"
                      textAlign="right"
                    >
                      Akcje
                    </Table.ColumnHeader>
                  )}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {trainers.map((t, idx) => (
                  <Table.Row
                    key={t.id}
                    bg={idx % 2 === 0 ? "gray.800" : "gray.700"}
                    _hover={{ bg: "gray.600" }}
                    transition="background 0.2s"
                  >
                    <Table.Cell color="gray.200" py={3} borderColor="gray.700">
                      {t.trainer?.trainerId ?? "-"}
                    </Table.Cell>
                    <Table.Cell color="gray.200" py={3} borderColor="gray.700">
                      {t.user.firstName} {t.user.lastName}
                    </Table.Cell>
                    <Table.Cell color="gray.200" py={3} borderColor="gray.700">
                      {t.trainer?.specialization}
                    </Table.Cell>
                    <Table.Cell color="gray.200" py={3} borderColor="gray.700">
                      {t.trainer?.experienceYears} lat
                    </Table.Cell>
                    <Table.Cell color="gray.200" py={3} borderColor="gray.700">
                      {editingSupervisorFor === t.id ? (
                        <Flex gap={2} alignItems="center">
                          <select
                            value={newSupervisorId}
                            onChange={(
                              e: React.ChangeEvent<HTMLSelectElement>
                            ) => setNewSupervisorId(e.target.value)}
                            style={{
                              background: "#111",
                              color: "#e5e5e5",
                              padding: "0.25rem 0.5rem",
                              borderRadius: "0.375rem",
                              border: "1px solid #333",
                              minWidth: "220px",
                            }}
                          >
                            <option value="">Brak</option>
                            {trainers
                              .filter((other) => other.id !== t.id)
                              .map((other) => (
                                <option key={other.id} value={other.id}>
                                  {other.user.firstName} {other.user.lastName}
                                </option>
                              ))}
                          </select>
                          <Button
                            size="xs"
                            colorScheme="purple"
                            onClick={handleSaveSupervisor}
                          >
                            Zapisz
                          </Button>
                          <Button
                            size="xs"
                            onClick={() => {
                              setEditingSupervisorFor(null);
                              setNewSupervisorId("");
                            }}
                          >
                            Anuluj
                          </Button>
                        </Flex>
                      ) : t.trainer?.supervisorId ? (
                        <Badge colorPalette="purple">
                          {t.trainer?.supervisor?.employee.user.firstName}{" "}
                          {t.trainer?.supervisor?.employee.user.lastName}
                        </Badge>
                      ) : (
                        <Badge colorPalette="gray">Brak</Badge>
                      )}
                    </Table.Cell>
                    <Table.Cell color="gray.200" py={3} borderColor="gray.700">
                      {t.trainer?.subordinates.length ? (
                        <Flex wrap="wrap" gap={2}>
                          {t.trainer.subordinates.map((s) => (
                            <Badge key={s.id} colorPalette="cyan">
                              {s.employee.user.firstName}{" "}
                              {s.employee.user.lastName}
                            </Badge>
                          ))}
                        </Flex>
                      ) : (
                        <Text color="gray.400" fontSize="sm">
                          –
                        </Text>
                      )}
                    </Table.Cell>
                    {canManage && (
                      <Table.Cell
                        color="gray.200"
                        py={3}
                        borderColor="gray.700"
                        textAlign="right"
                      >
                        <Button
                          size="xs"
                          mr={2}
                          onClick={() => {
                            setEditingSupervisorFor(t.id);
                            setNewSupervisorId(
                              t.trainer?.supervisorId
                                ? String(t.trainer.supervisorId)
                                : ""
                            );
                          }}
                        >
                          Zmień przełożonego
                        </Button>
                        {t.trainer?.supervisorId && (
                          <Button
                            size="xs"
                            bg="orange.600"
                            color="white"
                            _hover={{ bg: "orange.500" }}
                            onClick={async () => {
                              try {
                                await axios.patch(`/api/employees/${t.id}`, {
                                  supervisorId: null,
                                });
                                toaster.create({
                                  title: "Usunięto",
                                  description: "Przełożony został usunięty",
                                  type: "success",
                                  duration: 3000,
                                });
                                mutate();
                              } catch (err: unknown) {
                                const e = err as {
                                  response?: { data?: { error?: string } };
                                };
                                toaster.create({
                                  title: "Błąd",
                                  description:
                                    e?.response?.data?.error ||
                                    "Nie udało się usunąć",
                                  type: "error",
                                  duration: 5000,
                                });
                              }
                            }}
                          >
                            Usuń przełożonego
                          </Button>
                        )}
                      </Table.Cell>
                    )}
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        )}
      </Container>
    </Box>
  );
}
