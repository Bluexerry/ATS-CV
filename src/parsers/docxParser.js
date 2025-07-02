import fs from 'fs';
import mammoth from 'mammoth';

/**
 * Extrae el texto de un archivo DOCX
 * @param {string} docxPath - Ruta al archivo DOCX
 * @returns {Promise<Object>} Objeto con el texto extraído y metadatos
 */
export async function parseDOCX(docxPath) {
    try {
        const buffer = fs.readFileSync(docxPath);
        const result = await mammoth.extractRawText({ buffer });
        const text = result.value;

        // Estimación aproximada del número de páginas (basado en caracteres)
        const approxCharsPerPage = 3000;
        const estimatedPages = Math.max(1, Math.ceil(text.length / approxCharsPerPage));

        return {
            text,
            numpages: estimatedPages,
            info: {
                format: 'docx',
                extracted: true,
                warnings: result.messages
            }
        };
    } catch (error) {
        console.error('Error al analizar el archivo DOCX:', error);
        throw error;
    }
}