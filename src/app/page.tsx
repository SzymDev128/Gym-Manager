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

const DASHBOARD_CARDS = [
  {
    title: "Użytkownicy",
    href: "/members",
    icon: "👥",
    description: "Zarządzaj członkami siłowni",
    color: "brand.600",
  },
  {
    title: "Pracownicy",
    href: "/employees",
    icon: "💼",
    description: "Trenerzy i recepcjoniści",
    color: "brand.600",
  },
  {
    title: "Sprzęt",
    href: "/equipment",
    icon: "🏋️",
    description: "Inwentarz i konserwacja",
    color: "brand.600",
  },
  {
    title: "Sale",
    href: "/classes",
    icon: "📅",
    description: "Zajęcia grupowe",
    color: "brand.600",
  },
];

export default function HomePage() {
  return (
    <Box minH="100vh" bg="gray.900">
      <Container maxW="container.xl" py={12}>
        <VStack gap={8} align="stretch">
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

          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6} mt={8}>
            {DASHBOARD_CARDS.map((card) => (
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
