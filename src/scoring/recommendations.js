import { getRoleById } from '../config/jobRoles.js';

/**
 * Genera recomendaciones para mejorar el CV basado en el análisis
 * @param {Object} analysis - Resultados del análisis del CV
 * @param {string} targetRole - ID del rol objetivo (opcional)
 * @returns {Object} Recomendaciones estructuradas
 */
export function generateRecommendations(analysis, targetRole = null) {
    const recommendations = {
        general: [],
        keywords: [],
        skills: [],
        experience: [],
        formatting: []
    };

    // Adaptamos para trabajar con la nueva estructura de análisis
    const basicAnalysis = analysis.basic || analysis;
    const keywordsAnalysis = analysis.keywords || {};
    const formatAnalysis = analysis.format || {};
    const experienceAnalysis = analysis.experience || {};

    // Obtener palabras clave y habilidades de la estructura correcta
    const keywordsFound = keywordsAnalysis.keywords || basicAnalysis.keywordsFound || [];
    const skills = basicAnalysis.skills || [];

    // Recomendaciones generales
    if (basicAnalysis.wordCount < 300) {
        recommendations.general.push('El CV es demasiado corto. Considera añadir más detalles sobre tu experiencia y habilidades.');
    }

    if (basicAnalysis.wordCount > 1000) {
        recommendations.general.push('El CV es bastante extenso. Considera acortarlo para mantener la atención del reclutador.');
    }

    if (basicAnalysis.atsScore < 50) {
        recommendations.general.push('La puntuación ATS es baja. Sigue las recomendaciones específicas para mejorarla.');
    }

    // Recomendaciones de palabras clave
    if (keywordsFound.length < 10) {
        recommendations.keywords.push('Incluye más palabras clave relevantes para el sector tecnológico.');
    }

    // Recomendaciones específicas según el rol objetivo
    if (targetRole) {
        const roleInfo = getRoleById(targetRole);

        if (roleInfo) {
            // Comprobar habilidades esenciales que faltan
            const missingEssentialSkills = roleInfo.essentialSkills.filter(
                skill => !skills.some(s => typeof s === 'string' ?
                    s.toLowerCase() === skill.toLowerCase() :
                    s.keyword && s.keyword.toLowerCase() === skill.toLowerCase())
            );

            if (missingEssentialSkills.length > 0) {
                recommendations.skills.push(
                    `Faltan habilidades esenciales para el rol de ${roleInfo.title}: ${missingEssentialSkills.join(', ')}.`
                );
            }

            // Comprobar habilidades preferidas que faltan
            const missingPreferredSkills = roleInfo.preferredSkills.filter(
                skill => !skills.some(s => typeof s === 'string' ?
                    s.toLowerCase() === skill.toLowerCase() :
                    s.keyword && s.keyword.toLowerCase() === skill.toLowerCase())
            );

            if (missingPreferredSkills.length > 0) {
                recommendations.skills.push(
                    `Considera añadir estas habilidades preferidas para el rol de ${roleInfo.title}: ${missingPreferredSkills.join(', ')}.`
                );
            }

            // Comprobar frases clave que faltan
            const cvTextContent = analysis.cvText || '';
            const keyPhrasesFound = roleInfo.keyPhrases.filter(
                phrase => cvTextContent.toLowerCase().includes(phrase.toLowerCase())
            ).length;

            if (keyPhrasesFound < roleInfo.keyPhrases.length / 2) {
                recommendations.keywords.push(
                    `Incluye más frases relacionadas con ${roleInfo.title}, como: "${roleInfo.keyPhrases.slice(0, 3).join('", "')}", etc.`
                );
            }
        }
    }

    // Recomendaciones sobre la experiencia
    if (experienceAnalysis) {
        if (experienceAnalysis.hasMeasurableResults === false) {
            recommendations.experience.push(
                'Añade resultados cuantificables en tu experiencia laboral (ej: "Aumenté el rendimiento en un 25%", "Reduje los tiempos de carga en un 40%").'
            );
        }

        if (experienceAnalysis.roles && experienceAnalysis.roles.length === 0) {
            recommendations.experience.push(
                'No se detectan roles claros en tu experiencia. Asegúrate de incluir títulos de puesto específicos y destacados.'
            );
        }
    }

    // MEJORA: Recomendaciones específicas sobre formato
    if (formatAnalysis) {
        // Añadir problemas de formato detectados
        if (formatAnalysis.formatIssues && formatAnalysis.formatIssues.length > 0) {
            formatAnalysis.formatIssues.forEach(issue => {
                // Solo añadir si no está ya en las recomendaciones
                if (!recommendations.formatting.includes(issue)) {
                    recommendations.formatting.push(issue);
                }
            });
        }

        // Verificación mejorada del nombre de archivo
        const fileName = analysis.documentInfo?.fileName || '';

        const professionalNamePattern = /^[A-Za-z]+(_[A-Za-z]+)*(_(CV|Resume|Curriculum|Vitae|Currículum|Résumé))(_[A-Za-z]+)*(\.(pdf|docx))$/i;
        const spaceNamePattern = /^[A-Za-z]+([ ][A-Za-z]+)*([ ](CV|Resume|Curriculum|Vitae|Currículum|Résumé))([ ][A-Za-z]+)*(\.(pdf|docx))$/i;

        // Si el nombre no sigue un patrón profesional, agregar la recomendación
        if (!professionalNamePattern.test(fileName) && !spaceNamePattern.test(fileName)) {
            recommendations.formatting.push(
                'Nombra tu archivo CV de forma profesional, como "Nombre_Apellido_CV.pdf". Evita caracteres especiales, espacios y nombres genéricos como "cv.pdf" o "resume.pdf".'
            );
        }

        // Recomendaciones sobre estructura de secciones
        if (formatAnalysis.sectionAnalysis && formatAnalysis.sectionAnalysis.missingSections) {
            const missingSections = formatAnalysis.sectionAnalysis.missingSections;
            if (missingSections.includes('educacion')) {
                recommendations.formatting.push(
                    'Añade una sección clara de Educación con títulos, instituciones y fechas. Esta sección es fundamental para los sistemas ATS.'
                );
            }
            if (missingSections.includes('experiencia')) {
                recommendations.formatting.push(
                    'Incluye una sección de Experiencia Laboral bien estructurada con empresa, cargo, fechas y responsabilidades. Usa formato consistente para cada entrada.'
                );
            }
            if (missingSections.includes('habilidades')) {
                recommendations.formatting.push(
                    'Añade una sección específica de Habilidades Técnicas donde enumeres tus competencias. Los ATS buscan esta sección para filtrar candidatos.'
                );
            }
        }

        // Recomendaciones específicas basadas en puntuaciones de formato
        if (formatAnalysis.formatScore) {
            if (formatAnalysis.formatScore.readability < 60) {
                recommendations.formatting.push(
                    'El formato tiene problemas de legibilidad. Usa párrafos cortos, viñetas simples y evita diseños complejos que los ATS no pueden procesar correctamente.'
                );
            }

            if (formatAnalysis.formatScore.consistency < 70) {
                recommendations.formatting.push(
                    'Hay inconsistencias en el formato. Mantén la misma estructura, estilo de viñetas y formato de fechas en todo el documento para mejorar la legibilidad ATS.'
                );
            }
        }

        // Recomendaciones sobre tablas
        if (formatAnalysis.potentialTableCount > 0) {
            recommendations.formatting.push(
                'Reemplaza las tablas por listas con viñetas. Las tablas son uno de los principales problemas para los sistemas ATS, ya que suelen leer de izquierda a derecha y de arriba a abajo, mezclando información de diferentes celdas.'
            );
        }

        // Recomendaciones sobre elementos gráficos
        if (formatAnalysis.graphicElementsCount > 2) {
            recommendations.formatting.push(
                'Elimina símbolos especiales, líneas decorativas y caracteres no estándar. Usa solo texto plano con viñetas simples (•) para garantizar la compatibilidad con ATS.'
            );
        }

        // Recomendaciones sobre longitud del CV
        if (formatAnalysis.textDensity > 5000) {
            recommendations.formatting.push(
                'Tu CV tiene demasiada información concentrada. Aumenta el espacio entre secciones, usa márgenes adecuados y considera eliminar detalles menos relevantes para mejorar la legibilidad.'
            );
        }

        // NUEVA RECOMENDACIÓN: Sobre fuentes
        recommendations.formatting.push(
            'Usa fuentes estándar como Arial, Calibri, Times New Roman o Helvetica. Las fuentes decorativas o poco comunes pueden causar problemas con los sistemas ATS.'
        );

        // NUEVA RECOMENDACIÓN: Sobre encabezados y pies de página
        recommendations.formatting.push(
            'Evita poner información importante en encabezados o pies de página. Muchos sistemas ATS no pueden leer estas áreas del documento.'
        );
    }

    // Contar recomendaciones totales
    const totalRecommendations = Object.values(recommendations).reduce(
        (sum, recs) => sum + recs.length, 0
    );

    return {
        recommendations,
        totalRecommendations,
        priority: totalRecommendations > 5 ? 'Alta' : 'Media'
    };
}