"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Box, Container, Heading, Text } from "@chakra-ui/react";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: number[]; // Array of roleId that are allowed
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && !allowedRoles.includes(user.roleId)) {
      router.push("/");
    }
  }, [user, isLoading, allowedRoles, router]);

  // Show loading state
  if (isLoading) {
    return null;
  }

  // Check if user has required role
  if (!user || !allowedRoles.includes(user.roleId)) {
    return (
      <Box minH="100vh" bg="gray.900" py={10}>
        <Container maxW="container.xl">
          <Box textAlign="center" py={20}>
            <Heading size="xl" color="white" mb={4}>
              Brak dostępu
            </Heading>
            <Text color="gray.400" fontSize="lg">
              Nie masz uprawnień do przeglądania tej strony.
            </Text>
          </Box>
        </Container>
      </Box>
    );
  }

  return <>{children}</>;
}
