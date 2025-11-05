"use client";
import { Box, Container, Heading, Text } from "@chakra-ui/react";

export default function EquipmentPage() {
  return (
    <Box minH="100vh" bg="gray.900">
      <Container maxW="container.xl" py={8}>
        <Heading color="white" mb={4}>
          🏋️ Sprzęt
        </Heading>
        <Text color="gray.400">
          Inwentarz i konserwacja
        </Text>
      </Container>
    </Box>
  );
}
