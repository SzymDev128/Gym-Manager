"use client";

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Spinner,
} from "@chakra-ui/react";
import { useState } from "react";
import useSWR from "swr";

interface Membership {
  id: number;
  name: string;
  durationMonths: number;
  price: number;
  description: string;
}

interface MembershipCardProps {
  membership: Membership;
}

function MembershipCard({ membership }: MembershipCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Box
      bg="gray.800"
      borderRadius="lg"
      border="2px solid"
      borderColor={isHovered ? "red.500" : "gray.700"}
      p={6}
      cursor="pointer"
      transition="all 0.3s ease"
      transform={isHovered ? "scale(1.05)" : "scale(1)"}
      _hover={{
        bg: "gray.900",
        shadow: "xl",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <VStack align="stretch" gap={4}>
        <Box>
          <Heading
            size="lg"
            color={isHovered ? "red.400" : "white"}
            transition="color 0.3s ease"
          >
            {membership?.name}
          </Heading>
        </Box>

        <Box>
          <Text fontSize="3xl" fontWeight="bold" color="white">
            {membership?.price} zł
          </Text>
          <Text color="gray.400" fontSize="sm">
            {membership?.durationMonths}{" "}
            {membership?.durationMonths === 1
              ? "miesiąc"
              : membership?.durationMonths >= 2 &&
                membership?.durationMonths <= 4
              ? "miesiące"
              : "miesięcy"}
          </Text>
        </Box>

        <Box mt={2} minH="60px">
          <Text color="gray.300" fontSize="sm" lineHeight="1.6">
            {membership.description}
          </Text>
        </Box>

        <Box
          mt={4}
          p={3}
          bg={isHovered ? "red.500" : "gray.700"}
          borderRadius="md"
          textAlign="center"
          transition="background 0.3s ease"
        >
          <Text color="white" fontWeight="semibold">
            Wybierz plan
          </Text>
        </Box>
      </VStack>
    </Box>
  );
}

export default function MembershipsPage() {
  const {
    data: memberships,
    error,
    isLoading,
  } = useSWR<Membership[]>("/api/memberships");

  return (
    <Box minH="100vh" bg="black" py={10}>
      <Container maxW="7xl">
        <VStack gap={8} align="stretch">
          <Heading
            size="2xl"
            bgGradient="linear(to-r, brand.600, brand.400)"
            bgClip="text"
          >
            Abonamenty
          </Heading>

          <Text color="gray.400" fontSize="lg">
            Wybierz plan dopasowany do Twoich potrzeb
          </Text>

          {isLoading && (
            <Box textAlign="center" py={10}>
              <Spinner size="xl" color="red.500" />
            </Box>
          )}

          {error && (
            <Box
              bg="red.900"
              border="1px solid"
              borderColor="red.700"
              p={4}
              borderRadius="md"
            >
              <Text color="red.200">
                Nie udało się załadować planów. Sprawdź połączenie i spróbuj
                ponownie.
              </Text>
            </Box>
          )}

          {memberships && (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
              {memberships.map((membership) => (
                <MembershipCard key={membership.id} membership={membership} />
              ))}
            </SimpleGrid>
          )}
        </VStack>
      </Container>
    </Box>
  );
}
