"use client";

import {
  Box,
  Container,
  Heading,
  VStack,
  Input,
  Button,
  Text,
  Link,
  Stack,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await login(email, password);
      router.push("/");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Logowanie nieudane. Spróbuj ponownie."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg="gray.900" display="flex" alignItems="center">
      <Container maxW="md">
        <Box
          bg="gray.800"
          p={8}
          borderRadius="lg"
          border="1px solid"
          borderColor="gray.700"
        >
          <VStack gap={6} align="stretch">
            <VStack gap={2} textAlign="center">
              <Heading size="xl" color="white">
                Zaloguj się
              </Heading>
              <Text color="gray.400">
                do systemu Gym
                <Text as="span" color="brand.600">
                  Manager
                </Text>
              </Text>
            </VStack>

            {error && (
              <Text color="red.400" fontSize="sm" textAlign="center">
                {error}
              </Text>
            )}

            <form onSubmit={handleSubmit}>
              <VStack gap={4} align="stretch">
                <Stack gap={2}>
                  <Text color="gray.400" fontSize="sm" fontWeight="medium">
                    Email
                  </Text>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="twoj@email.com"
                    bg="gray.900"
                    border="1px solid"
                    borderColor="gray.600"
                    color="white"
                    _placeholder={{ color: "gray.500" }}
                    _focus={{
                      borderColor: "brand.600",
                      boxShadow: "0 0 0 1px #cc0000",
                    }}
                    required
                  />
                </Stack>

                <Stack gap={2}>
                  <Text color="gray.400" fontSize="sm" fontWeight="medium">
                    Hasło
                  </Text>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    bg="gray.900"
                    border="1px solid"
                    borderColor="gray.600"
                    color="white"
                    _placeholder={{ color: "gray.500" }}
                    _focus={{
                      borderColor: "brand.600",
                      boxShadow: "0 0 0 1px #cc0000",
                    }}
                    required
                  />
                </Stack>

                <Button
                  type="submit"
                  bg="brand.600"
                  color="white"
                  size="lg"
                  width="full"
                  mt={2}
                  loading={isLoading}
                  _hover={{ bg: "brand.700" }}
                >
                  Zaloguj
                </Button>
              </VStack>
            </form>

            <VStack gap={2} pt={4} borderTop="1px solid" borderColor="gray.700">
              <Text color="gray.400" fontSize="sm">
                Nie masz konta?
              </Text>
              <Link
                asChild
                color="brand.600"
                _hover={{ color: "brand.500", textDecoration: "underline" }}
              >
                <NextLink href="/auth/register">Zarejestruj się</NextLink>
              </Link>
            </VStack>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}
