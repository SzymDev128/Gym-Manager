"use client";
import React from "react";
import { Button } from "@chakra-ui/react";

const handleReport = async () => {
  const res = await fetch("/api/reports");
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "raport.pdf";
  a.click();
};

export default function ReportButton() {
  return (
    <Button
      onClick={handleReport}
      bg="teal"
      size="md"
      mt={4}
      mb={4}
      px={6}
      py={3}
      borderRadius="md"
      fontWeight="bold"
      boxShadow="md"
    >
      Generuj raport PDF
    </Button>
  );
}
