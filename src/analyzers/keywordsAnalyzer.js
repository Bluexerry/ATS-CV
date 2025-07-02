import natural from 'natural';
import { calculateTextSimilarity } from '../utils/nlpUtils.js';
import { commonJobKeywords } from '../config/keywords.js';

/**
 * Análisis avanzado de palabras clave en un CV
 * @param {string} text - Texto del CV
 * @param {Object} jobProfile - Perfil de trabajo objetivo (opcional)
 * @returns {Object} Análisis detallado de palabras clave
 */
export function analyzeKeywords(text, jobProfile = null) {
    const tokenizer = new natural.WordTokenizer();
    const cleanText = text.toLowerCase().replace(/[^\w\s]/g, ' ');

    // Buscar palabras clave generales
    const foundKeywords = commonJobKeywords
        .filter(keyword => cleanText.includes(keyword.toLowerCase()))
        .map(keyword => ({
            keyword,
            count: countOccurrences(cleanText, keyword.toLowerCase()),
            context: extractContext(cleanText, keyword.toLowerCase())
        }));

    // Análisis específico para el perfil de trabajo
    let profileSpecificAnalysis = null;
    if (jobProfile) {
        profileSpecificAnalysis = {
            essentialKeywords: analyzeProfileKeywords(cleanText, jobProfile.essentialSkills),
            preferredKeywords: analyzeProfileKeywords(cleanText, jobProfile.preferredSkills),
            keyPhrases: analyzeKeyPhrases(cleanText, jobProfile.keyPhrases)
        };
    }

    // Calcular frecuencia de palabras (excluyendo palabras comunes)
    const wordFrequency = calculateWordFrequency(text);

    // Calcular densidad de palabras clave
    const wordCount = tokenizer.tokenize(cleanText).length;
    const keywordDensity = foundKeywords.reduce((sum, k) => sum + k.count, 0) / wordCount;

    return {
        keywords: foundKeywords,
        keywordCount: foundKeywords.length,
        totalKeywordOccurrences: foundKeywords.reduce((sum, k) => sum + k.count, 0),
        keywordDensity: keywordDensity * 100, // Porcentaje
        mostFrequentWords: wordFrequency.slice(0, 10),
        profileMatch: profileSpecificAnalysis,
        recommendations: generateKeywordRecommendations(foundKeywords, jobProfile)
    };
}

/**
 * Cuenta las ocurrencias de una palabra en un texto
 * @param {string} text - Texto completo
 * @param {string} word - Palabra a buscar
 * @returns {number} Número de ocurrencias
 */
function countOccurrences(text, word) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = text.match(regex);
    return matches ? matches.length : 0;
}

/**
 * Extrae el contexto alrededor de una palabra clave
 * @param {string} text - Texto completo
 * @param {string} keyword - Palabra clave
 * @param {number} contextLength - Longitud del contexto
 * @returns {string[]} Fragmentos de contexto
 */
function extractContext(text, keyword, contextLength = 50) {
    const contexts = [];
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    let match;

    while ((match = regex.exec(text)) !== null) {
        const start = Math.max(0, match.index - contextLength);
        const end = Math.min(text.length, match.index + keyword.length + contextLength);

        let context = text.substring(start, end);

        // Resaltar la palabra clave
        const keywordStart = Math.max(0, match.index - start);
        const keywordEnd = keywordStart + keyword.length;
        context = context.substring(0, keywordStart) +
            context.substring(keywordStart, keywordEnd) +
            context.substring(keywordEnd);

        contexts.push(context.trim());

        // Limitar a 3 contextos por palabra clave
        if (contexts.length >= 3) break;
    }

    return contexts;
}

/**
 * Calcula la frecuencia de palabras en el texto
 * @param {string} text - Texto a analizar
 * @returns {Array} Array de objetos {word, count} ordenados por frecuencia
 */
function calculateWordFrequency(text) {
    const tokenizer = new natural.WordTokenizer();
    const stopwords = natural.stopwords;

    const words = tokenizer.tokenize(text.toLowerCase())
        .filter(word => !stopwords.includes(word) && word.length > 2);

    const frequency = {};
    words.forEach(word => {
        frequency[word] = (frequency[word] || 0) + 1;
    });

    return Object.entries(frequency)
        .map(([word, count]) => ({ word, count }))
        .sort((a, b) => b.count - a.count);
}

/**
 * Analiza palabras clave específicas del perfil de trabajo
 * @param {string} text - Texto del CV
 * @param {string[]} keywords - Palabras clave a buscar
 * @returns {Object} Análisis de coincidencias
 */
function analyzeProfileKeywords(text, keywords) {
    const matches = keywords.map(keyword => ({
        keyword,
        found: text.toLowerCase().includes(keyword.toLowerCase()),
        count: countOccurrences(text, keyword.toLowerCase())
    }));

    return {
        keywords: matches,
        foundCount: matches.filter(k => k.found).length,
        totalCount: keywords.length,
        percentage: Math.round((matches.filter(k => k.found).length / keywords.length) * 100)
    };
}

/**
 * Analiza frases clave específicas del perfil
 * @param {string} text - Texto del CV
 * @param {string[]} phrases - Frases clave a buscar
 * @returns {Object} Análisis de coincidencias aproximadas
 */
function analyzeKeyPhrases(text, phrases) {
    const matches = phrases.map(phrase => {
        // Buscar coincidencia exacta
        const exactMatch = text.toLowerCase().includes(phrase.toLowerCase());

        // Si no hay coincidencia exacta, calcular similitud
        let similarity = 0;
        if (!exactMatch) {
            similarity = calculateTextSimilarity(text, phrase);
        }

        return {
            phrase,
            exactMatch,
            similarity: Math.round(similarity * 100)
        };
    });

    return {
        phrases: matches,
        exactMatches: matches.filter(m => m.exactMatch).length,
        closeMatches: matches.filter(m => !m.exactMatch && m.similarity > 70).length,
        totalPhrases: phrases.length
    };
}

/**
 * Genera recomendaciones basadas en el análisis de palabras clave
 * @param {Array} foundKeywords - Palabras clave encontradas
 * @param {Object} jobProfile - Perfil de trabajo objetivo
 * @returns {string[]} Lista de recomendaciones
 */
function generateKeywordRecommendations(foundKeywords, jobProfile) {
    const recommendations = [];

    // Recomendaciones generales basadas en la densidad de palabras clave
    if (foundKeywords.length < 10) {
        recommendations.push('Incluye más palabras clave relevantes para aumentar la compatibilidad ATS.');
    }

    // Recomendaciones específicas para el perfil de trabajo
    if (jobProfile) {
        const missingEssential = jobProfile.essentialSkills.filter(
            skill => !foundKeywords.some(k => k.keyword.toLowerCase() === skill.toLowerCase())
        );

        if (missingEssential.length > 0) {
            recommendations.push(
                `Incluye estas habilidades esenciales para el puesto de ${jobProfile.title}: ${missingEssential.join(', ')}.`
            );
        }

        const missingPreferred = jobProfile.preferredSkills.filter(
            skill => !foundKeywords.some(k => k.keyword.toLowerCase() === skill.toLowerCase())
        ).slice(0, 3); // Limitar a 3 recomendaciones

        if (missingPreferred.length > 0) {
            recommendations.push(
                `Considera añadir estas habilidades preferidas: ${missingPreferred.join(', ')}.`
            );
        }
    }

    return recommendations;
}