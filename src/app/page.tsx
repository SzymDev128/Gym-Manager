"use client";
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  Link,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useAuth } from "@/contexts/AuthContext";

const DASHBOARD_CARDS = [
  {
    title: "Użytkownicy",
    href: "/users",
    icon: "👥",
    description: "Zarządzaj członkami siłowni",
    color: "brand.600",
    allowedRoles: [3, 4, 5], // RECEPTIONIST, TRAINER, ADMIN
  },
  {
    title: "Sprzęt",
    href: "/equipment",
    icon: "🏋️",
    description: "Inwentarz i konserwacja",
    color: "brand.600",
    allowedRoles: [3, 4, 5], // RECEPTIONIST, TRAINER, ADMIN
  },
  {
    title: "Sale",
    href: "/classes",
    icon: "📅",
    description: "Zajęcia grupowe",
    color: "brand.600",
    allowedRoles: [1, 2, 3, 4, 5], // Wszyscy
  },
  {
    title: "Abonamenty",
    href: "/memberships",
    icon: "💳",
    description: "Przeglądaj i zarządzaj karnetami",
    color: "brand.600",
    allowedRoles: [1, 2, 3, 4, 5], // Wszyscy
  },
];

export default function HomePage() {
  const { user } = useAuth();

  const filteredCards = DASHBOARD_CARDS.filter((card) => {
    if (!user) return false;
    return card.allowedRoles.includes(user.roleId);
  });

  return (
    <Box minH="100vh" bg="gray.900">
      <Container maxW="container.xl" py={12}>
        <VStack gap={8} align="center">
          {/* Header */}
          <VStack gap={2} textAlign="center">
            <Heading size="2xl" color="white">
              Witaj w Gym
              <Text as="span" color="brand.600">
                Manager
              </Text>
            </Heading>
            <Text color="gray.400" fontSize="lg">
              System zarządzania siłownią
            </Text>
          </VStack>

          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 4 }}
            gap={6}
            mt={8}
            justifyItems="center"
            mx="auto"
            w="fit-content"
          >
            {filteredCards.map((card) => (
              <Link key={card.href} asChild _hover={{ textDecoration: "none" }}>
                <NextLink href={card.href}>
                  <Box
                    bg="gray.800"
                    p={8}
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="gray.700"
                    transition="all 0.3s"
                    cursor="pointer"
                    minW="240px"
                    maxW="240px"
                    minH="320px"
                    maxH="320px"
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                    _hover={{
                      transform: "translateY(-4px)",
                      borderColor: "brand.600",
                      boxShadow: "0 8px 16px rgba(230, 0, 0, 0.3)",
                    }}
                  >
                    <VStack gap={4} align="center">
                      <Text fontSize="4xl">{card.icon}</Text>
                      <Heading size="lg" color="white">
                        {card.title}
                      </Heading>
                      <Text color="gray.400" textAlign="center" fontSize="sm">
                        {card.description}
                      </Text>
                    </VStack>
                  </Box>
                </NextLink>
              </Link>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
}
