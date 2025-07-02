/**
 * Utilidades para procesamiento avanzado de texto
 */

/**
 * Elimina caracteres especiales y normaliza el texto
 * @param {string} text - Texto a limpiar
 * @returns {string} Texto limpio
 */
export function cleanText(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')  // Reemplaza caracteres especiales con espacios
        .replace(/\s+/g, ' ')      // Reemplaza múltiples espacios con uno solo
        .trim();
}

/**
 * Detecta secciones típicas de un CV a partir del texto
 * @param {string} text - Texto del CV
 * @returns {Object} Secciones detectadas con su contenido
 */
export function detectCVSections(text) {
    const sections = {};
    // Patrones mejorados para detectar secciones estándar de CV
    const sectionPatterns = [
        // Sección de información personal/contacto
        {
            name: 'contacto',
            patterns: [
                /\b(?:contacto|información personal|datos personales|datos de contacto|información de contacto)\b/i,
                /\b(?:contact information|personal information|contact details)\b/i,
                // También detectar si hay un email o teléfono al inicio sin título de sección
                /^[^@\n]{0,40}[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i
            ]
        },

        // Sección de educación
        {
            name: 'educacion',
            patterns: [
                /\b(?:educación|formación académica|estudios|formación|títulos académicos)\b/i,
                /\b(?:education|academic background|studies|qualifications|degrees)\b/i
            ]
        },

        // Sección de experiencia laboral
        {
            name: 'experiencia',
            patterns: [
                /\b(?:experiencia(?:\s+laboral|\s+profesional)?|trayectoria(?:\s+profesional)?|historial(?:\s+laboral)?)\b/i,
                /\b(?:experience|work experience|professional experience|employment history|career history)\b/i
            ]
        },

        // Sección de habilidades
        {
            name: 'habilidades',
            patterns: [
                /\b(?:habilidades|competencias|skills|aptitudes|conocimientos|capacidades)\b/i,
                /\b(?:skills|competencies|technical skills|core competencies)\b/i,
                /\b(?:conocimientos técnicos|habilidades técnicas|lenguajes|technologies)\b/i
            ]
        },

        // Sección de proyectos
        {
            name: 'proyectos',
            patterns: [
                /\b(?:proyectos|portfolio|trabajos realizados|proyectos destacados)\b/i,
                /\b(?:projects|portfolio|relevant projects|case studies)\b/i
            ]
        },

        // Sección de idiomas
        {
            name: 'idiomas',
            patterns: [
                /\b(?:idiomas|lenguajes|conocimientos de idiomas|nivel de idiomas)\b/i,
                /\b(?:languages|language skills|language proficiency)\b/i
            ]
        },

        // Sección de certificaciones
        {
            name: 'certificaciones',
            patterns: [
                /\b(?:certificaciones|certificados|diplomas|acreditaciones|cursos)\b/i,
                /\b(?:certifications|certificates|credentials|accreditations|courses)\b/i
            ]
        },

        // Sección de referencias
        {
            name: 'referencias',
            patterns: [
                /\b(?:referencias|recomendaciones|contactos de referencia)\b/i,
                /\b(?:references|recommendations|referees)\b/i
            ]
        },

        // Sección de resumen/perfil
        {
            name: 'resumen',
            patterns: [
                /\b(?:resumen|perfil|perfil profesional|objetivo profesional|sobre mí|acerca de mí)\b/i,
                /\b(?:summary|profile|professional profile|career objective|about me)\b/i
            ]
        },

        // Sección de logros
        {
            name: 'logros',
            patterns: [
                /\b(?:logros|reconocimientos|éxitos|premios|méritos)\b/i,
                /\b(?:achievements|accomplishments|honors|awards|recognitions)\b/i
            ]
        }
    ];

    // Dividir el texto en líneas
    const lines = text.split('\n');

    let currentSection = 'other';
    sections[currentSection] = [];

    // Primera pasada: buscar líneas que parecen encabezados de sección
    let sectionHeaders = [];
    lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        if (trimmedLine.length > 0 && trimmedLine.length < 50) {
            // Buscar coincidencias con patrones de sección
            for (const section of sectionPatterns) {
                const isMatch = section.patterns.some(pattern => pattern.test(trimmedLine));
                if (isMatch) {
                    sectionHeaders.push({
                        index,
                        name: section.name,
                        line: trimmedLine
                    });
                    break;
                }
            }
        }
    });

    // Ordenar los encabezados por su posición en el texto
    sectionHeaders.sort((a, b) => a.index - b.index);

    // Segunda pasada: extraer contenido de cada sección
    sectionHeaders.forEach((header, idx) => {
        const nextHeader = sectionHeaders[idx + 1];
        const startIdx = header.index + 1;
        const endIdx = nextHeader ? nextHeader.index : lines.length;

        const sectionContent = lines.slice(startIdx, endIdx).join('\n');
        sections[header.name] = sectionContent.trim();
    });

    // Extraer "other" como todo lo que está antes del primer encabezado
    if (sectionHeaders.length > 0) {
        const firstHeaderIdx = sectionHeaders[0].index;
        if (firstHeaderIdx > 0) {
            sections.other = lines.slice(0, firstHeaderIdx).join('\n').trim();
        }
    } else {
        // Si no se detectaron secciones, todo va a "other"
        sections.other = text;
    }

    return sections;
}

