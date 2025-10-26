import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Package,
  Truck,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
  XCircle,
  Edit3,
  Save,
  Loader,
  Copy,
  ExternalLink,
  Eye,
  FileImage,
  Shield,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  ShieldCheck,
  ShieldX,
  FileText,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const PrintButtons = ({
  order,
  formatCurrency,
  formatDate,
  companyName = "RENT-A-CLICK",
}) => {
  const calculatePenalty = () => {
    if (order.itemReturned) return 0;
    try {
      const endDate = order.rentalDetails?.endDate;
      if (!endDate) return 0;

      let returnDate;
      if (typeof endDate === "string") {
        returnDate = new Date(endDate);
      } else if (endDate?.seconds) {
        returnDate = new Date(endDate.seconds * 1000);
      } else if (endDate instanceof Date) {
        returnDate = endDate;
      } else if (endDate?.toDate) {
        returnDate = endDate.toDate();
      } else {
        returnDate = new Date(endDate);
      }

      if (isNaN(returnDate.getTime())) return 0;
      return new Date() > returnDate ? 150 : 0;
    } catch {
      return 0;
    }
  };

  const safeFormatDate = (date) => {
    if (!date) return "N/A";
    try {
      let validDate;
      if (date && typeof date === "object" && date.seconds !== undefined) {
        validDate = new Date(date.seconds * 1000);
      } else if (date && typeof date.toDate === "function") {
        validDate = date.toDate();
      } else if (date instanceof Date) {
        validDate = date;
      } else {
        validDate = new Date(date);
      }

      if (isNaN(validDate.getTime())) return "N/A";

      return validDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "N/A";
    }
  };

  const formatDateOnly = (date) => {
    if (!date) return "N/A";
    try {
      let validDate;
      if (date && typeof date === "object" && date.seconds !== undefined) {
        validDate = new Date(date.seconds * 1000);
      } else if (date && typeof date.toDate === "function") {
        validDate = date.toDate();
      } else if (date instanceof Date) {
        validDate = date;
      } else {
        validDate = new Date(date);
      }

      if (isNaN(validDate.getTime())) return "N/A";

      return validDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const generateInvoicePDF = () => {
    const doc = new jsPDF();
    const orderNum = order.id?.slice(-8) || order.orderNumber || "N/A";

    doc.setFontSize(24);
    doc.setFont(undefined, "bold");
    doc.text(companyName, 105, 20, { align: "center" });
    doc.setLineWidth(0.5);
    doc.line(20, 25, 190, 25);

    doc.setFontSize(12);
    doc.setFont(undefined, "normal");
    doc.text("Rental Invoice", 105, 32, { align: "center" });

    doc.setFontSize(11);
    doc.setFont(undefined, "bold");
    doc.text("Invoice To:", 20, 45);
    doc.setFont(undefined, "normal");
    doc.setFontSize(10);
    doc.text(
      `${order.customerInfo?.firstName || ""} ${
        order.customerInfo?.lastName || ""
      }`,
      20,
      52
    );
    doc.text(order.customerInfo?.email || "N/A", 20, 58);
    doc.text(order.customerInfo?.phone || "N/A", 20, 64);
    if (order.customerInfo?.address) {
      const address = `${order.customerInfo.address}${
        order.customerInfo.city ? `, ${order.customerInfo.city}` : ""
      }`;
      const lines = doc.splitTextToSize(address, 80);
      doc.text(lines, 20, 70);
    }

    doc.setFont(undefined, "bold");
    doc.text("Invoice Details:", 130, 45);
    doc.setFont(undefined, "normal");
    doc.text(`Invoice #: ${orderNum}`, 130, 52);
    doc.text(`Date: ${safeFormatDate(order.createdAt)}`, 130, 58);
    doc.text(`Status: ${(order.status || "N/A").toUpperCase()}`, 130, 64);
    doc.text(
      `Payment: ${(order.paymentStatus || "N/A").toUpperCase()}`,
      130,
      70
    );

    let currentY = 85;
    if (order.rentalDetails) {
      doc.setFillColor(245, 245, 245);
      doc.rect(20, currentY, 170, 30, "F");
      doc.setDrawColor(200, 200, 200);
      doc.rect(20, currentY, 170, 30);

      doc.setFont(undefined, "bold");
      doc.setFontSize(10);
      doc.text("Rental Period", 25, currentY + 7);
      doc.setFont(undefined, "normal");
      doc.setFontSize(9);

      doc.text("Start Date:", 25, currentY + 14);
      doc.text(
        formatDateOnly(order.rentalDetails.startDate),
        25,
        currentY + 19
      );

      doc.text("End Date:", 75, currentY + 14);
      doc.text(formatDateOnly(order.rentalDetails.endDate), 75, currentY + 19);

      doc.text("Duration:", 125, currentY + 14);
      const duration =
        order.rentalDetails.duration || order.rentalDetails.rentalDays || 0;
      doc.text(
        `${duration} day${duration !== 1 ? "s" : ""}`,
        125,
        currentY + 19
      );

      doc.text(
        `Pickup Time: ${order.rentalDetails.pickupTime || "9:00 AM"}`,
        25,
        currentY + 25
      );
      doc.text(
        `Return Time: ${order.rentalDetails.returnTime || "5:00 PM"}`,
        75,
        currentY + 25
      );
      doc.text(
        `Delivery: ${(
          order.rentalDetails.deliveryMethod || "N/A"
        ).toUpperCase()}`,
        125,
        currentY + 25
      );

      currentY += 37;
    }

    const items = order.items || order.rentalItems || [];
    const tableData = items.map((item) => {
      const itemPrice = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 1;
      const days =
        parseInt(order.rentalDetails?.duration) ||
        parseInt(order.rentalDetails?.rentalDays) ||
        1;
      const subtotal = itemPrice * quantity * days;

      return [
        item.name || item.title || "Unnamed Item",
        item.brand || "-",
        quantity.toString(),
        formatCurrency(itemPrice),
        days.toString(),
        formatCurrency(subtotal),
      ];
    });

    autoTable(doc, {
      startY: currentY,
      head: [["Item", "Brand", "Qty", "Price/Day", "Days", "Subtotal"]],
      body: tableData,
      theme: "striped",
      headStyles: {
        fillColor: [66, 66, 66],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: "bold",
      },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        2: { halign: "center" },
        3: { halign: "right" },
        4: { halign: "center" },
        5: { halign: "right", fontStyle: "bold" },
      },
    });

    let finalY = doc.lastAutoTable.finalY + 10;
    const summaryX = 120;

    doc.setFontSize(9);
    doc.setFont(undefined, "normal");

    if (order.pricing?.subtotal !== undefined) {
      doc.text("Subtotal:", summaryX, finalY);
      doc.text(formatCurrency(order.pricing.subtotal), 185, finalY, {
        align: "right",
      });
      finalY += 6;
    }

    if (
      order.pricing?.deliveryFee !== undefined &&
      order.pricing.deliveryFee > 0
    ) {
      doc.text("Delivery Fee:", summaryX, finalY);
      doc.text(formatCurrency(order.pricing.deliveryFee), 185, finalY, {
        align: "right",
      });
      finalY += 6;
    }

    if (order.pricing?.tax !== undefined && order.pricing.tax > 0) {
      doc.text("Tax:", summaryX, finalY);
      doc.text(formatCurrency(order.pricing.tax), 185, finalY, {
        align: "right",
      });
      finalY += 6;
    }

    const penalty = calculatePenalty();
    if (penalty > 0) {
      doc.setTextColor(200, 0, 0);
      doc.text("Late Return Penalty:", summaryX, finalY);
      doc.text(formatCurrency(penalty), 185, finalY, { align: "right" });
      finalY += 6;
      doc.setTextColor(0, 0, 0);
    }

    doc.setLineWidth(0.5);
    doc.line(summaryX, finalY, 185, finalY);
    finalY += 5;

    doc.setFont(undefined, "bold");
    doc.setFontSize(11);
    doc.text("Total Amount:", summaryX, finalY);
    doc.text(
      formatCurrency((order.pricing?.total || 0) + penalty),
      185,
      finalY,
      { align: "right" }
    );
    doc.setFont(undefined, "normal");
    finalY += 10;

    doc.setFillColor(245, 245, 245);
    doc.rect(20, finalY, 170, 18, "F");
    doc.setDrawColor(200, 200, 200);
    doc.rect(20, finalY, 170, 18);

    doc.setFont(undefined, "bold");
    doc.setFontSize(10);
    doc.text("Payment Information", 25, finalY + 6);
    doc.setFont(undefined, "normal");
    doc.setFontSize(9);
    doc.text(
      `Method: ${(order.paymentInfo?.method || "N/A").toUpperCase()}`,
      25,
      finalY + 12
    );
    if (order.paymentInfo?.reference) {
      doc.text(`Reference: ${order.paymentInfo.reference}`, 100, finalY + 12);
    }
    finalY += 23;

    doc.setFillColor(245, 245, 245);
    doc.rect(20, finalY, 170, 12, "F");
    doc.setDrawColor(200, 200, 200);
    doc.rect(20, finalY, 170, 12);

    doc.setFont(undefined, "bold");
    doc.setFontSize(9);
    doc.text("Verification Status", 25, finalY + 8);
    doc.setFont(undefined, "normal");
    doc.text(
      `Physical ID Shown: ${order.physicalIdShown ? "Yes" : "No"}`,
      100,
      finalY + 8
    );
    finalY += 17;

    if (order.itemReturned && order.returnedAt) {
      doc.setFillColor(220, 255, 220);
      doc.rect(20, finalY, 170, 12, "F");
      doc.setDrawColor(100, 200, 100);
      doc.rect(20, finalY, 170, 12);

      doc.setFont(undefined, "bold");
      doc.text("Return Information", 25, finalY + 8);
      doc.setFont(undefined, "normal");
      doc.text(
        `Items returned on: ${safeFormatDate(order.returnedAt)}`,
        100,
        finalY + 8
      );
      finalY += 17;
    }

    if (penalty > 0) {
      doc.setFillColor(255, 240, 240);
      doc.setDrawColor(255, 100, 100);
      doc.rect(20, finalY, 170, 18, "FD");
      doc.setTextColor(180, 0, 0);
      doc.setFont(undefined, "bold");
      doc.setFontSize(10);
      doc.text("Late Return Notice", 25, finalY + 6);
      doc.setFont(undefined, "normal");
      doc.setFontSize(8);
      doc.text(
        `A fixed late return penalty of ${formatCurrency(
          penalty
        )} has been applied to this invoice.`,
        25,
        finalY + 12
      );
      doc.setTextColor(0, 0, 0);
    }

    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text("Thank you for your business!", 105, 280, { align: "center" });
    doc.text("This is a computer-generated invoice.", 105, 285, {
      align: "center",
    });

    doc.save(`Invoice_${orderNum}.pdf`);
  };

  const generatePackingSlipPDF = () => {
    const doc = new jsPDF();
    const orderNum = order.id?.slice(-8) || order.orderNumber || "N/A";

    doc.setFontSize(24);
    doc.setFont(undefined, "bold");
    doc.text(companyName, 105, 20, { align: "center" });
    doc.setLineWidth(0.5);
    doc.line(20, 25, 190, 25);

    doc.setFontSize(12);
    doc.setFont(undefined, "normal");
    doc.text("Packing Slip", 105, 32, { align: "center" });

    doc.setFontSize(11);
    doc.setFont(undefined, "bold");
    doc.text("Ship To:", 20, 45);
    doc.setFont(undefined, "normal");
    doc.setFontSize(10);
    doc.text(
      `${order.customerInfo?.firstName || ""} ${
        order.customerInfo?.lastName || ""
      }`,
      20,
      52
    );
    doc.text(order.customerInfo?.phone || "N/A", 20, 58);
    if (order.customerInfo?.address) {
      const address = `${order.customerInfo.address}${
        order.customerInfo.city ? `, ${order.customerInfo.city}` : ""
      }`;
      const lines = doc.splitTextToSize(address, 80);
      doc.text(lines, 20, 64);
    }

    doc.setFont(undefined, "bold");
    doc.text("Order Details:", 130, 45);
    doc.setFont(undefined, "normal");
    doc.text(`Order #: ${orderNum}`, 130, 52);
    doc.text(`Date: ${safeFormatDate(order.createdAt)}`, 130, 58);
    doc.text(
      `Delivery: ${(
        order.rentalDetails?.deliveryMethod || "N/A"
      ).toUpperCase()}`,
      130,
      64
    );

    let currentY = 80;
    if (order.rentalDetails) {
      doc.setFillColor(245, 245, 245);
      doc.rect(20, currentY, 170, 24, "F");
      doc.setDrawColor(200, 200, 200);
      doc.rect(20, currentY, 170, 24);

      doc.setFont(undefined, "bold");
      doc.setFontSize(10);
      doc.text("Rental Schedule", 25, currentY + 7);
      doc.setFont(undefined, "normal");
      doc.setFontSize(9);

      doc.text("Pickup Date & Time:", 25, currentY + 13);
      doc.text(
        `${formatDateOnly(order.rentalDetails.startDate)} at ${
          order.rentalDetails.pickupTime || "9:00 AM"
        }`,
        25,
        currentY + 18
      );

      doc.text("Return Date & Time:", 110, currentY + 13);
      doc.text(
        `${formatDateOnly(order.rentalDetails.endDate)} at ${
          order.rentalDetails.returnTime || "5:00 PM"
        }`,
        110,
        currentY + 18
      );

      currentY += 30;
    }

    const items = order.items || order.rentalItems || [];
    const tableData = items.map((item, index) => [
      (index + 1).toString(),
      item.name || item.title || "Unnamed Item",
      item.brand || "-",
      item.category || "-",
      (item.quantity || 1).toString(),
      "[ ]",
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [["#", "Item Name", "Brand", "Category", "Qty", "Packed"]],
      body: tableData,
      theme: "striped",
      headStyles: {
        fillColor: [66, 66, 66],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: "bold",
      },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 12, halign: "center" },
        4: { halign: "center" },
        5: { halign: "center", cellWidth: 20 },
      },
    });

    let finalY = doc.lastAutoTable.finalY + 10;
    const notesHeight =
      order.rentalDetails?.deliveryMethod === "delivery" ? 38 : 33;

    doc.setFillColor(255, 252, 230);
    doc.setDrawColor(255, 200, 50);
    doc.rect(20, finalY, 170, notesHeight, "FD");

    doc.setFont(undefined, "bold");
    doc.setFontSize(10);
    doc.text("Important Notes", 25, finalY + 7);
    doc.setFont(undefined, "normal");
    doc.setFontSize(8);
    doc.text(
      "• Verify all items are clean and in working condition",
      25,
      finalY + 13
    );
    doc.text(
      "• Include user manuals and accessories for each item",
      25,
      finalY + 18
    );
    doc.text("• Ensure proper packaging to prevent damage", 25, finalY + 23);
    doc.text(
      "• Customer must show physical ID upon delivery/pickup",
      25,
      finalY + 28
    );

    if (order.rentalDetails?.deliveryMethod === "delivery") {
      doc.text(
        "• Confirm delivery address with customer before dispatch",
        25,
        finalY + 33
      );
      finalY += 43;
    } else {
      finalY += 38;
    }

    doc.setFillColor(245, 245, 245);
    doc.rect(20, finalY, 170, 28, "F");
    doc.setDrawColor(200, 200, 200);
    doc.rect(20, finalY, 170, 28);

    doc.setFont(undefined, "bold");
    doc.setFontSize(10);
    doc.text("Verification Checklist", 25, finalY + 7);
    doc.setFont(undefined, "normal");
    doc.setFontSize(8);
    doc.text("[ ] All items counted and verified", 25, finalY + 13);
    doc.text("[ ] Items are clean and functional", 25, finalY + 18);
    doc.text("[ ] Accessories and manuals included", 25, finalY + 23);
    doc.text("[ ] Customer physical ID verified", 110, finalY + 13);
    doc.text("[ ] Customer signature obtained", 110, finalY + 18);
    finalY += 33;

    doc.setLineWidth(0.3);
    doc.line(20, finalY, 90, finalY);
    doc.line(110, finalY, 190, finalY);

    doc.setFontSize(8);
    doc.setFont(undefined, "bold");
    doc.text("Packed By", 20, finalY + 5);
    doc.text("Received By (Customer)", 110, finalY + 5);
    doc.setFont(undefined, "normal");
    doc.text("Name: _______________________", 20, finalY + 12);
    doc.text("Signature: _______________________", 110, finalY + 12);
    doc.text("Date: _______________________", 20, finalY + 19);
    doc.text("Date: _______________________", 110, finalY + 19);

    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text(
      "This packing slip is for internal use and delivery verification only.",
      105,
      285,
      { align: "center" }
    );

    doc.save(`Packing_Slip_${orderNum}.pdf`);
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={generateInvoicePDF}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
      >
        <FileText className="w-4 h-4" />
        Download Invoice PDF
      </button>
      <button
        onClick={generatePackingSlipPDF}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
      >
        <Package className="w-4 h-4" />
        Download Packing Slip PDF
      </button>
    </div>
  );
};

export default PrintButtons;
