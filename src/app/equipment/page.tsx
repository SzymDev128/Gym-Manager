"use client";

import axios from "axios";
import { useState } from "react";
import EquipmentCreateModal from "@/components/EquipmentCreateModal";
import {
  Box,
  Container,
  Heading,
  Text,
  Table,
  Spinner,
  Button,
  Badge,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  ColumnDef,
} from "@tanstack/react-table";
import useSWR from "swr";

interface Equipment {
  id: number;
  name: string;
  category: string;
  condition: string;
  purchaseDate: string;
}

const columnHelper = createColumnHelper<Equipment>();

export default function EquipmentPage() {
  const { data, error, isLoading, mutate } =
    useSWR<Equipment[]>("/api/equipment");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleDelete = async (eq: Equipment) => {
    try {
      await axios.delete(`/api/equipment/${eq.id}`);
      toaster.create({
        title: "Usunięto",
        description: `Sprzęt "${eq.name}" został usunięty`,
        type: "success",
        duration: 3000,
      });
      mutate();
    } catch (error) {
      const err = error as { response?: { data?: { error?: string } } };
      toaster.create({
        title: "Błąd",
        description:
          err?.response?.data?.error || "Nie udało się usunąć sprzętu",
        type: "error",
        duration: 5000,
      });
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns: ColumnDef<Equipment, any>[] = [
    columnHelper.accessor("id", { header: "ID", cell: (i) => i.getValue() }),
    columnHelper.accessor("name", {
      header: "Nazwa",
      cell: (i) => i.getValue(),
    }),
    columnHelper.accessor("category", {
      header: "Kategoria",
      cell: (i) => i.getValue(),
    }),
    columnHelper.accessor("condition", {
      header: "Stan",
      cell: (i) => {
        const c = i.getValue();
        const palette =
          c === "NEW"
            ? "green"
            : c === "GOOD"
            ? "blue"
            : c === "NEEDS_REPAIR"
            ? "orange"
            : "gray";
        // Tłumaczenie na polski do wyświetlenia
        const label =
          c === "NEW"
            ? "Nowy"
            : c === "GOOD"
            ? "Dobry"
            : c === "NEEDS_REPAIR"
            ? "Wymaga naprawy"
            : c === "OUT_OF_ORDER"
            ? "Uszkodzony"
            : c;
        return <Badge colorPalette={palette}>{label}</Badge>;
      },
    }),
    columnHelper.accessor("purchaseDate", {
      header: "Data zakupu",
      cell: (i) => new Date(i.getValue()).toLocaleDateString("pl-PL"),
    }),
    columnHelper.display({
      id: "actions",
      header: "Akcje",
      cell: (info) => {
        const eq = info.row.original;
        return (
          <Box display="flex" gap={2}>
            <Button
              size="sm"
              bg="purple.600"
              color="white"
              _hover={{ bg: "purple.400" }}
              onClick={() => (window.location.href = `/equipment/${eq.id}`)}
            >
              Szczegóły
            </Button>
            <Button
              size="sm"
              bg="brand.600"
              color="white"
              _hover={{ bg: "brand.400" }}
              onClick={() => handleDelete(eq)}
            >
              Usuń
            </Button>
          </Box>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Box minH="100vh" bg="gray.900" py={10}>
      <Container maxW="7xl">
        <Heading
          size="2xl"
          bgGradient="linear(to-r, brand.600, brand.400)"
          bgClip="text"
          mb={4}
          color={"white"}
        >
          🏋️ Sprzęt
        </Heading>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={8}
        >
          <Text color="gray.400">Inwentarz i konserwacja</Text>
          <Button
            size="sm"
            bg="green.600"
            color="white"
            _hover={{ bg: "green.400" }}
            onClick={() => setIsCreateOpen(true)}
          >
            + Dodaj sprzęt
          </Button>
        </Box>

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
              Nie udało się załadować sprzętu. Sprawdź połączenie.
            </Text>
          </Box>
        )}

        {data && (
          <Box
            bg="black"
            borderRadius="lg"
            border="1px solid"
            borderColor="gray.800"
            overflow="hidden"
          >
            <Table.Root size="sm" variant="outline">
              <Table.Header>
                {table.getHeaderGroups().map((hg) => (
                  <Table.Row key={hg.id} bg="black">
                    {hg.headers.map((h) => (
                      <Table.ColumnHeader
                        key={h.id}
                        color="gray.200"
                        fontWeight="bold"
                        py={4}
                        borderColor="gray.500"
                      >
                        {h.isPlaceholder
                          ? null
                          : flexRender(
                              h.column.columnDef.header,
                              h.getContext()
                            )}
                      </Table.ColumnHeader>
                    ))}
                  </Table.Row>
                ))}
              </Table.Header>
              <Table.Body>
                {table.getRowModel().rows.map((row, index) => (
                  <Table.Row
                    key={row.id}
                    bg={index % 2 === 0 ? "gray.800" : "gray.700"}
                    _hover={{ bg: "gray.600" }}
                    transition="background 0.2s"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <Table.Cell
                        key={cell.id}
                        color="gray.200"
                        py={3}
                        borderColor="gray.700"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </Table.Cell>
                    ))}
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        )}

        {data && data.length === 0 && (
          <Box textAlign="center" py={10}>
            <Text color="gray.500">Brak sprzętu do wyświetlenia</Text>
          </Box>
        )}
      </Container>
      {isCreateOpen && (
        <EquipmentCreateModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSave={async (form) => {
            try {
              const res = await axios.post("/api/equipment", form);
              toaster.create({
                title: "Dodano",
                description: `Sprzęt \"${res.data.name}\" został dodany`,
                type: "success",
                duration: 3000,
              });
              mutate();
              setIsCreateOpen(false);
            } catch (error) {
              const err = error as { response?: { data?: { error?: string } } };
              toaster.create({
                title: "Błąd",
                description:
                  err?.response?.data?.error || "Nie udało się dodać sprzętu",
                type: "error",
                duration: 5000,
              });
            }
          }}
        />
      )}
    </Box>
  );
}
