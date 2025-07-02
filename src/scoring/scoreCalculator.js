/**
 * Calcula la puntuación de compatibilidad ATS
 * @param {number} keywordCount - Número de palabras clave encontradas
 * @param {number} skillCount - Número de habilidades encontradas
 * @param {number} wordCount - Recuento total de palabras
 * @param {Object} formatAnalysis - Análisis de formato (opcional)
 * @returns {Object} Puntuaciones ATS (0-100)
 */
export function calculateATSScore(keywordCount, skillCount, wordCount, formatAnalysis = null) {
    // Puntuaciones individuales por componente
    const keywordScore = Math.min(keywordCount / 10, 1) * 100;
    const skillScore = Math.min(skillCount / 8, 1) * 100;
    const wordCountScore = wordCount > 300 ? 100 : (wordCount / 300) * 100;

    // Ponderaciones ajustadas para dar más importancia al formato
    let keywordWeight = 0.3;
    let skillWeight = 0.25;
    let wordCountWeight = 0.05;
    let formatWeight = 0.4;

    // Calcular puntuación de contenido
    let contentScore = (keywordScore * keywordWeight / (1 - formatWeight)) +
        (skillScore * skillWeight / (1 - formatWeight)) +
        (wordCountScore * wordCountWeight / (1 - formatWeight));

    // Calcular puntuación total, incorporando formato si está disponible
    let totalScore;
    let formatScore = 0;

    if (formatAnalysis && formatAnalysis.formatScore) {
        formatScore = formatAnalysis.formatScore.total;
        totalScore = (contentScore * (1 - formatWeight)) + (formatScore * formatWeight);
    } else {
        // Si no hay análisis de formato, solo usar la puntuación de contenido
        totalScore = contentScore;
    }

    return {
        total: Math.round(totalScore),
        content: Math.round(contentScore),
        format: formatScore,
        components: {
            keywords: Math.round(keywordScore),
            skills: Math.round(skillScore),
            wordCount: Math.round(wordCountScore),
            format: formatScore
        },
        weights: {
            keywords: keywordWeight,
            skills: skillWeight,
            wordCount: wordCountWeight,
            format: formatWeight
        }
    };
}

/**
 * Calcula puntuación de compatibilidad por rol específico
 * @param {Object} analysis - Resultados del análisis
 * @param {string} jobRole - Rol específico a evaluar
 * @returns {number} Puntuación de compatibilidad para el rol (0-100)
 */
export function calculateJobRoleScore(analysis, jobRole) {
    // Implementación pendiente - cuando tengamos los perfiles de trabajo definidos
    return 0;
}