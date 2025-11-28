"use client";
import axios from "axios";
import { useMemo, useState } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Table,
  Spinner,
  Badge,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import useSWR from "swr";
import ClassCreateModal, { TrainerOption } from "@/components/ClassCreateModal";
import ClassEditModal from "@/components/ClassEditModal";
import { useAuth } from "@/contexts/AuthContext";

interface ClassItem {
  id: number;
  name: string;
  startTime: string;
  durationMin: number;
  trainerId: number | null;
  trainer?: {
    id: number;
    employee: {
      id: number;
      userId: number;
      hireDate: string;
      salary: number;
    } | null;
  } | null;
}

interface EmployeeTrainer {
  id: number; // employee id
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  trainer: {
    id: number; // trainer id (same as employee id)
  } | null;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ClassesPage() {
  const { user } = useAuth();
  const {
    data: classes,
    error: classesError,
    isLoading: classesLoading,
    mutate,
  } = useSWR<ClassItem[]>("/api/classes", fetcher);

  const { data: trainersData, isLoading: trainersLoading } = useSWR<
    EmployeeTrainer[]
  >("/api/employees?role=trainer", fetcher);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<ClassItem | null>(null);

  // Allowed roles fetch (ADMIN, RECEPTIONIST, TRAINER) to avoid hardcoding IDs
  const { data: allowedRoles } = useSWR<{ id: number; name: string }[]>(
    "/api/roles?names=ADMIN,RECEPTIONIST,TRAINER",
    fetcher
  );

  const trainerOptions: TrainerOption[] = useMemo(() => {
    if (!trainersData || !Array.isArray(trainersData)) return [];
    return trainersData
      .filter((e) => e.trainer)
      .map((e) => ({
        id: e.trainer!.id,
        label: `${e.user.firstName} ${e.user.lastName}`,
      }));
  }, [trainersData]);

  const trainerLabelById = useMemo(() => {
    const map = new Map<number, string>();
    for (const t of trainerOptions) map.set(t.id, t.label);
    return map;
  }, [trainerOptions]);

  const canManage = useMemo(() => {
    if (!user || !allowedRoles || !Array.isArray(allowedRoles)) return false;
    const set = new Set(allowedRoles.map((r) => r.id));
    return set.has(user.roleId);
  }, [user, allowedRoles]);

  return (
    <Box minH="100vh" bg="gray.900">
      <Container maxW="container.xl" py={8}>
        <Heading color="white" mb={2}>
          📅 Zajęcia
        </Heading>
        <Text color="gray.400" mb={6}>
          Zarządzaj zajęciami grupowymi
        </Text>

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={6}
        >
          <Text color="gray.400">
            {classesLoading
              ? "Ładowanie..."
              : `Znaleziono: ${classes?.length ?? 0}`}
          </Text>
          {canManage && (
            <Button
              size="sm"
              bg="green.600"
              color="white"
              _hover={{ bg: "green.400" }}
              onClick={() => setIsCreateOpen(true)}
              disabled={trainersLoading}
            >
              + Dodaj zajęcia
            </Button>
          )}
        </Box>

        {classesLoading ? (
          <Box textAlign="center" py={10}>
            <Spinner size="xl" />
          </Box>
        ) : classesError ? (
          <Box
            bg="red.900"
            border="1px solid"
            borderColor="red.700"
            p={4}
            borderRadius="md"
          >
            <Text color="red.200">Nie udało się załadować zajęć.</Text>
          </Box>
        ) : !classes || !Array.isArray(classes) || classes.length === 0 ? (
          <Box
            bg="gray.800"
            p={6}
            borderWidth="1px"
            borderColor="gray.700"
            borderRadius="md"
          >
            <Text color="gray.400" textAlign="center">
              Brak zajęć do wyświetlenia
            </Text>
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
                    borderColor="gray.500"
                  >
                    ID
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                    color="gray.200"
                    py={4}
                    borderColor="gray.500"
                  >
                    Nazwa
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                    color="gray.200"
                    py={4}
                    borderColor="gray.500"
                  >
                    Start
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                    color="gray.200"
                    py={4}
                    borderColor="gray.500"
                  >
                    Czas trwania
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                    color="gray.200"
                    py={4}
                    borderColor="gray.500"
                  >
                    Trener
                  </Table.ColumnHeader>
                  {canManage && (
                    <Table.ColumnHeader
                      color="gray.200"
                      py={4}
                      borderColor="gray.500"
                      textAlign="right"
                    >
                      Akcje
                    </Table.ColumnHeader>
                  )}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {classes.map((c, idx) => (
                  <Table.Row
                    key={c.id}
                    bg={idx % 2 === 0 ? "gray.800" : "gray.700"}
                    _hover={{ bg: "gray.600" }}
                    transition="background 0.2s"
                  >
                    <Table.Cell color="gray.200" py={3} borderColor="gray.700">
                      {c.id}
                    </Table.Cell>
                    <Table.Cell color="gray.200" py={3} borderColor="gray.700">
                      {c.name}
                    </Table.Cell>
                    <Table.Cell color="gray.200" py={3} borderColor="gray.700">
                      {new Date(c.startTime).toLocaleString("pl-PL")}
                    </Table.Cell>
                    <Table.Cell color="gray.200" py={3} borderColor="gray.700">
                      {c.durationMin} min
                    </Table.Cell>
                    <Table.Cell color="gray.200" py={3} borderColor="gray.700">
                      {c.trainerId ? (
                        <Badge colorPalette="purple">
                          {trainerLabelById.get(c.trainerId) ||
                            `Trener #${c.trainerId}`}
                        </Badge>
                      ) : (
                        <Badge colorPalette="gray">Brak</Badge>
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
                            setEditing(c);
                            setEditOpen(true);
                          }}
                        >
                          Edytuj
                        </Button>
                        <Button
                          size="xs"
                          bg="red.600"
                          color="white"
                          _hover={{ bg: "red.500" }}
                          onClick={async () => {
                            const ok = window.confirm(
                              `Czy na pewno chcesz usunąć zajęcia "${c.name}"?`
                            );
                            if (!ok) return;
                            try {
                              await axios.delete(`/api/classes/${c.id}`);
                              toaster.create({
                                title: "Usunięto",
                                description: `Zajęcia "${c.name}" zostały usunięte`,
                                type: "success",
                                duration: 3000,
                              });
                              mutate();
                            } catch (error) {
                              const err = error as {
                                response?: { data?: { error?: string } };
                              };
                              toaster.create({
                                title: "Błąd",
                                description:
                                  err?.response?.data?.error ||
                                  "Nie udało się usunąć zajęć",
                                type: "error",
                                duration: 5000,
                              });
                            }
                          }}
                        >
                          Usuń
                        </Button>
                      </Table.Cell>
                    )}
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        )}

        {isCreateOpen && (
          <ClassCreateModal
            isOpen={isCreateOpen}
            onClose={() => setIsCreateOpen(false)}
            trainers={trainerOptions}
            onSave={async (payload) => {
              try {
                const res = await axios.post("/api/classes", payload);
                toaster.create({
                  title: "Dodano",
                  description: `Zajęcia "${res.data.name}" zostały dodane`,
                  type: "success",
                  duration: 3000,
                });
                setIsCreateOpen(false);
                mutate();
              } catch (error) {
                const err = error as {
                  response?: { data?: { error?: string } };
                };
                toaster.create({
                  title: "Błąd",
                  description:
                    err?.response?.data?.error || "Nie udało się dodać zajęć",
                  type: "error",
                  duration: 5000,
                });
              }
            }}
          />
        )}
        {editOpen && editing && (
          <ClassEditModal
            isOpen={editOpen}
            onClose={() => {
              setEditOpen(false);
              setEditing(null);
            }}
            trainers={trainerOptions}
            initial={{
              id: editing.id,
              name: editing.name,
              startTime: editing.startTime,
              durationMin: editing.durationMin,
              trainerId: editing.trainerId,
            }}
            onSave={async (payload) => {
              try {
                const res = await axios.patch(
                  `/api/classes/${editing.id}`,
                  payload
                );
                toaster.create({
                  title: "Zapisano",
                  description: `Zajęcia "${res.data.name}" zaktualizowane`,
                  type: "success",
                  duration: 3000,
                });
                setEditOpen(false);
                setEditing(null);
                mutate();
              } catch (error) {
                const err = error as {
                  response?: { data?: { error?: string } };
                };
                toaster.create({
                  title: "Błąd",
                  description:
                    err?.response?.data?.error || "Nie udało się zapisać zmian",
                  type: "error",
                  duration: 5000,
                });
              }
            }}
          />
        )}
      </Container>
    </Box>
  );
}
