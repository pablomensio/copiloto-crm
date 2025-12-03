import { jsPDF } from 'jspdf';
import { TradeInAppraisal, SellerProfile } from '../types';

export const generateAppraisalPDF = (
    appraisal: TradeInAppraisal,
    leadName: string,
    sellerProfile: SellerProfile
): Blob => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Helper for centering text
    const centerText = (text: string, y: number) => {
        const textWidth = doc.getStringUnitWidth(text) * doc.getFontSize() / doc.internal.scaleFactor;
        const x = (pageWidth - textWidth) / 2;
        doc.text(text, x, y);
    };

    // --- Header ---
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    centerText('TASACIÓN DE VEHÍCULO USADO', 20);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    centerText('Meny Cars - Concesionaria Oficial', 28);

    // Line separator
    doc.setLineWidth(0.5);
    doc.line(20, 35, pageWidth - 20, 35);

    // --- Client Info ---
    doc.setFontSize(12);
    doc.text(`Cliente: ${leadName}`, 20, 45);
    doc.text(`Fecha: ${new Date(appraisal.createdAt).toLocaleDateString('es-AR')}`, 20, 52);
    doc.text(`Vendedor: ${sellerProfile.name}`, 20, 59);

    // --- Vehicle Data ---
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setFillColor(240, 240, 240);
    doc.rect(20, 65, pageWidth - 40, 8, 'F');
    doc.text('DATOS DEL VEHÍCULO', 22, 71);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    let y = 82;
    const col1 = 20;
    const col2 = 100;

    doc.text(`Marca: ${appraisal.vehicleData.make}`, col1, y);
    doc.text(`Modelo: ${appraisal.vehicleData.model}`, col2, y);
    y += 8;
    doc.text(`Año: ${appraisal.vehicleData.year}`, col1, y);
    doc.text(`Kilometraje: ${appraisal.vehicleData.mileage.toLocaleString()} km`, col2, y);
    y += 8;
    doc.text(`Transmisión: ${appraisal.vehicleData.transmission}`, col1, y);
    doc.text(`Combustible: ${appraisal.vehicleData.fuelType}`, col2, y);
    y += 8;
    doc.text(`Estado: ${appraisal.vehicleData.condition}`, col1, y);

    if (appraisal.vehicleData.observations) {
        y += 10;
        doc.setFont("helvetica", "italic");
        doc.text(`Observaciones: ${appraisal.vehicleData.observations}`, col1, y, { maxWidth: pageWidth - 40 });
        // Adjust y based on text height if needed, keeping simple for now
        y += 10;
    } else {
        y += 10;
    }

    // --- Market Analysis ---
    y += 10;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setFillColor(240, 240, 240);
    doc.rect(20, y, pageWidth - 40, 8, 'F');
    doc.text('ANÁLISIS DE MERCADO', 22, y + 6);

    y += 15;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Precio Promedio de Mercado: $${appraisal.marketAnalysis.avg_price.toLocaleString()}`, 20, y);
    y += 8;
    doc.text(`Rango Estimado: $${appraisal.marketAnalysis.min_price.toLocaleString()} - $${appraisal.marketAnalysis.max_price.toLocaleString()}`, 20, y);

    // --- Offer ---
    y += 20;
    doc.setDrawColor(0, 100, 0);
    doc.setLineWidth(1);
    doc.rect(20, y, pageWidth - 40, 25);

    doc.setFontSize(12);
    doc.text('VALOR DE TOMA OFRECIDO', pageWidth / 2, y + 8, { align: 'center' });

    doc.setFontSize(20);
    doc.setTextColor(0, 100, 0); // Green
    doc.setFont("helvetica", "bold");
    doc.text(`$${appraisal.offeredValue.toLocaleString()}`, pageWidth / 2, y + 18, { align: 'center' });

    // Reset color
    doc.setTextColor(0, 0, 0);

    // --- Footer ---
    y += 40;
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text('Esta tasación tiene una validez de 7 días corridos desde su fecha de emisión.', 20, y);
    doc.text('El valor final está sujeto a revisión mecánica y de documentación.', 20, y + 5);

    y += 15;
    doc.setFont("helvetica", "normal");
    doc.text(`Contacto: ${sellerProfile.phoneNumber || ''} | ${sellerProfile.companyName || 'Meny Cars'}`, 20, y);

    return doc.output('blob');
};
