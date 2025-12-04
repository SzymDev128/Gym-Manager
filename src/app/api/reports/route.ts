import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import robotoThinBase64 from "@/lib/RobotoThinBase64";

export async function GET() {
  const trainers = await prisma.trainer.findMany({
    include: {
      employee: {
        include: {
          user: true,
        },
      },
    },
  });

  const doc = new jsPDF();
  doc.addFileToVFS("Roboto-Thin.ttf", robotoThinBase64);
  doc.addFont("Roboto-Thin.ttf", "RobotoThin", "normal");
  doc.setFont("RobotoThin");
  doc.setFontSize(18);
  const today = new Date();
  const dateStr = today.toLocaleDateString("pl-PL");
  doc.text(`Raport trenerów (${dateStr})`, 105, 20, { align: "center" });

  doc.setFontSize(12);
  doc.text(
    "Poniższy raport przedstawia zestawienie wszystkich trenerów zatrudnionych w siłowni, wraz z ich danymi oraz specjalizacją.",
    15,
    28,
    { maxWidth: 180 }
  );

  const tableHead = [
    ["Lp.", "Imię", "Nazwisko", "Specjalizacja", "Doświadczenie [lata]"],
  ];
  const tableBody = trainers.map((t, idx) => [
    idx + 1,
    t.employee.user.firstName || "",
    t.employee.user.lastName || "",
    t.specialization || "",
    t.experienceYears ?? "",
  ]);

  autoTable(doc, {
    head: tableHead,
    body: tableBody,
    startY: 40,
    styles: { font: "RobotoThin", fontSize: 11 },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      font: "RobotoThin",
      fontStyle: "normal",
    },
    theme: "grid",
  });

  const pdfData = doc.output("arraybuffer");
  return new NextResponse(Buffer.from(pdfData), {
    headers: { "Content-Type": "application/pdf" },
  });
}
