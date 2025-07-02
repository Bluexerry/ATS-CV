import natural from 'natural';
import { commonJobKeywords } from '../config/keywords.js';
import { analyzeSkills } from './skillAnalyzer.js';
import { calculateATSScore } from '../scoring/scoreCalculator.js';

const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;

/**
 * Analiza el texto del CV para compatibilidad con ATS
 * @param {string} text - El contenido de texto del CV
 * @returns {Object} Resultados del análisis
 */
export async function analyzeCVText(text) {
    // Limpiar y tokenizar texto
    const cleanedText = text.toLowerCase().replace(/[^\w\s]/g, ' ');
    const tokens = tokenizer.tokenize(cleanedText);

    // Eliminar palabras vacías
    const stopwords = natural.stopwords;
    const filteredTokens = tokens.filter(token =>
        !stopwords.includes(token) && token.length > 2
    );

    // Análisis TF-IDF
    const tfidf = new TfIdf();
    tfidf.addDocument(filteredTokens);

    // Encontrar palabras clave
    const keywordsFound = [];
    commonJobKeywords.forEach(keyword => {
        if (cleanedText.includes(keyword.toLowerCase())) {
            keywordsFound.push(keyword);
        }
    });

    // Detectar habilidades usando el skillAnalyzer
    const skills = await analyzeSkills(cleanedText);

    // Calcular puntuación de compatibilidad ATS
    const atsScore = calculateATSScore(keywordsFound.length, skills.length, filteredTokens.length);

    return {
        keywordsFound,
        skills,
        wordCount: tokens.length,
        uniqueWords: new Set(tokens).size,
        atsScore,
        importantTerms: getImportantTerms(tfidf, 10)
    };
}

/**
 * Obtiene los términos más importantes del documento
 * @param {TfIdf} tfidfInstance - Instancia de TF-IDF
 * @param {number} count - Número de términos a devolver
 * @returns {Array} Términos importantes con sus puntuaciones
 */
function getImportantTerms(tfidfInstance, count) {
    const terms = [];
    tfidfInstance.listTerms(0).slice(0, count).forEach(item => {
        terms.push({
            term: item.term,
            tfidf: item.tfidf
        });
    });
    return terms;
}