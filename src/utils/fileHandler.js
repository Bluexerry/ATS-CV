import fs from 'fs/promises'; // Change to Promise-based API
import * as fsSync from 'fs'; // Import synchronous methods separately
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
        if (!fsSync.existsSync(outputDir)) {
            await fs.mkdir(outputDir, { recursive: true });
        }

        const filePath = path.join(outputDir, fileName);
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
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
    return fsSync.existsSync(filePath);
}

// Añadir esta función para buscar archivos CV con nombres flexibles
export async function findCVFiles(directory) {
    try {
        const files = await fs.readdir(directory);
        // Filtrar archivos que podrían ser CVs
        return files.filter(file => {
            const lowerFile = file.toLowerCase();
            return (
                lowerFile.endsWith('.pdf') &&
                (lowerFile.includes('cv') ||
                    lowerFile.includes('resume') ||
                    lowerFile.includes('curriculum'))
            );
        });
    } catch (error) {
        console.error(`Error al leer el directorio ${directory}: ${error.message}`);
        return [];
    }
}

/**
 * Parsea un archivo de CV independientemente de su formato
 * @param {string} filePath - Ruta al archivo
 * @returns {Promise<Object>} Datos extraídos del archivo
 */
export async function parseResumeFile(filePath) {
    try {
        // Comprobar si existe el archivo exacto - using fs.promises
        try {
            await fs.access(filePath); // This will now work with fs from 'fs/promises'
        } catch (error) {
            // Si el archivo no existe, buscar alternativas
            if (error.code === 'ENOENT') {
                const directory = path.dirname(filePath);

                // Verificar que el directorio existe
                try {
                    await fs.access(directory);
                } catch (dirError) {
                    // Crear el directorio si no existe
                    await fs.mkdir(directory, { recursive: true });
                    console.log(`📁 Directorio creado: ${directory}`);
                    throw new Error(`No se encontró ningún CV. Por favor, coloca tu CV en ${directory}`);
                }

                // Buscar archivos CV alternativos
                const cvFiles = await findCVFiles(directory);
                if (cvFiles.length > 0) {
                    // Usar el primer CV encontrado
                    const foundFilePath = path.join(directory, cvFiles[0]);
                    console.log(`📄 CV encontrado: ${cvFiles[0]}`);
                    filePath = foundFilePath; // Actualizar filePath con el archivo encontrado
                } else {
                    throw new Error(`No se encontró ningún CV en ${directory}. Asegúrate de que tu CV sea un PDF y contenga 'cv' en el nombre.`);
                }
            } else {
                throw error; // Relanzar otros errores
            }
        }

        // Ahora procesar el archivo con filePath
        const extension = path.extname(filePath).toLowerCase();

        if (extension === '.pdf') {
            return await parsePDF(filePath);
        } else if (extension === '.docx') {
            return await parseDOCX(filePath);
        } else {
            throw new Error(`Formato no soportado: ${extension}. Solo se aceptan archivos PDF y DOCX.`);
        }
    } catch (error) {
        console.error(`Error procesando el archivo ${filePath}:`, error);
        throw error;
    }
}

/**
 * Lista archivos en un directorio con filtrado por extensión
 * @param {string} directory - Directorio a explorar
 * @param {string[]} extensions - Extensiones a incluir
 * @returns {Promise<string[]>} Lista de archivos que coinciden con las extensiones
 */
export async function listFiles(directory, extensions = ['.pdf', '.docx']) {
    try {
        if (!fsSync.existsSync(directory)) {
            return [];
        }

        const files = await fs.readdir(directory);
        return files
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
        if (!fsSync.existsSync(dir)) {
            fsSync.mkdirSync(dir, { recursive: true });
            console.log(`Directorio creado: ${dir}`);
        }
    });
}