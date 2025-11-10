"use client";

import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Card,
  Spinner,
  Text,
  VStack,
  HStack,
  Badge,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import useSWR from "swr";

interface StatisticsData {
  usersByRole: Array<{
    roleId: number;
    roleName: string;
    count: number;
  }>;
  usersWithManyCheckIns: Array<{
    userId: number;
    user: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
    };
    checkInCount: number;
  }>;
  usersWithoutCheckIns: Array<{
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    roleName: string;
  }>;
  equipmentWithLatestMaintenance: Array<{
    id: number;
    name: string;
    category: string;
    condition: string;
    latestMaintenance: {
      id: number;
      date: string;
      cost: number;
      description: string | null;
    } | null;
  }>;
  usersWithExpensiveMemberships: Array<{
    id: number;
    user: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
    };
    membership: {
      id: number;
      name: string;
      price: number;
      durationMonths: number;
    };
    startDate: string;
    endDate: string;
    averagePrice: number;
  }>;
  staffUsers: Array<{
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    roleName: string;
    employee: {
      id: number;
      hireDate: string;
      salary: number;
      trainer: {
        specialization: string;
        experienceYears: number;
      } | null;
      receptionist: {
        shiftHours: number;
      } | null;
    } | null;
    createdAt: string;
  }>;
  usersWithActiveMemberships: Array<{
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  }>;
  equipmentGreaterThanAny: Array<{
    id: number;
    name: string;
    category: string;
    purchasePrice: number;
    condition: string;
    minMembershipPrice: number;
  }>;
  equipmentGreaterThanAll: Array<{
    id: number;
    name: string;
    category: string;
    purchasePrice: number;
    condition: string;
    maxMembershipPrice: number;
  }>;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ProjectPage() {
  const [mounted, setMounted] = useState(false);
  const { data, error, isLoading } = useSWR<StatisticsData>(
    "/api/stats",
    fetcher
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  if (isLoading || !data) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box textAlign="center" py={10}>
          <Spinner size="xl" />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box textAlign="center" py={10}>
          <Text color="red.500">Błąd podczas ładowania statystyk</Text>
        </Box>
      </Container>
    );
  }

  if (!data) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box textAlign="center" py={10}>
          <Text>Brak danych</Text>
        </Box>
      </Container>
    );
  }

  return (
    <Box bg={"gray.900"} minH="100vh">
      <Container maxW="container.xl" py={8}>
        <VStack gap={8} align="stretch">
          <Heading size="xl" color="white">
            Statystyki i Raporty
          </Heading>

          {/* Users by Role - GROUP BY */}
          <Card.Root bg="gray.800" borderColor="gray.700">
            <Card.Header>
              <Heading size="lg" color="white">
                Użytkownicy według roli (GROUP BY)
              </Heading>
              <Text color="gray.400" fontSize="sm">
                SQL: SELECT roleId, COUNT(*) FROM User GROUP BY roleId
              </Text>
            </Card.Header>
            <Card.Body>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
                {data.usersByRole.map((item) => (
                  <Box
                    key={item.roleId}
                    p={4}
                    borderWidth="1px"
                    borderRadius="md"
                    bg="gray.700"
                    borderColor="gray.600"
                  >
                    <Text fontWeight="bold" fontSize="lg" color="white">
                      {item.roleName}
                    </Text>
                    <Text fontSize="3xl" fontWeight="bold" color="blue.300">
                      {item.count}
                    </Text>
                    <Text fontSize="sm" color="gray.400">
                      użytkowników
                    </Text>
                  </Box>
                ))}
              </SimpleGrid>
            </Card.Body>
          </Card.Root>

          {/* Users with many check-ins - GROUP BY + HAVING */}
          <Card.Root bg="gray.800" borderColor="gray.700">
            <Card.Header>
              <Heading size="lg" color="white">
                Użytkownicy z częstymi wejściami (GROUP BY + HAVING)
              </Heading>
              <Text color="gray.400" fontSize="sm">
                SQL: SELECT userId, COUNT(*) FROM CheckIn GROUP BY userId HAVING
                COUNT(*) &gt; 5
              </Text>
            </Card.Header>
            <Card.Body>
              {data.usersWithManyCheckIns.length === 0 ? (
                <Text color="gray.400">
                  Brak użytkowników z więcej niż 5 wejściami
                </Text>
              ) : (
                <VStack gap={3} align="stretch">
                  {data.usersWithManyCheckIns.map((item) => (
                    <HStack
                      key={item.userId}
                      p={4}
                      borderWidth="1px"
                      borderRadius="md"
                      borderColor="gray.600"
                      bg="gray.700"
                      justify="space-between"
                    >
                      <VStack align="start" gap={0}>
                        <Text fontWeight="bold" color="white">
                          {item.user.firstName} {item.user.lastName}
                        </Text>
                        <Text fontSize="sm" color="gray.400">
                          {item.user.email}
                        </Text>
                      </VStack>
                      <Badge colorPalette="green" size="lg">
                        {item.checkInCount} wejść
                      </Badge>
                    </HStack>
                  ))}
                </VStack>
              )}
            </Card.Body>
          </Card.Root>

          {/* Users without check-ins - LEFT JOIN */}
          <Card.Root bg="gray.800" borderColor="gray.700">
            <Card.Header>
              <Heading size="lg" color="white">
                Użytkownicy bez wejść (LEFT JOIN + WHERE NULL)
              </Heading>
              <Text color="gray.400" fontSize="sm">
                SQL: SELECT * FROM User LEFT JOIN CheckIn ON CheckIn.userId =
                User.id WHERE CheckIn.id IS NULL
              </Text>
            </Card.Header>
            <Card.Body>
              {!data.usersWithoutCheckIns ||
              data.usersWithoutCheckIns.length === 0 ? (
                <Text color="gray.400">
                  Wszyscy użytkownicy mają co najmniej jedno wejście
                </Text>
              ) : (
                <VStack gap={3} align="stretch">
                  {data.usersWithoutCheckIns.map((user) => (
                    <HStack
                      key={user.id}
                      p={4}
                      borderWidth="1px"
                      borderRadius="md"
                      borderColor="gray.600"
                      bg="gray.700"
                      justify="space-between"
                    >
                      <VStack align="start" gap={0} flex={1}>
                        <Text fontWeight="bold" color="white">
                          {user.firstName} {user.lastName}
                        </Text>
                        <Text fontSize="sm" color="gray.400">
                          {user.email}
                        </Text>
                      </VStack>
                      <Badge colorPalette="red" size="lg">
                        {user.roleName}
                      </Badge>
                    </HStack>
                  ))}
                </VStack>
              )}
            </Card.Body>
          </Card.Root>

          {/* Equipment with Latest Maintenance - CORRELATED SUBQUERY */}
          <Card.Root bg="gray.800" borderColor="gray.700">
            <Card.Header>
              <Heading size="lg" color="white">
                Sprzęt z najnowszą naprawą (Podzapytanie skorelowane)
              </Heading>
              <Text color="gray.400" fontSize="sm">
                SQL: SELECT * FROM Equipment e WHERE EXISTS (SELECT 1 FROM
                Maintenance m WHERE m.equipmentId = e.id AND m.date = (SELECT
                MAX(date) FROM Maintenance m2 WHERE m2.equipmentId = e.id))
              </Text>
            </Card.Header>
            <Card.Body>
              {!data.equipmentWithLatestMaintenance ||
              data.equipmentWithLatestMaintenance.length === 0 ? (
                <Text color="gray.400">Brak sprzętu z naprawami</Text>
              ) : (
                <VStack gap={3} align="stretch">
                  {data.equipmentWithLatestMaintenance.map((equipment) => (
                    <HStack
                      key={equipment.id}
                      p={4}
                      borderWidth="1px"
                      borderRadius="md"
                      borderColor="gray.600"
                      bg="gray.700"
                      justify="space-between"
                      align="start"
                    >
                      <VStack align="start" gap={1} flex={1}>
                        <Text fontWeight="bold" color="white">
                          {equipment.name}
                        </Text>
                        <HStack gap={2}>
                          <Badge colorPalette="purple" size="sm">
                            {equipment.category}
                          </Badge>
                          <Badge
                            colorPalette={
                              equipment.condition === "NEW"
                                ? "green"
                                : equipment.condition === "GOOD"
                                ? "blue"
                                : equipment.condition === "NEEDS_REPAIR"
                                ? "orange"
                                : "red"
                            }
                            size="sm"
                          >
                            {equipment.condition}
                          </Badge>
                        </HStack>
                        {equipment.latestMaintenance && (
                          <Text fontSize="sm" color="gray.400" mt={1}>
                            {equipment.latestMaintenance.description ||
                              "Brak opisu"}
                          </Text>
                        )}
                      </VStack>
                      {equipment.latestMaintenance && (
                        <VStack align="end" gap={0}>
                          <Text fontSize="lg" fontWeight="bold" color="red.300">
                            {equipment.latestMaintenance.cost.toFixed(2)} zł
                          </Text>
                          <Text fontSize="xs" color="gray.400">
                            {new Date(
                              equipment.latestMaintenance.date
                            ).toLocaleDateString("pl-PL")}
                          </Text>
                        </VStack>
                      )}
                    </HStack>
                  ))}
                </VStack>
              )}
            </Card.Body>
          </Card.Root>

          {/* Users with Expensive Memberships - UNCORRELATED SUBQUERY */}
          <Card.Root bg="gray.800" borderColor="gray.700">
            <Card.Header>
              <Heading size="lg" color="white">
                Użytkownicy z droższymi karnetami niż średnia (Podzapytanie
                nieskorelowane)
              </Heading>
              <Text color="gray.400" fontSize="sm">
                SQL: SELECT * FROM UserMembership um JOIN Membership m ON m.id =
                um.membershipId WHERE m.price &gt; (SELECT AVG(price) FROM
                Membership)
              </Text>
            </Card.Header>
            <Card.Body>
              {!data.usersWithExpensiveMemberships ||
              data.usersWithExpensiveMemberships.length === 0 ? (
                <Text color="gray.400">
                  Brak użytkowników z droższymi karnetami niż średnia
                </Text>
              ) : (
                <VStack gap={3} align="stretch">
                  <Box
                    p={3}
                    bg="blue.900"
                    borderRadius="md"
                    borderWidth="1px"
                    borderColor="blue.700"
                  >
                    <Text color="blue.200" fontSize="sm" fontWeight="bold">
                      Średnia cena karnetu:{" "}
                      {data.usersWithExpensiveMemberships[0]?.averagePrice.toFixed(
                        2
                      )}{" "}
                      zł
                    </Text>
                  </Box>
                  {data.usersWithExpensiveMemberships.map((item) => (
                    <HStack
                      key={item.id}
                      p={4}
                      borderWidth="1px"
                      borderRadius="md"
                      borderColor="gray.600"
                      bg="gray.700"
                      justify="space-between"
                      align="start"
                    >
                      <VStack align="start" gap={1} flex={1}>
                        <Text fontWeight="bold" color="white">
                          {item.user.firstName} {item.user.lastName}
                        </Text>
                        <Text fontSize="sm" color="gray.400">
                          {item.user.email}
                        </Text>
                        <HStack gap={2} mt={1}>
                          <Badge colorPalette="purple" size="sm">
                            {item.membership.name}
                          </Badge>
                          <Badge colorPalette="blue" size="sm">
                            {item.membership.durationMonths} mies.
                          </Badge>
                        </HStack>
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          {new Date(item.startDate).toLocaleDateString("pl-PL")}{" "}
                          - {new Date(item.endDate).toLocaleDateString("pl-PL")}
                        </Text>
                      </VStack>
                      <VStack align="end" gap={0}>
                        <Text fontSize="xl" fontWeight="bold" color="green.300">
                          {item.membership.price.toFixed(2)} zł
                        </Text>
                        <Text fontSize="xs" color="gray.400">
                          +
                          {(item.membership.price - item.averagePrice).toFixed(
                            2
                          )}{" "}
                          zł powyżej średniej
                        </Text>
                      </VStack>
                    </HStack>
                  ))}
                </VStack>
              )}
            </Card.Body>
          </Card.Root>

          {/* Staff Users - IN with SUBQUERY */}
          <Card.Root bg="gray.800" borderColor="gray.700">
            <Card.Header>
              <Heading size="lg" color="white">
                Pracownicy (IN z podzapytaniem)
              </Heading>
              <Text color="gray.400" fontSize="sm">
                SQL: SELECT * FROM User WHERE roleId IN (SELECT id FROM Role
                WHERE name IN (&apos;TRAINER&apos;, &apos;ADMIN&apos;,
                &apos;RECEPTIONIST&apos;))
              </Text>
            </Card.Header>
            <Card.Body>
              {!data.staffUsers || data.staffUsers.length === 0 ? (
                <Text color="gray.400">Brak pracowników w systemie</Text>
              ) : (
                <VStack gap={3} align="stretch">
                  {data.staffUsers.map((user) => (
                    <HStack
                      key={user.id}
                      p={4}
                      borderWidth="1px"
                      borderRadius="md"
                      borderColor="gray.600"
                      bg="gray.700"
                      justify="space-between"
                      align="start"
                    >
                      <VStack align="start" gap={1} flex={1}>
                        <HStack gap={2}>
                          <Text fontWeight="bold" color="white">
                            {user.firstName} {user.lastName}
                          </Text>
                          <Badge
                            colorPalette={
                              user.roleName === "ADMIN"
                                ? "red"
                                : user.roleName === "TRAINER"
                                ? "purple"
                                : "blue"
                            }
                            size="sm"
                          >
                            {user.roleName}
                          </Badge>
                        </HStack>
                        <Text fontSize="sm" color="gray.400">
                          {user.email}
                        </Text>
                        {user.employee && (
                          <>
                            <Text fontSize="xs" color="gray.500" mt={1}>
                              Zatrudniony:{" "}
                              {new Date(
                                user.employee.hireDate
                              ).toLocaleDateString("pl-PL")}
                            </Text>
                            {user.employee.trainer && (
                              <HStack gap={2} mt={1}>
                                <Badge colorPalette="purple" size="xs">
                                  {user.employee.trainer.specialization}
                                </Badge>
                                <Badge colorPalette="gray" size="xs">
                                  {user.employee.trainer.experienceYears} lat
                                  doświadczenia
                                </Badge>
                              </HStack>
                            )}
                            {user.employee.receptionist && (
                              <Badge colorPalette="blue" size="xs" mt={1}>
                                {user.employee.receptionist.shiftHours}h zmiana
                              </Badge>
                            )}
                          </>
                        )}
                      </VStack>
                      {user.employee && (
                        <VStack align="end" gap={0}>
                          <Text
                            fontSize="lg"
                            fontWeight="bold"
                            color="green.300"
                          >
                            {user.employee.salary.toFixed(2)} zł
                          </Text>
                          <Text fontSize="xs" color="gray.400">
                            pensja
                          </Text>
                        </VStack>
                      )}
                    </HStack>
                  ))}
                </VStack>
              )}
            </Card.Body>
          </Card.Root>

          {/* Users with Active Memberships - EXISTS */}
          <Card.Root bg="gray.800" borderColor="gray.700">
            <Card.Header>
              <Heading size="lg" color="white">
                Użytkownicy z aktywnymi karnetami (EXISTS)
              </Heading>
              <Text color="gray.400" fontSize="sm">
                SQL: SELECT * FROM User u WHERE EXISTS (SELECT 1 FROM
                UserMembership um WHERE um.userId = u.id AND um.active = true)
              </Text>
            </Card.Header>
            <Card.Body>
              {!data.usersWithActiveMemberships ||
              data.usersWithActiveMemberships.length === 0 ? (
                <Text color="gray.400">
                  Brak użytkowników z aktywnymi karnetami
                </Text>
              ) : (
                <VStack gap={3} align="stretch">
                  {data.usersWithActiveMemberships.map((user) => (
                    <HStack
                      key={user.id}
                      p={4}
                      borderWidth="1px"
                      borderRadius="md"
                      borderColor="gray.600"
                      bg="gray.700"
                      justify="space-between"
                    >
                      <VStack align="start" gap={1} flex={1}>
                        <Text fontWeight="bold" color="white">
                          {user.firstName} {user.lastName}
                        </Text>
                        <Text fontSize="sm" color="gray.400">
                          {user.email}
                        </Text>
                      </VStack>
                      <Badge colorPalette="green" size="lg">
                        MA AKTYWNY KARNET
                      </Badge>
                    </HStack>
                  ))}
                </VStack>
              )}
            </Card.Body>
          </Card.Root>

          {/* Equipment Greater Than ANY - ANY */}
          <Card.Root bg="gray.800" borderColor="gray.700">
            <Card.Header>
              <Heading size="lg" color="white">
                Sprzęt droższy niż JAKIKOLWIEK karnet (ANY)
              </Heading>
              <Text color="gray.400" fontSize="sm">
                SQL: SELECT * FROM Equipment WHERE purchasePrice &gt; ANY
                (SELECT price FROM Membership)
              </Text>
            </Card.Header>
            <Card.Body>
              {!data.equipmentGreaterThanAny ||
              data.equipmentGreaterThanAny.length === 0 ? (
                <Text color="gray.400">Brak sprzętu dróższego niż karnety</Text>
              ) : (
                <VStack gap={3} align="stretch">
                  {data.equipmentGreaterThanAny.map((equipment) => (
                    <HStack
                      key={equipment.id}
                      p={4}
                      borderWidth="1px"
                      borderRadius="md"
                      borderColor="gray.600"
                      bg="gray.700"
                      justify="space-between"
                      align="start"
                    >
                      <VStack align="start" gap={1} flex={1}>
                        <Text fontWeight="bold" color="white">
                          {equipment.name}
                        </Text>
                        <HStack gap={2}>
                          <Badge colorPalette="blue" size="sm">
                            {equipment.category}
                          </Badge>
                          <Badge colorPalette="purple" size="sm">
                            {equipment.condition}
                          </Badge>
                        </HStack>
                      </VStack>
                      <VStack align="end" gap={0}>
                        <Text fontSize="lg" fontWeight="bold" color="green.300">
                          {equipment.purchasePrice.toFixed(2)} zł
                        </Text>
                        <Text fontSize="xs" color="gray.400">
                          Min. karnet: {equipment.minMembershipPrice.toFixed(2)}{" "}
                          zł
                        </Text>
                      </VStack>
                    </HStack>
                  ))}
                </VStack>
              )}
            </Card.Body>
          </Card.Root>

          {/* Equipment Greater Than ALL - ALL */}
          <Card.Root bg="gray.800" borderColor="gray.700">
            <Card.Header>
              <Heading size="lg" color="white">
                Sprzęt droższy niż WSZYSTKIE karnety (ALL)
              </Heading>
              <Text color="gray.400" fontSize="sm">
                SQL: SELECT * FROM Equipment WHERE purchasePrice &gt; ALL
                (SELECT price FROM Membership)
              </Text>
            </Card.Header>
            <Card.Body>
              {!data.equipmentGreaterThanAll ||
              data.equipmentGreaterThanAll.length === 0 ? (
                <Text color="gray.400">
                  Brak sprzętu dróższego niż wszystkie karnety
                </Text>
              ) : (
                <VStack gap={3} align="stretch">
                  {data.equipmentGreaterThanAll.map((equipment) => (
                    <HStack
                      key={equipment.id}
                      p={4}
                      borderWidth="1px"
                      borderRadius="md"
                      borderColor="gray.600"
                      bg="gray.700"
                      justify="space-between"
                      align="start"
                    >
                      <VStack align="start" gap={1} flex={1}>
                        <Text fontWeight="bold" color="white">
                          {equipment.name}
                        </Text>
                        <HStack gap={2}>
                          <Badge colorPalette="blue" size="sm">
                            {equipment.category}
                          </Badge>
                          <Badge colorPalette="purple" size="sm">
                            {equipment.condition}
                          </Badge>
                        </HStack>
                      </VStack>
                      <VStack align="end" gap={0}>
                        <Text fontSize="lg" fontWeight="bold" color="green.400">
                          {equipment.purchasePrice.toFixed(2)} zł
                        </Text>
                        <Text fontSize="xs" color="gray.400">
                          Max. karnet: {equipment.maxMembershipPrice.toFixed(2)}{" "}
                          zł
                        </Text>
                      </VStack>
                    </HStack>
                  ))}
                </VStack>
              )}
            </Card.Body>
          </Card.Root>
        </VStack>
      </Container>
    </Box>
  );
}
