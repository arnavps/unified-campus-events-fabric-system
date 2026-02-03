import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

interface CertificateData {
    recipientName: string;
    eventName: string;
    date: string;
    certificateId: string;
    organizerName: string;
}

export class PdfService {
    static async generateCertificate(data: CertificateData): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({
                layout: 'landscape',
                size: 'A4',
            });

            const buffers: Buffer[] = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // Branding / Background (Simple border for now)
            doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke('#1e40af');
            doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60).stroke('#1e40af');

            // Header
            doc.moveDown(2);
            doc.font('Helvetica-Bold').fontSize(40).fillColor('#1e40af').text('CERTIFICATE', { align: 'center' });
            doc.fontSize(20).text('OF PARTICIPATION', { align: 'center' });

            doc.moveDown(2);
            doc.font('Helvetica').fontSize(16).fillColor('black').text('This is to certify that', { align: 'center' });

            doc.moveDown(1);
            doc.font('Helvetica-Bold').fontSize(30).fillColor('#1e3a8a').text(data.recipientName, { align: 'center', underline: true });

            doc.moveDown(1);
            doc.font('Helvetica').fontSize(16).fillColor('black').text('has successfully participated in', { align: 'center' });

            doc.moveDown(1);
            doc.font('Helvetica-Bold').fontSize(25).text(data.eventName, { align: 'center' });

            doc.moveDown(2);
            doc.fontSize(14).text(`Held on ${data.date}`, { align: 'center' });

            doc.moveDown(1);
            doc.text(`Organized by ${data.organizerName}`, { align: 'center' });

            // Footer
            const bottomY = doc.page.height - 100;
            doc.fontSize(10).text(`Certificate ID: ${data.certificateId}`, 50, bottomY, { align: 'left' });
            doc.text('Unified Campus Events Framework', 50, bottomY, { align: 'right' });

            doc.end();
        });
    }
}
