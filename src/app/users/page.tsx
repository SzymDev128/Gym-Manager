"use client";
import {
  Box,
  Container,
  Heading,
  Text,
  Table,
  Spinner,
  Badge,
} from "@chakra-ui/react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  ColumnDef,
} from "@tanstack/react-table";
import useSWR from "swr";

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  birthDate: string | null;
  roleId: number;
  phoneNumbers: { number: string }[];
  createdAt: string;
}

// Mapowanie roleId na nazwy ról
const ROLE_NAMES: Record<number, string> = {
  1: "USER",
  2: "MEMBER",
  3: "RECEPTIONIST",
  4: "TRAINER",
  5: "ADMIN",
};

const columnHelper = createColumnHelper<User>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const columns: ColumnDef<User, any>[] = [
  columnHelper.accessor("id", {
    header: "ID",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor((row) => `${row.firstName} ${row.lastName}`, {
    id: "fullName",
    header: "Imię i nazwisko",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("email", {
    header: "Email",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("roleId", {
    header: "Rola",
    cell: (info) => {
      const roleName = ROLE_NAMES[info.getValue()] || "UNKNOWN";
      const colorPalette =
        roleName === "ADMIN"
          ? "red"
          : roleName === "TRAINER"
          ? "purple"
          : roleName === "RECEPTIONIST"
          ? "blue"
          : roleName === "MEMBER"
          ? "green"
          : "gray";
      return <Badge colorPalette={colorPalette}>{roleName}</Badge>;
    },
  }),
  columnHelper.accessor("phoneNumbers", {
    header: "Telefon",
    cell: (info) =>
      info.getValue()?.[0]?.number || <Text color="gray.500">Brak</Text>,
  }),
  columnHelper.accessor("createdAt", {
    header: "Data rejestracji",
    cell: (info) => new Date(info.getValue()).toLocaleDateString("pl-PL"),
  }),
];

export default function UsersPage() {
  const { data: users, error, isLoading } = useSWR<User[]>("/api/users");
  console.log(users);

  const table = useReactTable({
    data: users || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Box minH="100vh" bg="black" py={10}>
      <Container maxW="7xl">
        <Heading
          size="2xl"
          bgGradient="linear(to-r, brand.600, brand.400)"
          bgClip="text"
          mb={4}
        >
          👥 Użytkownicy
        </Heading>
        <Text color="gray.400" mb={8}>
          Lista wszystkich użytkowników systemu
        </Text>

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
              Nie udało się załadować użytkowników. Sprawdź połączenie.
            </Text>
          </Box>
        )}

        {users && (
          <Box
            bg="gray.900"
            borderRadius="lg"
            border="1px solid"
            borderColor="gray.800"
            overflow="hidden"
          >
            <Table.Root size="sm" variant="outline">
              <Table.Header>
                {table.getHeaderGroups().map((headerGroup) => (
                  <Table.Row key={headerGroup.id} bg="gray.950">
                    {headerGroup.headers.map((header) => (
                      <Table.ColumnHeader
                        key={header.id}
                        color="gray.200"
                        fontWeight="bold"
                        py={4}
                        borderColor="gray.800"
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
                {table.getRowModel().rows.map((row, index) => (
                  <Table.Row
                    key={row.id}
                    bg={index % 2 === 0 ? "gray.900" : "gray.850"}
                    _hover={{ bg: "gray.800" }}
                    transition="background 0.2s"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <Table.Cell
                        key={cell.id}
                        color="gray.400"
                        py={3}
                        borderColor="gray.800"
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

        {users && users.length === 0 && (
          <Box textAlign="center" py={10}>
            <Text color="gray.500">Brak użytkowników do wyświetlenia</Text>
          </Box>
        )}
      </Container>
    </Box>
  );
}
