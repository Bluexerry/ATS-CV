/**
 * Analizador de formato de CV para compatibilidad con ATS
 */
import { detectCVSections } from '../utils/textProcessor.js';

/**
 * Analiza el formato del CV para detectar problemas de compatibilidad con ATS
 * @param {string} text - Texto completo del CV
 * @param {Object} pdfData - Datos adicionales del PDF
 * @returns {Object} Análisis de formato con problemas detectados
 */
export function analyzeFormat(text, pdfData) {
    const sections = detectCVSections(text);
    const formatIssues = [];
    const formatScore = {
        structure: 0,
        readability: 0,
        sections: 0,
        consistency: 0,
        total: 0
    };

    // ====== ANÁLISIS DE SECCIONES ======
    const sectionCount = Object.keys(sections).filter(section => section !== 'other' && sections[section]).length;
    if (sectionCount < 3) {
        formatIssues.push('No se detectan secciones claramente definidas. Los sistemas ATS necesitan secciones claras para categorizar correctamente la información.');
        formatScore.structure = 30;
    } else if (sectionCount >= 3 && sectionCount < 5) {
        formatScore.structure = 70;
    } else {
        formatScore.structure = 100;
    }

    // ====== ANÁLISIS DE SECCIONES CRÍTICAS ======
    const criticalSections = [
        { name: 'experiencia', label: 'experiencia laboral' },
        { name: 'educacion', label: 'educación' },
        { name: 'habilidades', label: 'habilidades' }
    ];

    const missingSections = criticalSections.filter(
        section => !sections[section.name] || sections[section.name].length < 50
    );

    if (missingSections.length > 0) {
        formatIssues.push(`Secciones importantes con contenido insuficiente o ausente: ${missingSections.map(s => s.label).join(', ')}. Los sistemas ATS buscan estas secciones específicamente.`);
        formatScore.sections = 100 - (missingSections.length * 33);
    } else {
        formatScore.sections = 100;
    }

    // ====== ANÁLISIS DE LEGIBILIDAD ======
    const avgCharactersPerLine = calculateAvgCharactersPerLine(text);
    if (avgCharactersPerLine > 100) {
        formatIssues.push('Líneas de texto demasiado largas. Esto suele indicar un formato de múltiples columnas que los ATS no pueden procesar correctamente. Utiliza un diseño de una sola columna.');
        formatScore.readability = 40;
    } else if (avgCharactersPerLine < 20 && text.length > 1000) {
        formatIssues.push('Líneas de texto muy cortas. Podría indicar un formato demasiado fragmentado que dificulta la lectura automática. Evita el uso excesivo de saltos de línea.');
        formatScore.readability = 60;
    } else {
        formatScore.readability = 100;
    }

    // ====== DETECCIÓN DE ELEMENTOS PROBLEMÁTICOS ======

    // Detección de posibles tablas
    const potentialTables = detectPotentialTables(text);
    if (potentialTables > 0) {
        formatIssues.push(`Se detectaron posibles tablas (${potentialTables}). Los sistemas ATS suelen tener problemas para procesar información en formato de tabla. Convierte las tablas a listas con viñetas o texto sencillo.`);
        formatScore.readability -= 20 * Math.min(potentialTables, 3);
    }

    // Detección de posibles elementos gráficos
    const graphicElementsCount = detectGraphicElements(text);
    if (graphicElementsCount > 2) {
        formatIssues.push('Se detectaron posibles elementos gráficos o caracteres especiales. Los sistemas ATS pueden confundirse con estos elementos. Usa formato de texto simple.');
        formatScore.readability -= 15;
    }

    // ====== ANÁLISIS DE CONSISTENCIA ======
    const consistencyIssues = analyzeFormatConsistency(text, sections);
    if (consistencyIssues.length > 0) {
        formatIssues.push(...consistencyIssues);
        formatScore.consistency = 100 - (consistencyIssues.length * 20);
    } else {
        formatScore.consistency = 100;
    }

    // ====== PUNTUACIÓN TOTAL DE FORMATO (PONDERADA) ======
    formatScore.total = Math.round(
        (formatScore.structure * 0.25) +
        (formatScore.readability * 0.35) +
        (formatScore.sections * 0.25) +
        (formatScore.consistency * 0.15)
    );

    // ====== ANÁLISIS DE NÚMERO DE PÁGINAS ======
    if (pdfData && pdfData.numpages > 2) {
        const severity = pdfData.numpages > 4 ?
            'considerablemente largo' :
            'ligeramente largo';

        formatIssues.push(`El CV tiene ${pdfData.numpages} páginas, lo que es ${severity}. La mayoría de reclutadores prefieren CVs de 1-2 páginas, y los sistemas ATS pueden tener problemas con documentos extensos. Considera priorizar la información más relevante.`);
    }

    // ====== ANÁLISIS DE DENSIDAD DE TEXTO ======
    const textDensity = text.length / (pdfData?.numpages || 1);
    if (textDensity > 5000) {
        formatIssues.push('El CV tiene una alta densidad de texto por página. Los sistemas ATS prefieren documentos con espaciado adecuado. Considera añadir más espacio en blanco para mejorar la legibilidad.');
    }

    return {
        formatScore,
        formatIssues,
        sectionCount,
        hasDetectedSections: sectionCount > 2,
        avgCharactersPerLine,
        potentialTableCount: potentialTables,
        graphicElementsCount,
        textDensity,
        sectionAnalysis: {
            presentSections: Object.keys(sections).filter(section => section !== 'other' && sections[section]),
            missingSections: missingSections.map(s => s.name)
        }
    };
}

