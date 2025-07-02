import { extractDates, detectCVSections } from '../utils/textProcessor.js';

/**
 * Analiza la experiencia laboral en el CV
 * @param {string} text - Texto del CV
 * @returns {Object} Análisis de experiencia laboral
 */
export async function analyzeExperience(text) {
    // Detectar secciones del CV
    const sections = detectCVSections(text);
    const experienceText = sections.experiencia || text;

    // Extraer fechas para estimar duración de experiencia
    const dates = extractDates(experienceText);

    // Estimar años de experiencia basado en el rango de fechas
    const yearsOfExperience = estimateYearsOfExperience(dates);

    // Extraer roles/puestos de trabajo
    const roles = extractJobRoles(experienceText);

    // Detectar patrones de logros
    const achievements = detectAchievements(experienceText);

    return {
        yearsOfExperience,
        roles,
        jobCount: roles.length,
        achievements,
        achievementCount: achievements.length,
        hasMeasurableResults: achievements.some(achievement => /\d+%|\d+ veces|incremento|aumento|reducción|optimización/i.test(achievement))
    };
}

/**
 * Estima los años de experiencia basado en las fechas encontradas
 * @param {string[]} dates - Array de fechas encontradas
 * @returns {number} Años estimados de experiencia
 */
function estimateYearsOfExperience(dates) {
    if (dates.length === 0) {
        return 0;
    }

    let years = new Set();
    const currentYear = new Date().getFullYear();

    // Extraer años de las fechas encontradas
    dates.forEach(dateStr => {
        // Convertir diferentes formatos a año
        const match = dateStr.match(/\b(19|20)\d{2}\b/);
        if (match) {
            const year = parseInt(match[0]);
            if (year <= currentYear) {
                years.add(year);
            }
        }
    });

    // Convertir set a array y ordenar
    const sortedYears = Array.from(years).sort();

    if (sortedYears.length <= 1) {
        return 0;
    }

    // Calcular la diferencia entre el año más antiguo y el más reciente
    const oldestYear = sortedYears[0];
    const mostRecentYear = sortedYears[sortedYears.length - 1];

    return mostRecentYear - oldestYear;
}

/**
 * Extrae posibles roles o puestos de trabajo del texto
 * @param {string} text - Texto a analizar
 * @returns {string[]} Array de roles detectados
 */
function extractJobRoles(text) {
    // Lista de títulos comunes en tecnología
    const commonTitles = [
        'desarrollador', 'developer', 'ingeniero', 'engineer', 'arquitecto', 'architect',
        'programador', 'programmer', 'analista', 'analyst', 'diseñador', 'designer',
        'líder', 'lead', 'jefe', 'head', 'director', 'manager', 'consultor', 'consultant',
        'devops', 'fullstack', 'frontend', 'backend', 'full stack', 'front end', 'back end',
        'qa', 'tester', 'sre', 'data scientist', 'científico de datos'
    ];

    // Patrón regex para detectar títulos de trabajo
    const titlePattern = new RegExp(`\\b(${commonTitles.join('|')})\\s+[\\w\\s]{2,30}\\b`, 'ig');

    // Encontrar coincidencias
    const matches = text.match(titlePattern) || [];

    // Filtrar y limpiar los resultados
    return Array.from(new Set(matches.map(match => match.trim())));
}

/**
 * Detecta logros o resultados en la experiencia laboral
 * @param {string} text - Texto a analizar
 * @returns {string[]} Array de logros detectados
 */
function detectAchievements(text) {
    // Patrones para detectar frases que indican logros
    const achievementPatterns = [
        /\b(logré|logrado|conseguí|conseguido|desarrollé|desarrollado|implementé|implementado)\b.*?\./ig,
        /\b(reduje|reducido|aumenté|aumentado|mejoré|mejorado|optimicé|optimizado)\b.*?\./ig,
        /\b(lideré|liderado|dirigí|dirigido|gestioné|gestionado|coordiné|coordinado)\b.*?\./ig
    ];

    let achievements = [];

    // Aplicar cada patrón y recopilar los resultados
    achievementPatterns.forEach(pattern => {
        const matches = text.match(pattern) || [];
        achievements = [...achievements, ...matches];
    });

    // Eliminar duplicados y limpiar
    return Array.from(new Set(achievements.map(a => a.trim())));
}