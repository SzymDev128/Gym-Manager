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

import type { TrainerOption } from "./ClassCreateModal";

export interface ClassEditPayload {
  name?: string;
  startTime?: string;
  durationMin?: number;
  trainerId?: number | null;
}

export interface ClassEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainers?: TrainerOption[];
  initial: {
    id: number;
    name: string;
    startTime: string;
    durationMin: number;
    trainerId: number | null;
  } | null;
  onSave: (data: ClassEditPayload) => Promise<void> | void;
}

export default function ClassEditModal({
  isOpen,
  onClose,
  trainers = [],
  initial,
  onSave,
}: ClassEditModalProps) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("60");
  const [trainerId, setTrainerId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && initial) {
      setName(initial.name || "");
      const dt = new Date(initial.startTime);
      // Best-effort local inputs
      const d = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000);
      const dStr = d.toISOString().split("T")[0];
      const tStr = d.toISOString().slice(11, 16);
      setDate(dStr);
      setTime(tStr);
      setDuration(String(initial.durationMin ?? 60));
      setTrainerId(initial.trainerId ? String(initial.trainerId) : "");
    }
  }, [isOpen, initial]);

  const canSubmit = useMemo(() => {
    return (
      !!name &&
      !!date &&
      !!time &&
      !!duration &&
      !Number.isNaN(Number(duration))
    );
  }, [name, date, time, duration]);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const startTime = `${date}T${time}:00`;
    const payload: ClassEditPayload = {
      name,
      startTime,
      durationMin: Number(duration),
      trainerId: trainerId ? Number(trainerId) : null,
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
          Edytuj zajęcia
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nazwa zajęć"
              bg="gray.800"
              color="gray.200"
            />
            <Box display="flex" gap={3}>
              <Input
                name="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                bg="gray.800"
                color="gray.200"
              />
              <Input
                name="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                bg="gray.800"
                color="gray.200"
              />
            </Box>
            <Input
              name="durationMin"
              type="number"
              min="15"
              step="5"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Czas trwania (min)"
              bg="gray.800"
              color="gray.200"
            />
            <select
              name="trainerId"
              value={trainerId}
              onChange={(e) => setTrainerId(e.target.value)}
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
            Zapisz
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
