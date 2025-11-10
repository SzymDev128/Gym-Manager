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

interface EquipmentFormData {
  name: string;
  category: string;
  condition: string;
}

interface EquipmentCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    data: EquipmentFormData & { purchaseDate?: string }
  ) => Promise<void> | void;
  initialData?: Partial<EquipmentFormData>; // for reuse as edit modal later
  mode?: "create" | "edit";
}

const EMPTY_FORM: EquipmentFormData = {
  name: "",
  category: "",
  condition: "GOOD",
};

export default function EquipmentCreateModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode = "create",
}: EquipmentCreateModalProps) {
  const [form, setForm] = useState<EquipmentFormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm({
        name: initialData?.name || "",
        category: initialData?.category || "",
        condition: initialData?.condition || "GOOD",
      });
    }
  }, [isOpen, initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.category || !form.condition) {
      return; // optionally show validation toast externally
    }
    try {
      setSubmitting(true);
      // Add current date for create mode
      const payload =
        mode === "create"
          ? { ...form, purchaseDate: new Date().toISOString().split("T")[0] }
          : form;
      await onSave(payload);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      motionPreset="slideInBottom"
    >
      <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(3px)" />
      <ModalContent
        bg="#1a1a1a"
        color="gray.200"
        w="40vw"
        maxW="40vw"
        mx="auto"
        mt="10%"
        border="1px solid"
        borderColor="gray.700"
        boxShadow="xl"
        padding={"10px"}
      >
        <ModalHeader color="white" pt={6} px={6}>
          {mode === "create" ? "Dodaj sprzęt" : "Edytuj sprzęt"}
        </ModalHeader>
        <ModalCloseButton
          color="white"
          position="absolute"
          top="8px"
          right="8px"
        />
        <ModalBody px={6} py={4}>
          <Box as="form" gap={4} display="flex" flexDirection="column">
            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Nazwa"
              bg="gray.800"
              color="gray.200"
            />
            <Input
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="Kategoria"
              bg="gray.800"
              color="gray.200"
            />
            <select
              name="condition"
              value={form.condition}
              onChange={handleChange}
              style={{
                background: "#1a1a1a",
                color: "#e5e5e5",
                padding: "0.5rem",
                borderRadius: "0.375rem",
                border: "1px solid #333",
                width: "100%",
              }}
            >
              <option value="NEW">Nowy</option>
              <option value="GOOD">Dobry</option>
              <option value="NEEDS_REPAIR">Wymaga naprawy</option>
              <option value="OUT_OF_ORDER">Uszkodzony</option>
            </select>
          </Box>
        </ModalBody>
        <ModalFooter gap={3} px={6} py={4} mt={4}>
          <Button
            colorScheme="purple"
            onClick={handleSubmit}
            loading={submitting}
            disabled={submitting}
          >
            {mode === "create" ? "Dodaj" : "Zapisz"}
          </Button>
          <Button
            bg="red.600"
            color="white"
            _hover={{ bg: "red.700" }}
            onClick={onClose}
            disabled={submitting}
          >
            Anuluj
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
