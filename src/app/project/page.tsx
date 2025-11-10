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
  equipmentByCategory: Array<{
    category: string;
    _count: {
      id: number;
    };
  }>;
  equipmentByCondition: Array<{
    condition: string;
    _count: {
      id: number;
    };
  }>;
  maintenanceCostByEquipment: Array<{
    equipmentId: number;
    equipment: {
      id: number;
      name: string;
      category: string;
      condition: string;
    };
    totalCost: number;
    maintenanceCount: number;
  }>;
  membershipStats: Array<{
    id: number;
    name: string;
    price: number;
    durationMonths: number;
    totalUsers: number;
    activeUsers: number;
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

  if (isLoading) {
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

          {/* Equipment Statistics */}
          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
            {/* Equipment by Category - GROUP BY */}
            <Card.Root bg="gray.800" borderColor="gray.700">
              <Card.Header>
                <Heading size="md" color="white">
                  Sprzęt według kategorii (GROUP BY)
                </Heading>
                <Text color="gray.400" fontSize="sm">
                  SQL: SELECT category, COUNT(*) FROM Equipment GROUP BY
                  category
                </Text>
              </Card.Header>
              <Card.Body>
                <VStack gap={3} align="stretch">
                  {data.equipmentByCategory.map((item) => (
                    <HStack
                      key={item.category}
                      p={3}
                      borderWidth="1px"
                      borderRadius="md"
                      borderColor="gray.600"
                      bg="gray.700"
                      justify="space-between"
                    >
                      <Text fontWeight="medium" color="white">
                        {item.category}
                      </Text>
                      <Badge colorPalette="blue">{item._count.id} szt.</Badge>
                    </HStack>
                  ))}
                </VStack>
              </Card.Body>
            </Card.Root>

            {/* Equipment by Condition - GROUP BY */}
            <Card.Root bg="gray.800" borderColor="gray.700">
              <Card.Header>
                <Heading size="md" color="white">
                  Sprzęt według stanu (GROUP BY)
                </Heading>
                <Text color="gray.400" fontSize="sm">
                  SQL: SELECT condition, COUNT(*) FROM Equipment GROUP BY
                  condition
                </Text>
              </Card.Header>
              <Card.Body>
                <VStack gap={3} align="stretch">
                  {data.equipmentByCondition.map((item) => {
                    const colorMap: Record<string, string> = {
                      NEW: "green",
                      GOOD: "blue",
                      NEEDS_REPAIR: "orange",
                      OUT_OF_ORDER: "red",
                    };
                    return (
                      <HStack
                        key={item.condition}
                        p={3}
                        borderWidth="1px"
                        borderRadius="md"
                        borderColor="gray.600"
                        bg="gray.700"
                        justify="space-between"
                      >
                        <Text fontWeight="medium" color="white">
                          {item.condition}
                        </Text>
                        <Badge
                          colorPalette={colorMap[item.condition] || "gray"}
                        >
                          {item._count.id} szt.
                        </Badge>
                      </HStack>
                    );
                  })}
                </VStack>
              </Card.Body>
            </Card.Root>
          </SimpleGrid>

          {/* Maintenance Cost by Equipment - GROUP BY + SUM */}
          <Card.Root bg="gray.800" borderColor="gray.700">
            <Card.Header>
              <Heading size="lg" color="white">
                Koszty utrzymania sprzętu (GROUP BY + SUM)
              </Heading>
              <Text color="gray.400" fontSize="sm">
                SQL: SELECT equipmentId, SUM(cost), COUNT(*) FROM Maintenance
                GROUP BY equipmentId ORDER BY SUM(cost) DESC LIMIT 10
              </Text>
            </Card.Header>
            <Card.Body>
              {data.maintenanceCostByEquipment.length === 0 ? (
                <Text color="gray.400">Brak danych o kosztach utrzymania</Text>
              ) : (
                <VStack gap={3} align="stretch">
                  {data.maintenanceCostByEquipment.map((item) => (
                    <HStack
                      key={item.equipmentId}
                      p={4}
                      borderWidth="1px"
                      borderRadius="md"
                      borderColor="gray.600"
                      bg="gray.700"
                      justify="space-between"
                    >
                      <VStack align="start" gap={0} flex={1}>
                        <Text fontWeight="bold" color="white">
                          {item.equipment.name}
                        </Text>
                        <HStack gap={2}>
                          <Badge colorPalette="purple" size="sm">
                            {item.equipment.category}
                          </Badge>
                          <Badge colorPalette="gray" size="sm">
                            {item.equipment.condition}
                          </Badge>
                        </HStack>
                      </VStack>
                      <VStack align="end" gap={0}>
                        <Text fontSize="xl" fontWeight="bold" color="red.300">
                          {item.totalCost?.toFixed(2) || "0.00"} zł
                        </Text>
                        <Text fontSize="sm" color="gray.400">
                          {item.maintenanceCount} napraw
                        </Text>
                      </VStack>
                    </HStack>
                  ))}
                </VStack>
              )}
            </Card.Body>
          </Card.Root>

          {/* Membership Statistics */}
          <Card.Root bg="gray.800" borderColor="gray.700">
            <Card.Header>
              <Heading size="lg" color="white">
                Statystyki karnetów
              </Heading>
              <Text color="gray.400" fontSize="sm">
                Połączenie GROUP BY z agregacją danych
              </Text>
            </Card.Header>
            <Card.Body>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
                {data.membershipStats.map((item) => (
                  <Box
                    key={item.id}
                    p={4}
                    borderWidth="1px"
                    borderRadius="md"
                    bg="gray.700"
                    borderColor="gray.600"
                  >
                    <Text fontWeight="bold" fontSize="lg" color="white">
                      {item.name}
                    </Text>
                    <Text fontSize="sm" color="gray.400">
                      {item.price} zł / {item.durationMonths} mies.
                    </Text>
                    <HStack gap={4} mt={3}>
                      <VStack gap={0} align="start">
                        <Text fontSize="2xl" fontWeight="bold" color="white">
                          {item.totalUsers}
                        </Text>
                        <Text fontSize="xs" color="gray.400">
                          łącznie
                        </Text>
                      </VStack>
                      <VStack gap={0} align="start">
                        <Text
                          fontSize="2xl"
                          fontWeight="bold"
                          color="green.300"
                        >
                          {item.activeUsers}
                        </Text>
                        <Text fontSize="xs" color="gray.400">
                          aktywnych
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                ))}
              </SimpleGrid>
            </Card.Body>
          </Card.Root>
        </VStack>
      </Container>
    </Box>
  );
}
