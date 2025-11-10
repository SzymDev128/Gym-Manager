"use client";
import { useState, useEffect } from "react";
import { Box, Button, Input, Textarea } from "@chakra-ui/react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
} from "@chakra-ui/modal";

interface MaintenanceFormData {
  date: string;
  cost: string;
  description: string;
}

interface MaintenanceCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: MaintenanceFormData) => Promise<void> | void;
  equipmentId: number;
  mode?: "create" | "edit";
  initialData?: Partial<MaintenanceFormData>;
}

const EMPTY_FORM: MaintenanceFormData = {
  date: new Date().toISOString().split("T")[0], // Dzisiejsza data
  cost: "",
  description: "",
};

export default function MaintenanceCreateModal({
  isOpen,
  onClose,
  onSave,
  mode = "create",
  initialData,
}: MaintenanceCreateModalProps) {
  const [form, setForm] = useState<MaintenanceFormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && initialData) {
        setForm({
          date: initialData.date || new Date().toISOString().split("T")[0],
          cost: initialData.cost || "",
          description: initialData.description || "",
        });
      } else {
        setForm({
          date: new Date().toISOString().split("T")[0],
          cost: "",
          description: "",
        });
      }
    }
  }, [isOpen, mode, initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.date || !form.cost) {
      return; // Data i koszt są wymagane
    }
    try {
      setSubmitting(true);
      await onSave(form);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(3px)" />
      <ModalContent
        padding={"10px"}
        bg="#1a1a1a"
        color="white"
        w="40vw"
        maxW="40vw"
        mx="auto"
        mt="10%"
        position="relative"
      >
        <ModalCloseButton position="absolute" top="8px" right="8px" />
        <ModalHeader pt={6} px={6} fontSize={25}>
          {mode === "edit" ? "Edytuj naprawę" : "Dodaj naprawę"}
        </ModalHeader>

        <ModalBody px={6} py={4}>
          <Box display="flex" flexDirection="column" gap={4}>
            {/* Data naprawy */}
            <Box>
              <label
                htmlFor="date"
                style={{ display: "block", marginBottom: "4px" }}
              >
                Data naprawy *
              </label>
              <Input
                id="date"
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                bg="gray.800"
                borderColor="gray.700"
                _hover={{ borderColor: "gray.600" }}
                _focus={{ borderColor: "purple.500", boxShadow: "none" }}
              />
            </Box>

            {/* Koszt */}
            <Box>
              <label
                htmlFor="cost"
                style={{ display: "block", marginBottom: "4px" }}
              >
                Koszt (zł) *
              </label>
              <Input
                id="cost"
                name="cost"
                type="number"
                step="0.01"
                min="0"
                placeholder="np. 150.00"
                value={form.cost}
                onChange={handleChange}
                bg="gray.800"
                borderColor="gray.700"
                _hover={{ borderColor: "gray.600" }}
                _focus={{ borderColor: "purple.500", boxShadow: "none" }}
              />
            </Box>

            {/* Opis */}
            <Box>
              <label
                htmlFor="description"
                style={{ display: "block", marginBottom: "4px" }}
              >
                Opis (opcjonalny)
              </label>
              <Textarea
                id="description"
                name="description"
                placeholder="Opis wykonanej naprawy..."
                value={form.description}
                onChange={handleChange}
                bg="gray.800"
                borderColor="gray.700"
                _hover={{ borderColor: "gray.600" }}
                _focus={{ borderColor: "purple.500", boxShadow: "none" }}
                rows={4}
              />
            </Box>
          </Box>
        </ModalBody>

        <ModalFooter gap={3} px={6} py={4} mt={4}>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Anuluj
          </Button>
          <Button
            colorPalette="green"
            onClick={handleSubmit}
            loading={submitting}
            disabled={submitting || !form.date || !form.cost}
          >
            {mode === "edit" ? "Zapisz zmiany" : "Dodaj naprawę"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