/**
 * Calcula el promedio de caracteres por línea
 * @param {string} text - Texto a analizar
 * @returns {number} Promedio de caracteres por línea
 */
function calculateAvgCharactersPerLine(text) {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    if (lines.length === 0) return 0;

    const totalCharacters = lines.reduce((sum, line) => sum + line.length, 0);
    return Math.round(totalCharacters / lines.length);
}

/**
 * Detecta posibles tablas en el texto
 * @param {string} text - Texto a analizar
 * @returns {number} Número estimado de tablas detectadas
 */
function detectPotentialTables(text) {
    const lines = text.split('\n');
    let potentialTables = 0;
    let consecutiveTableRows = 0;

    // Patrones que pueden indicar filas de tabla
    const tableRowPatterns = [
        /\|.*\|/,              // Líneas con separadores de pipe
        /\t.*\t/,              // Múltiples tabulaciones
        /\s{3,}[^\s]+\s{3,}/,  // Múltiples espacios consecutivos que pueden indicar columnas
        /^\s*[•\-\*]\s+.*\s{4,}.*$/,  // Líneas con viñetas seguidas de espaciado columnar
        /^\s*\d+[\.\)]\s+.*\s{4,}.*$/  // Líneas numeradas con espaciado columnar
    ];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const isTableRow = tableRowPatterns.some(pattern => pattern.test(line));

        if (isTableRow) {
            consecutiveTableRows++;
            if (consecutiveTableRows >= 3) {
                potentialTables++;
                consecutiveTableRows = 0;
            }
        } else {
            consecutiveTableRows = 0;
        }
    }

    return potentialTables;
}

/**
 * Detecta posibles elementos gráficos o caracteres especiales
 * @param {string} text - Texto a analizar
 * @returns {number} Número estimado de elementos gráficos
 */
function detectGraphicElements(text) {
    // Caracteres que pueden indicar elementos gráficos
    const graphicPatterns = [
        /[☑☐☒√✓✔✕✖✗]/g,     // Caracteres de marca
        /[▪■□▫▬▭▮▯]/g,       // Caracteres de bloque
        /[◆◇◈◉○●◌◍]/g,       // Caracteres de forma
        /[↑↓←→↔↕⇑⇓⇐⇒]/g,    // Flechas
        /[\u2500-\u257F]/g,  // Caracteres de caja de dibujo Unicode
        /[═║╒╓╔╕╖╗╘╙╚╛╜╝╞╟╠╡╢╣╤╥╦╧╨╩╪╫╬]/g // Caracteres de borde doble
    ];

    let count = 0;
    graphicPatterns.forEach(pattern => {
        const matches = text.match(pattern);
        if (matches) {
            count += matches.length;
        }
    });

    // Detectar líneas largas de caracteres repetidos (separadores gráficos)
    const lines = text.split('\n');
    const separatorPattern = /^[=\-_*]{5,}$/;
    lines.forEach(line => {
        if (separatorPattern.test(line.trim())) {
            count++;
        }
    });

    return count;
}

/**
 * Analiza la consistencia del formato en diferentes secciones
 * @param {string} text - Texto completo
 * @param {Object} sections - Secciones detectadas
 * @returns {string[]} Problemas de consistencia detectados
 */
