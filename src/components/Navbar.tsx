"use client";

import {
  Box,
  Container,
  Flex,
  HStack,
  Link,
  Text,
  Button,
} from "@chakra-ui/react";
import axios from "axios";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const NAV_ITEMS = [
  { name: "Użytkownicy", href: "/users", icon: "👥" },
  { name: "Pracownicy", href: "/employees", icon: "💼" },
  { name: "Sprzęt", href: "/equipment", icon: "🏋️" },
  { name: "Sale", href: "/classes", icon: "📅" },
  { name: "Abonamenty", href: "/memberships", icon: "💳" },
];

export function Navbar() {
  const pathname = usePathname();
  const { isLoggedIn, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await axios.post("/api/auth/logout");
      logout();
      window.location.href = "/auth/login";
    } catch {
      alert("❌ Wylogowanie nie powiodło się. Spróbuj ponownie.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Box
      as="nav"
      bg="black"
      borderBottom="2px solid"
      borderColor="brand.600"
      position="sticky"
      top={0}
      zIndex={1000}
      boxShadow="0 4px 6px rgba(0,0,0,0.3)"
    >
      <Container maxW="container.xl" py={4}>
        <Flex align="center" justify="space-between" gap={4}>
          <Link asChild _hover={{ textDecoration: "none" }}>
            <NextLink href="/">
              <Text
                fontSize="2xl"
                fontWeight="bold"
                color="white"
                letterSpacing="tight"
              >
                Gym
                <Text as="span" color="brand.600">
                  Manager
                </Text>
              </Text>
            </NextLink>
          </Link>

          {/* Navigation Tiles */}
          <HStack gap={2} flex="1" justify="center">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  asChild
                  _hover={{ textDecoration: "none" }}
                >
                  <NextLink href={item.href}>
                    <Box
                      px={6}
                      py={3}
                      bg={isActive ? "brand.600" : "gray.800"}
                      color="white"
                      borderRadius="md"
                      transition="all 0.2s"
                      cursor="pointer"
                      _hover={{
                        bg: isActive ? "brand.700" : "gray.700",
                        transform: "translateY(-2px)",
                        boxShadow: "0 4px 8px rgba(230, 0, 0, 0.3)",
                      }}
                      border="1px solid"
                      borderColor={isActive ? "brand.500" : "gray.700"}
                    >
                      <HStack gap={2}>
                        <Text fontSize="lg">{item.icon}</Text>
                        <Text fontWeight="medium" fontSize="sm">
                          {item.name}
                        </Text>
                      </HStack>
                    </Box>
                  </NextLink>
                </Link>
              );
            })}
          </HStack>

          <Box>
            {isLoggedIn && (
              <Button
                onClick={handleLogout}
                loading={isLoggingOut}
                bg="red.600"
                color="white"
                px={6}
                py={3}
                borderRadius="md"
                _hover={{
                  bg: "red.700",
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 8px rgba(200, 0, 0, 0.3)",
                }}
                fontWeight="medium"
                fontSize="sm"
              >
                Wyloguj się
              </Button>
            )}

            {!isLoggedIn && (
              <Link asChild _hover={{ textDecoration: "none" }}>
                <NextLink href="/auth/login">
                  <Button
                    bg="brand.600"
                    color="white"
                    px={6}
                    py={3}
                    borderRadius="md"
                    _hover={{
                      bg: "brand.700",
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 8px rgba(230, 0, 0, 0.3)",
                    }}
                    fontWeight="medium"
                    fontSize="sm"
                  >
                    Zaloguj
                  </Button>
                </NextLink>
              </Link>
            )}
          </Box>
        </Flex>
      </Container>
    </Box>
  );
}
