"use client";
import { useEffect, useMemo, useState } from "react";
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

export interface ClassFormData {
  name: string;
  date: string;
  time: string;
  durationMin: string;
  trainerId?: string;
}

export interface TrainerOption {
  id: number;
  label: string;
}

interface ClassCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    startTime: string;
    durationMin: number;
    trainerId?: number | null;
  }) => Promise<void> | void;
  trainers?: TrainerOption[];
}

const EMPTY_FORM: ClassFormData = {
  name: "",
  date: "",
  time: "",
  durationMin: "60",
  trainerId: "",
};

export default function ClassCreateModal({
  isOpen,
  onClose,
  onSave,
  trainers = [],
}: ClassCreateModalProps) {
  const [form, setForm] = useState<ClassFormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const nextHour = new Date(now.getTime());
      nextHour.setMinutes(0, 0, 0);
      nextHour.setHours(
        now.getMinutes() > 0 ? now.getHours() + 1 : now.getHours()
      );
      const d = nextHour.toISOString().split("T")[0];
      const t = nextHour.toTimeString().slice(0, 5);
      setForm({ ...EMPTY_FORM, date: d, time: t });
    }
  }, [isOpen]);

  const canSubmit = useMemo(() => {
    return (
      !!form.name &&
      !!form.date &&
      !!form.time &&
      !!form.durationMin &&
      !Number.isNaN(Number(form.durationMin))
    );
  }, [form]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const startTime = `${form.date}T${form.time}:00`;
    const payload = {
      name: form.name,
      startTime,
      durationMin: Number(form.durationMin),
      trainerId: form.trainerId ? Number(form.trainerId) : null,
    };
    try {
      setSubmitting(true);
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
        maxW="600px"
        mx="auto"
        mt="10%"
        border="1px solid"
        borderColor="gray.700"
        boxShadow="xl"
        padding={"10px"}
      >
        <ModalHeader color="white" pt={6} px={6}>
          Dodaj zajęcia
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
              placeholder="Nazwa zajęć"
              bg="gray.800"
              color="gray.200"
            />
            <Box display="flex" gap={3}>
              <Input
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                bg="gray.800"
                color="gray.200"
              />
              <Input
                name="time"
                type="time"
                value={form.time}
                onChange={handleChange}
                bg="gray.800"
                color="gray.200"
              />
            </Box>
            <Input
              name="durationMin"
              type="number"
              min="15"
              step="5"
              value={form.durationMin}
              onChange={handleChange}
              placeholder="Czas trwania (min)"
              bg="gray.800"
              color="gray.200"
            />
            <select
              name="trainerId"
              value={form.trainerId}
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
              <option value="">Bez trenera</option>
              {trainers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </Box>
        </ModalBody>
        <ModalFooter gap={3} px={6} py={4} mt={4}>
          <Button
            colorScheme="purple"
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            loading={submitting}
          >
            Dodaj
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
