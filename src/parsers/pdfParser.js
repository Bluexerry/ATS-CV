import fs from 'fs';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';

export async function parsePDF(pdfPath) {
    try {
        const dataBuffer = fs.readFileSync(pdfPath);
        return await pdfParse(dataBuffer);
    } catch (error) {
        console.error('Error al analizar el PDF:', error);
        throw error;
    }
}