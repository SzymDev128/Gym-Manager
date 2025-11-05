"use client";

import { Box, Container, Heading, Text, VStack } from "@chakra-ui/react";

export default function MembershipsPage() {
  return (
    <Box minH="100vh" bg="black" py={10}>
      <Container maxW="7xl">
        <VStack gap={6} align="stretch">
          <Heading
            size="2xl"
            bgGradient="linear(to-r, brand.600, brand.400)"
            bgClip="text"
          >
            Abonamenty
          </Heading>

          <Box
            bg="gray.800"
            p={8}
            borderRadius="lg"
            border="1px solid"
            borderColor="gray.700"
          >
            <Text color="gray.400" fontSize="lg">
              Strona abonamentów będzie wkrótce dostępna.
            </Text>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
