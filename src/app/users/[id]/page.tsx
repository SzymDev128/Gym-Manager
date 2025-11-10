"use client";

import axios from "axios";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import UsersEditModal from "@/components/UsersEditModal";
import { RoleGuard } from "@/components/RoleGuard";
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Badge,
  Spinner,
  Card,
  Table,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import useSWR from "swr";

interface PhoneNumber {
  id: number;
  number: string;
  userId: number;
}

interface CheckIn {
  id: number;
  userId: number;
  checkInTime: string;
  checkOutTime: string | null;
}

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  birthDate: string | null;
  roleId: number;
  createdAt: string;
  phoneNumbers: PhoneNumber[];
}

const ROLE_NAMES: Record<number, string> = {
  1: "USER",
  2: "MEMBER",
  3: "RECEPTIONIST",
  4: "TRAINER",
  5: "ADMIN",
};

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const {
    data: user,
    error,
    isLoading,
    mutate,
  } = useSWR<User>(`/api/users/${id}`);

  const { data: checkIns, isLoading: isLoadingCheckIns } = useSWR<CheckIn[]>(
    `/api/checkins?userId=${id}`
  );

  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleEditSave = async (updatedUser: {
    firstName?: string;
    lastName?: string;
    email?: string;
    birthDate?: string;
    role?: string;
    phoneNumbers?: string[];
  }) => {
    try {
      const res = await axios.patch(`/api/users/${id}`, updatedUser);
      toaster.create({
        title: "Zaktualizowano",
        description: `Użytkownik ${res.data.firstName} ${res.data.lastName} został zaktualizowany`,
        type: "success",
        duration: 3000,
      });
      mutate();
      setIsEditOpen(false);
    } catch (error) {
      const err = error as { response?: { data?: { error?: string } } };
      toaster.create({
        title: "Błąd",
        description:
          err?.response?.data?.error ||
          "Nie udało się zaktualizować użytkownika",
        type: "error",
        duration: 5000,
      });
    }
  };

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minH="60vh"
        >
          <Spinner size="xl" color="brand.600" />
        </Box>
      </Container>
    );
  }

  if (error || !user) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box textAlign="center">
          <Heading size="lg" mb={4}>
            Błąd
          </Heading>
          <Text>Nie znaleziono użytkownika</Text>
          <Button mt={4} onClick={() => router.push("/users")}>
            Powrót do listy
          </Button>
        </Box>
      </Container>
    );
  }

  const roleName = ROLE_NAMES[user.roleId] || "UNKNOWN";
  const roleColor =
    roleName === "ADMIN"
      ? "red"
      : roleName === "TRAINER"
      ? "purple"
      : roleName === "RECEPTIONIST"
      ? "blue"
      : roleName === "MEMBER"
      ? "green"
      : "gray";

  return (
    <RoleGuard allowedRoles={[3, 4, 5]}>
      <Box minH="100vh" bg="gray.900" py={8}>
        <Container maxW="container.xl">
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={6}
          >
            <Heading size="xl" color="white">
              Szczegóły użytkownika
            </Heading>
            <Button
              variant="outline"
              colorPalette="purple"
              onClick={() => router.push("/users")}
            >
              Powrót do listy
            </Button>
          </Box>

          <Card.Root
            bg="gray.800"
            p={6}
            mb={6}
            borderWidth="1px"
            borderColor="gray.700"
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="start"
            >
              <Box>
                <Heading size="lg" mb={4} color="white">
                  {user.firstName} {user.lastName}
                </Heading>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Text color="gray.200">
                    <strong>ID:</strong> {user.id}
                  </Text>
                  <Text color="gray.200">
                    <strong>Email:</strong> {user.email}
                  </Text>
                  <Text color="gray.200">
                    <strong>Rola:</strong>{" "}
                    <Badge colorPalette={roleColor}>{roleName}</Badge>
                  </Text>
                  <Text color="gray.200">
                    <strong>Data urodzenia:</strong>{" "}
                    {user.birthDate
                      ? new Date(user.birthDate).toLocaleDateString("pl-PL")
                      : "Brak"}
                  </Text>
                  <Text color="gray.200">
                    <strong>Data rejestracji:</strong>{" "}
                    {new Date(user.createdAt).toLocaleDateString("pl-PL")}
                  </Text>
                  <Box>
                    <Text color="gray.200" mb={1}>
                      <strong>Telefony:</strong>
                    </Text>
                    {user.phoneNumbers && user.phoneNumbers.length > 0 ? (
                      <Box display="flex" flexDirection="column" gap={1} pl={4}>
                        {user.phoneNumbers.map((phone) => (
                          <Text key={phone.id} color="gray.300">
                            • {phone.number}
                          </Text>
                        ))}
                      </Box>
                    ) : (
                      <Text color="gray.400" pl={4}>
                        Brak numerów telefonu
                      </Text>
                    )}
                  </Box>
                </Box>
              </Box>
              <Button colorPalette="purple" onClick={() => setIsEditOpen(true)}>
                Edytuj użytkownika
              </Button>
            </Box>
          </Card.Root>

          <Heading size="lg" mb={4} color="white">
            Aktywność
          </Heading>

          <Card.Root
            bg="gray.800"
            p={6}
            borderWidth="1px"
            borderColor="gray.700"
          >
            {isLoadingCheckIns ? (
              <Box display="flex" justifyContent="center" py={4}>
                <Spinner color="brand.600" />
              </Box>
            ) : !checkIns || checkIns.length === 0 ? (
              <Text textAlign="center" color="gray.400">
                Brak dostępnych danych o aktywności
              </Text>
            ) : (
              <Box overflowX="auto">
                <Table.Root variant="outline" size="sm">
                  <Table.Header bg="gray.900">
                    <Table.Row>
                      <Table.ColumnHeader color="white" borderColor="gray.500">
                        ID
                      </Table.ColumnHeader>
                      <Table.ColumnHeader color="white" borderColor="gray.500">
                        Data wejścia
                      </Table.ColumnHeader>
                      <Table.ColumnHeader color="white" borderColor="gray.500">
                        Godzina wejścia
                      </Table.ColumnHeader>
                      <Table.ColumnHeader color="white" borderColor="gray.500">
                        Data wyjścia
                      </Table.ColumnHeader>
                      <Table.ColumnHeader color="white" borderColor="gray.500">
                        Godzina wyjścia
                      </Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {checkIns.map((checkIn, index) => {
                      const checkInDate = new Date(checkIn.checkInTime);
                      const checkOutDate = checkIn.checkOutTime
                        ? new Date(checkIn.checkOutTime)
                        : null;

                      return (
                        <Table.Row
                          key={checkIn.id}
                          bg={index % 2 === 0 ? "gray.800" : "gray.700"}
                        >
                          <Table.Cell color="gray.100" borderColor="gray.500">
                            {checkIn.id}
                          </Table.Cell>
                          <Table.Cell color="gray.100" borderColor="gray.500">
                            {checkInDate.toLocaleDateString("pl-PL")}
                          </Table.Cell>
                          <Table.Cell color="gray.100" borderColor="gray.500">
                            {checkInDate.toLocaleTimeString("pl-PL")}
                          </Table.Cell>
                          <Table.Cell color="gray.100" borderColor="gray.500">
                            {checkOutDate
                              ? checkOutDate.toLocaleDateString("pl-PL")
                              : "-"}
                          </Table.Cell>
                          <Table.Cell color="gray.100" borderColor="gray.500">
                            {checkOutDate
                              ? checkOutDate.toLocaleTimeString("pl-PL")
                              : "-"}
                          </Table.Cell>
                        </Table.Row>
                      );
                    })}
                  </Table.Body>
                </Table.Root>
              </Box>
            )}
          </Card.Root>

          {isEditOpen && user && (
            <UsersEditModal
              isOpen={isEditOpen}
              onClose={() => setIsEditOpen(false)}
              user={user}
              onSave={handleEditSave}
            />
          )}
        </Container>
      </Box>
    </RoleGuard>
  );
}