function analyzeFormatConsistency(text, sections) {
    const issues = [];

    // Analizar inconsistencias en la experiencia laboral
    if (sections.experiencia) {
        const expText = sections.experiencia;
        const dateFormats = detectDateFormats(expText);

        if (dateFormats.size > 1) {
            issues.push('Formatos de fecha inconsistentes en la sección de experiencia. Usa un único formato de fecha para mejorar la legibilidad ATS.');
        }

        // Verificar si hay inconsistencia en el formato de las viñetas
        const bulletStyles = detectBulletStyles(expText);
        if (bulletStyles.size > 1) {
            issues.push('Estilos de viñetas inconsistentes en el CV. Usa un solo tipo de viñeta para mejorar la coherencia y la legibilidad ATS.');
        }
    }

    // Analizar inconsistencias en los encabezados de sección
    const headerCapitalization = new Set();
    Object.keys(sections).forEach(section => {
        if (section !== 'other' && sections[section]) {
            const lines = sections[section].split('\n').filter(line => line.trim().length > 0);
            if (lines.length > 0) {
                const firstLine = lines[0].trim();
                if (firstLine === firstLine.toUpperCase()) headerCapitalization.add('uppercase');
                else if (firstLine[0] === firstLine[0].toUpperCase()) headerCapitalization.add('capitalized');
                else headerCapitalization.add('lowercase');
            }
        }
    });

    if (headerCapitalization.size > 1) {
        issues.push('Capitalización inconsistente en los encabezados de sección. Usa un estilo consistente para los títulos de sección.');
    }

    // Verificar problemas comunes de espaciado
    if (text.includes('  ')) {
        const doubleSpaces = (text.match(/  +/g) || []).length;
        if (doubleSpaces > 10) {
            issues.push('Uso excesivo de espacios múltiples. Los sistemas ATS pueden interpretar incorrectamente el espaciado. Usa un solo espacio entre palabras.');
        }
    }

    return issues;
}

/**
 * Detecta formatos de fecha utilizados en el texto
 * @param {string} text - Texto a analizar
 * @returns {Set} Conjunto de formatos de fecha encontrados
 */
function detectDateFormats(text) {
    const datePatterns = [
        /\d{1,2}\/\d{1,2}\/\d{2,4}/,  // MM/DD/YYYY o DD/MM/YYYY
        /\d{1,2}-\d{1,2}-\d{2,4}/,    // MM-DD-YYYY o DD-MM-YYYY
        /\d{2,4}\/\d{1,2}\/\d{1,2}/,  // YYYY/MM/DD
        /\d{2,4}-\d{1,2}-\d{1,2}/,    // YYYY-MM-DD
        /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{2,4}\b/, // Month YYYY
        /\b\d{2,4} (?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\b/, // YYYY Month
        /\b(?:Ene|Feb|Mar|Abr|May|Jun|Jul|Ago|Sep|Oct|Nov|Dic)[a-z]* \d{2,4}\b/, // Mes YYYY (español)
        /\b\d{2,4} (?:Ene|Feb|Mar|Abr|May|Jun|Jul|Ago|Sep|Oct|Nov|Dic)[a-z]*\b/  // YYYY Mes (español)
    ];

    const formats = new Set();
    datePatterns.forEach(pattern => {
        if (pattern.test(text)) {
            formats.add(pattern.toString());
        }
    });

    return formats;
}

/**
 * Detecta estilos de viñetas utilizados en el texto
 * @param {string} text - Texto a analizar
 * @returns {Set} Conjunto de estilos de viñeta encontrados
 */
function detectBulletStyles(text) {
    const bulletPatterns = [
        /^\s*•/m,     // Viñeta circular
        /^\s*\*/m,    // Asterisco
        /^\s*-/m,     // Guión
        /^\s*\+/m,    // Signo más
        /^\s*>/m,     // Mayor que
        /^\s*◦/m,     // Viñeta circular vacía
        /^\s*▪/m,     // Cuadrado pequeño
        /^\s*✓/m,     // Marca de verificación
        /^\s*\d+\./m, // Número seguido de punto
        /^\s*\(\d+\)/m // Número entre paréntesis
    ];

    const styles = new Set();
    bulletPatterns.forEach(pattern => {
        if (pattern.test(text)) {
            styles.add(pattern.toString());
        }
    });

    return styles;
}