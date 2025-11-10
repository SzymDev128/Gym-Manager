"use client";
import { useState, useEffect } from "react";
import { Box, Button, Input } from "@chakra-ui/react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
} from "@chakra-ui/modal";

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  birthDate: string | null;
  roleId: number;
  phoneNumbers: { number: string }[];
}

interface UsersEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSave: (updatedUser: {
    firstName?: string;
    lastName?: string;
    email?: string;
    birthDate?: string;
    role?: string;
    phoneNumbers?: string[];
  }) => void;
}

export default function UsersEditModal({
  isOpen,
  onClose,
  user,
  onSave,
}: UsersEditModalProps) {
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    birthDate: "",
    roleId: 1,
    phoneNumbers: [""],
  });

  useEffect(() => {
    if (user) {
      setEditForm({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        birthDate: user.birthDate ? user.birthDate.substring(0, 10) : "",
        roleId: user.roleId,
        phoneNumbers:
          user.phoneNumbers.length > 0
            ? user.phoneNumbers.map((p) => p.number)
            : [""],
      });
    }
  }, [user]);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const handlePhoneChange = (index: number, value: string) => {
    const newPhones = [...editForm.phoneNumbers];
    newPhones[index] = value;
    setEditForm({ ...editForm, phoneNumbers: newPhones });
  };

  const addPhone = () => {
    setEditForm({ ...editForm, phoneNumbers: [...editForm.phoneNumbers, ""] });
  };

  const removePhone = (index: number) => {
    if (editForm.phoneNumbers.length > 1) {
      const newPhones = editForm.phoneNumbers.filter((_, i) => i !== index);
      setEditForm({ ...editForm, phoneNumbers: newPhones });
    }
  };

  const ROLE_NAMES: Record<number, string> = {
    1: "USER",
    2: "MEMBER",
    3: "RECEPTIONIST",
    4: "TRAINER",
    5: "ADMIN",
  };

  const handleSave = () => {
    const payload = {
      firstName: editForm.firstName,
      lastName: editForm.lastName,
      email: editForm.email,
      birthDate: editForm.birthDate,
      role: ROLE_NAMES[Number(editForm.roleId)],
      phoneNumbers: editForm.phoneNumbers
        .map((p) => p.trim())
        .filter((p) => p.length > 0),
    };

    onSave(payload);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      motionPreset="slideInBottom"
    >
      <ModalOverlay
        bg="blackAlpha.800"
        backdropFilter="blur(3px)"
        // style={{
        //   backgroundImage:
        //     "radial-gradient(900px circle at 50% 50%, rgba(255,255,255,0.06), transparent 40%)",
        // }}
      />
      <ModalContent
        bg="#1a1a1a"
        color="gray.200"
        w="40vw"
        maxW="40vw"
        mx="auto"
        mt="10%"
        p={20}
        border="1px solid"
        borderColor="gray.700"
        boxShadow="xl"
      >
        <ModalHeader color={"white"}>Edytuj użytkownika</ModalHeader>
        <ModalCloseButton
          color="white"
          position="absolute"
          top="8px"
          right="8px"
        />
        <ModalBody>
          <Box as="form" gap={4} display="flex" flexDirection="column">
            <Input
              name="firstName"
              value={editForm.firstName}
              onChange={handleFormChange}
              placeholder="Imię"
              bg="gray.800"
              color="gray.200"
            />
            <Input
              name="lastName"
              value={editForm.lastName}
              onChange={handleFormChange}
              placeholder="Nazwisko"
              bg="gray.800"
              color="gray.200"
            />
            <Input
              name="email"
              value={editForm.email}
              onChange={handleFormChange}
              placeholder="Email"
              bg="gray.800"
              color="gray.200"
            />

            <Input
              name="birthDate"
              type="date"
              value={editForm.birthDate}
              onChange={handleFormChange}
              placeholder="Data urodzenia"
              bg="gray.800"
              color="gray.200"
            />
            <select
              name="roleId"
              value={editForm.roleId}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  roleId: Number(e.target.value),
                })
              }
              style={{
                background: "#1a1a1a",
                color: "#e5e5e5",
                padding: "0.5rem",
                borderRadius: "0.375rem",
                border: "1px solid #333",
                width: "100%",
              }}
            >
              <option value={1}>USER</option>
              <option value={2}>MEMBER</option>
              <option value={3}>RECEPTIONIST</option>
              <option value={4}>TRAINER</option>
              <option value={5}>ADMIN</option>
            </select>

            <Box>
              {editForm.phoneNumbers.map((phone, index) => (
                <Box key={index} display="flex" gap={2} mb={2}>
                  <Input
                    value={phone}
                    onChange={(e) => handlePhoneChange(index, e.target.value)}
                    placeholder={`Telefon ${index + 1}`}
                    bg="gray.800"
                    color="gray.200"
                    flex={1}
                  />
                  {editForm.phoneNumbers.length > 1 && (
                    <Button
                      size="sm"
                      bg="red.600"
                      color="white"
                      _hover={{ bg: "red.700" }}
                      onClick={() => removePhone(index)}
                    >
                      Usuń
                    </Button>
                  )}
                </Box>
              ))}
              <Button
                size="sm"
                color={"white"}
                variant="outline"
                colorScheme="green"
                onClick={addPhone}
                mt={2}
              >
                + Dodaj telefon
              </Button>
            </Box>
          </Box>
        </ModalBody>
        <ModalFooter gap={3} mt={"20px"}>
          <Button colorScheme="purple" onClick={handleSave}>
            Zapisz
          </Button>
          <Button
            bg="red.600"
            color="white"
            _hover={{ bg: "red.700" }}
            onClick={onClose}
          >
            Anuluj
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
