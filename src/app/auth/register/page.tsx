"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  VStack,
  Text,
  Stack,
} from "@chakra-ui/react";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { login, isLoggedIn } = useAuth();

  useEffect(() => {
    if (isLoggedIn) {
      router.push("/");
    }
  }, [isLoggedIn, router]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Hasła nie są zgodne");
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumbers: formData.phoneNumber ? [formData.phoneNumber] : [],
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Registration failed");
      }

      // After successful registration, log in the user
      await login(formData.email, formData.password);
      router.push("/");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Rejestracja nie powiodła się. Spróbuj ponownie."
      );
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <Box minH="100vh" bg="black" py={10}>
      <Container maxW="md">
        <Box
          bg="gray.800"
          p={8}
          borderRadius="lg"
          border="1px solid"
          borderColor="gray.700"
        >
          <VStack gap={6} align="stretch">
            <Heading
              size="xl"
              textAlign="center"
              bgGradient="linear(to-r, brand.600, brand.400)"
              bgClip="text"
            >
              Rejestracja
            </Heading>

            {error && (
              <Text color="red.400" fontSize="sm" textAlign="center">
                {error}
              </Text>
            )}

            <form onSubmit={handleSubmit}>
              <VStack gap={4} align="stretch">
                <Stack gap={2}>
                  <Text color="gray.400" fontSize="sm" fontWeight="medium">
                    Imię
                  </Text>
                  <Input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Jan"
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
                    Nazwisko
                  </Text>
                  <Input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Kowalski"
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
                    Email
                  </Text>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="jan.kowalski@email.com"
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
                    Numer telefonu
                  </Text>
                  <Input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="+48 123 456 789"
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
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
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

                <Stack gap={2}>
                  <Text color="gray.400" fontSize="sm" fontWeight="medium">
                    Potwierdź hasło
                  </Text>
                  <Input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
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
                  w="full"
                  _hover={{ bg: "brand.700" }}
                  mt={2}
                >
                  Zarejestruj się
                </Button>
              </VStack>
            </form>

            <Text color="gray.400" fontSize="sm" textAlign="center">
              Masz już konto?{" "}
              <Text
                as="span"
                color="brand.600"
                cursor="pointer"
                _hover={{ textDecoration: "underline" }}
                onClick={() => router.push("/auth/login")}
              >
                Zaloguj się
              </Text>
            </Text>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}
