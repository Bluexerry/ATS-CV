import fs from 'fs';
import path from 'path';
import { parsePDF } from '../parsers/pdfParser.js';
import { parseDOCX } from '../parsers/docxParser.js';

/**
 * Guarda resultados en formato JSON
 * @param {Object} data - Datos a guardar
 * @param {string} fileName - Nombre del archivo
 * @param {string} outputDir - Directorio de salida
 * @returns {Promise<string>} Ruta al archivo guardado
 */
export async function saveResultsToJSON(data, fileName, outputDir = './data/output') {
    try {
        // Asegurar que el directorio existe
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const filePath = path.join(outputDir, fileName);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return filePath;
    } catch (error) {
        console.error('Error al guardar resultados:', error);
        throw error;
    }
}

/**
 * Verifica si un archivo existe
 * @param {string} filePath - Ruta al archivo
 * @returns {boolean} True si el archivo existe
 */
export function fileExists(filePath) {
    return fs.existsSync(filePath);
}

/**
 * Parsea un archivo de CV independientemente de su formato
 * @param {string} filePath - Ruta al archivo
 * @returns {Promise<Object>} Datos extraídos del archivo
 */
export async function parseResumeFile(filePath) {
    if (!fileExists(filePath)) {
        throw new Error(`El archivo no existe: ${filePath}`);
    }

    const extension = path.extname(filePath).toLowerCase();

    switch (extension) {
        case '.pdf':
            return await parsePDF(filePath);
        case '.docx':
            return await parseDOCX(filePath);
        default:
            throw new Error(`Formato de archivo no soportado: ${extension}`);
    }
}

/**
 * Lista archivos en un directorio con filtrado por extensión
 * @param {string} directory - Directorio a explorar
 * @param {string[]} extensions - Extensiones a incluir
 * @returns {string[]} Lista de archivos que coinciden con las extensiones
 */
export function listFiles(directory, extensions = ['.pdf', '.docx']) {
    try {
        if (!fs.existsSync(directory)) {
            return [];
        }

        return fs.readdirSync(directory)
            .filter(file => {
                const ext = path.extname(file).toLowerCase();
                return extensions.includes(ext);
            })
            .map(file => path.join(directory, file));
    } catch (error) {
        console.error('Error al listar archivos:', error);
        return [];
    }
}

/**
 * Crea una estructura de directorios si no existe
 * @param {string[]} directories - Array de directorios a crear
 */
export function ensureDirectories(directories) {
    directories.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`Directorio creado: ${dir}`);
        }
    });
}