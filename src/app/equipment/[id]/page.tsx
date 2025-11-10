"use client";

import axios from "axios";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import EquipmentCreateModal from "@/components/EquipmentCreateModal";
import MaintenanceCreateModal from "@/components/MaintenanceCreateModal";
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Badge,
  Spinner,
  Table,
  Card,
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

interface Maintenance {
  id: number;
  equipmentId: number;
  date: string;
  cost: number;
  description: string | null;
}

const maintenanceColumnHelper = createColumnHelper<Maintenance>();

export default function EquipmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const {
    data: equipment,
    error: eqError,
    isLoading: eqLoading,
    mutate: mutateEquipment,
  } = useSWR<Equipment>(`/api/equipment/${id}`);

  const {
    data: maintenanceData,
    error: maintError,
    isLoading: maintLoading,
    mutate: mutateMaintenance,
  } = useSWR<Maintenance[]>(`/api/maintenance?equipmentId=${id}`);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
  const [isMaintenanceEditOpen, setIsMaintenanceEditOpen] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] =
    useState<Maintenance | null>(null);

  const handleEditSave = async (updatedEquipment: {
    name?: string;
    category?: string;
    condition?: string;
  }) => {
    try {
      const res = await axios.patch(`/api/equipment/${id}`, updatedEquipment);
      toaster.create({
        title: "Zaktualizowano",
        description: `Sprzęt "${res.data.name}" został zaktualizowany`,
        type: "success",
        duration: 3000,
      });
      mutateEquipment();
      setIsEditOpen(false);
    } catch (error) {
      const err = error as { response?: { data?: { error?: string } } };
      toaster.create({
        title: "Błąd",
        description:
          err?.response?.data?.error || "Nie udało się zaktualizować sprzętu",
        type: "error",
        duration: 5000,
      });
    }
  };

  const handleMaintenanceSave = async (maintenanceData: {
    date: string;
    cost: string;
    description: string;
  }) => {
    try {
      await axios.post("/api/maintenance", {
        equipmentId: Number(id),
        date: maintenanceData.date,
        cost: Number(maintenanceData.cost),
        description: maintenanceData.description || null,
      });
      toaster.create({
        title: "Dodano",
        description: "Naprawa została dodana",
        type: "success",
        duration: 3000,
      });
      mutateMaintenance();
      setIsMaintenanceOpen(false);
    } catch (error) {
      const err = error as { response?: { data?: { error?: string } } };
      toaster.create({
        title: "Błąd",
        description:
          err?.response?.data?.error || "Nie udało się dodać naprawy",
        type: "error",
        duration: 5000,
      });
    }
  };

  const handleEditMaintenance = (maintenance: Maintenance) => {
    setSelectedMaintenance(maintenance);
    setIsMaintenanceEditOpen(true);
  };

  const handleMaintenanceEditSave = async (maintenanceData: {
    date: string;
    cost: string;
    description: string;
  }) => {
    if (!selectedMaintenance) return;

    try {
      await axios.patch(`/api/maintenance/${selectedMaintenance.id}`, {
        date: maintenanceData.date,
        cost: Number(maintenanceData.cost),
        description: maintenanceData.description || null,
      });
      toaster.create({
        title: "Zaktualizowano",
        description: "Naprawa została zaktualizowana",
        type: "success",
        duration: 3000,
      });
      mutateMaintenance();
      setIsMaintenanceEditOpen(false);
      setSelectedMaintenance(null);
    } catch (error) {
      const err = error as { response?: { data?: { error?: string } } };
      toaster.create({
        title: "Błąd",
        description:
          err?.response?.data?.error || "Nie udało się zaktualizować naprawy",
        type: "error",
        duration: 5000,
      });
    }
  };

  const handleDeleteMaintenance = async (maintenance: Maintenance) => {
    try {
      await axios.delete(`/api/maintenance/${maintenance.id}`);
      toaster.create({
        title: "Usunięto",
        description: "Naprawa została usunięta",
        type: "success",
        duration: 3000,
      });
      mutateMaintenance();
    } catch (error) {
      const err = error as { response?: { data?: { error?: string } } };
      toaster.create({
        title: "Błąd",
        description:
          err?.response?.data?.error || "Nie udało się usunąć naprawy",
        type: "error",
        duration: 5000,
      });
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const maintenanceColumns: ColumnDef<Maintenance, any>[] = [
    maintenanceColumnHelper.accessor("id", {
      header: "ID",
      cell: (i) => i.getValue(),
    }),
    maintenanceColumnHelper.accessor("date", {
      header: "Data naprawy",
      cell: (i) => new Date(i.getValue()).toLocaleDateString("pl-PL"),
    }),
    maintenanceColumnHelper.accessor("cost", {
      header: "Koszt",
      cell: (i) => `${i.getValue().toFixed(2)} zł`,
    }),
    maintenanceColumnHelper.accessor("description", {
      header: "Opis",
      cell: (i) => i.getValue() || "-",
    }),
    maintenanceColumnHelper.display({
      id: "actions",
      header: "Akcje",
      cell: (info) => {
        const m = info.row.original;
        return (
          <Box display="flex" gap={2}>
            <Button
              size="sm"
              bg="purple.600"
              color="white"
              _hover={{ bg: "purple.400" }}
              onClick={() => handleEditMaintenance(m)}
            >
              Edytuj
            </Button>
            <Button
              size="sm"
              bg="brand.600"
              color="white"
              _hover={{ bg: "brand.400" }}
              onClick={() => handleDeleteMaintenance(m)}
            >
              Usuń
            </Button>
          </Box>
        );
      },
    }),
  ];

  const maintenanceTable = useReactTable({
    data: maintenanceData || [],
    columns: maintenanceColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (eqLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minH="60vh"
        >
          <Spinner size="xl" color="brand.600" />
        </Box>
      </Container>
    );
  }

  if (eqError || !equipment) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box textAlign="center">
          <Heading size="lg" mb={4}>
            Błąd
          </Heading>
          <Text>Nie znaleziono sprzętu</Text>
          <Button mt={4} onClick={() => router.push("/equipment")}>
            Powrót do listy
          </Button>
        </Box>
      </Container>
    );
  }

  const conditionLabel =
    equipment.condition === "NEW"
      ? "Nowy"
      : equipment.condition === "GOOD"
      ? "Dobry"
      : equipment.condition === "NEEDS_REPAIR"
      ? "Wymaga naprawy"
      : equipment.condition === "OUT_OF_ORDER"
      ? "Uszkodzony"
      : equipment.condition;

  const conditionColor =
    equipment.condition === "NEW"
      ? "green"
      : equipment.condition === "GOOD"
      ? "blue"
      : equipment.condition === "NEEDS_REPAIR"
      ? "orange"
      : "gray";

  return (
    <Box minH="100vh" bg="gray.900" py={8}>
      <Container maxW="container.xl">
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={6}
        >
          <Heading size="xl" color="white">
            Szczegóły sprzętu
          </Heading>
          <Button
            variant="outline"
            colorPalette="purple"
            onClick={() => router.push("/equipment")}
          >
            Powrót do listy
          </Button>
        </Box>

        <Card.Root
          bg="gray.800"
          p={6}
          mb={6}
          borderWidth="1px"
          borderColor="gray.700"
        >
          <Box display="flex" justifyContent="space-between" alignItems="start">
            <Box>
              <Heading size="lg" mb={4} color="white">
                {equipment.name}
              </Heading>
              <Box display="flex" flexDirection="column" gap={2}>
                <Text color="gray.200">
                  <strong>ID:</strong> {equipment.id}
                </Text>
                <Text color="gray.200">
                  <strong>Kategoria:</strong> {equipment.category}
                </Text>
                <Text color="gray.200">
                  <strong>Stan:</strong>{" "}
                  <Badge colorPalette={conditionColor}>{conditionLabel}</Badge>
                </Text>
                <Text color="gray.200">
                  <strong>Data zakupu:</strong>{" "}
                  {new Date(equipment.purchaseDate).toLocaleDateString("pl-PL")}
                </Text>
                <Text color="gray.200">
                  <strong>Ostatnia naprawa:</strong>{" "}
                  {maintenanceData && maintenanceData.length > 0
                    ? new Date(maintenanceData[0].date).toLocaleDateString(
                        "pl-PL"
                      )
                    : "Brak"}
                </Text>
              </Box>
            </Box>
            <Button colorPalette="purple" onClick={() => setIsEditOpen(true)}>
              Edytuj sprzęt
            </Button>
          </Box>
        </Card.Root>

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={4}
        >
          <Heading size="lg" color="white">
            Historia napraw
          </Heading>
          <Button
            size="sm"
            bg="green.600"
            color="white"
            _hover={{ bg: "green.400" }}
            onClick={() => setIsMaintenanceOpen(true)}
          >
            + Dodaj naprawę
          </Button>
        </Box>

        {maintLoading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <Spinner color="brand.600" />
          </Box>
        ) : maintError ? (
          <Text color="red.400">Błąd ładowania historii napraw</Text>
        ) : !maintenanceData || maintenanceData.length === 0 ? (
          <Card.Root
            bg="gray.800"
            p={6}
            borderWidth="1px"
            borderColor="gray.700"
          >
            <Text textAlign="center" color="gray.400">
              Brak historii napraw dla tego sprzętu
            </Text>
          </Card.Root>
        ) : (
          <Box
            overflowX="auto"
            bg="black"
            borderRadius="md"
            borderWidth="1px"
            borderColor="gray.800"
          >
            <Table.Root size="sm" variant="outline">
              <Table.Header>
                {maintenanceTable.getHeaderGroups().map((headerGroup) => (
                  <Table.Row key={headerGroup.id} bg="black">
                    {headerGroup.headers.map((header) => (
                      <Table.ColumnHeader
                        key={header.id}
                        color="gray.200"
                        fontWeight="bold"
                        py={4}
                        borderColor="gray.500"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </Table.ColumnHeader>
                    ))}
                  </Table.Row>
                ))}
              </Table.Header>
              <Table.Body>
                {maintenanceTable.getRowModel().rows.map((row, idx) => (
                  <Table.Row
                    key={row.id}
                    bg={idx % 2 === 0 ? "gray.800" : "gray.700"}
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

        {isEditOpen && equipment && (
          <EquipmentCreateModal
            isOpen={isEditOpen}
            onClose={() => setIsEditOpen(false)}
            onSave={handleEditSave}
            mode="edit"
            initialData={{
              name: equipment.name,
              category: equipment.category,
              condition: equipment.condition,
            }}
          />
        )}

        {isMaintenanceOpen && (
          <MaintenanceCreateModal
            isOpen={isMaintenanceOpen}
            onClose={() => setIsMaintenanceOpen(false)}
            onSave={handleMaintenanceSave}
            equipmentId={Number(id)}
          />
        )}

        {isMaintenanceEditOpen && selectedMaintenance && (
          <MaintenanceCreateModal
            isOpen={isMaintenanceEditOpen}
            onClose={() => {
              setIsMaintenanceEditOpen(false);
              setSelectedMaintenance(null);
            }}
            onSave={handleMaintenanceEditSave}
            equipmentId={Number(id)}
            mode="edit"
            initialData={{
              date: new Date(selectedMaintenance.date)
                .toISOString()
                .split("T")[0],
              cost: selectedMaintenance.cost.toString(),
              description: selectedMaintenance.description || "",
            }}
          />
        )}
      </Container>
    </Box>
  );
}