/**
 * Extrae fechas del texto en formato YYYY-MM o YYYY
 * @param {string} text - Texto a analizar
 * @returns {string[]} Array de fechas encontradas
 */
export function extractDates(text) {
    // Patrones ampliados para detectar diferentes formatos de fecha
    const datePatterns = [
        // Formatos numéricos (MM/YYYY, MM-YYYY, YYYY/MM, YYYY-MM)
        /(0?[1-9]|1[0-2])[\/\-](20\d{2}|19\d{2})/g,
        /(20\d{2}|19\d{2})[\/-](0?[1-9]|1[0-2])/g,

        // Años solos
        /\b(20\d{2}|19\d{2})\b/g,

        // Fechas con mes escrito en inglés
        /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* (20\d{2}|19\d{2})\b/gi,
        /\b(20\d{2}|19\d{2}) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\b/gi,

        // Fechas con mes escrito en español
        /\b(Ene|Feb|Mar|Abr|May|Jun|Jul|Ago|Sep|Oct|Nov|Dic)[a-z]* (20\d{2}|19\d{2})\b/gi,
        /\b(20\d{2}|19\d{2}) (Ene|Feb|Mar|Abr|May|Jun|Jul|Ago|Sep|Oct|Nov|Dic)[a-z]*\b/gi,

        // Fechas completas (con día)
        /\b\d{1,2}[\/-](0?[1-9]|1[0-2])[\/-](20\d{2}|19\d{2})\b/g,
        /\b(20\d{2}|19\d{2})[\/-](0?[1-9]|1[0-2])[\/-]\d{1,2}\b/g
    ];

    let allDates = [];

    // Aplicar cada patrón y recopilar los resultados
    datePatterns.forEach(pattern => {
        const matches = text.match(pattern) || [];
        allDates = [...allDates, ...matches];
    });

    // Eliminar duplicados
    return Array.from(new Set(allDates));
}

/**
 * Extrae posibles direcciones de correo electrónico del texto
 * @param {string} text - Texto a analizar
 * @returns {string[]} Array de direcciones de correo encontradas
 */
export function extractEmails(text) {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    return text.match(emailRegex) || [];
}

/**
 * Extrae posibles números de teléfono del texto
 * @param {string} text - Texto a analizar
 * @returns {string[]} Array de números de teléfono encontrados
 */
export function extractPhoneNumbers(text) {
    const phoneRegex = /(?:\+?\d{1,3}[- ]?)?\(?(?:\d{2,3})\)?[- ]?\d{3,4}[- ]?\d{3,4}/g;
    return text.match(phoneRegex) || [];
}