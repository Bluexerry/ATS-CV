import natural from 'natural';

// Inicializar analizador de sentimiento
const Analyzer = natural.SentimentAnalyzer;
const stemmerEn = natural.PorterStemmer;
const analyzer = new Analyzer("English", stemmerEn, "afinn");

/**
 * Análisis de sentimiento del texto
 * @param {string} text - Texto a analizar
 * @returns {Object} Resultado del análisis de sentimiento
 */
export function analyzeSentiment(text) {
    const tokenizer = new natural.WordTokenizer();
    const tokens = tokenizer.tokenize(text);

    const score = analyzer.getSentiment(tokens);

    let sentiment;
    if (score > 0.2) {
        sentiment = 'positivo';
    } else if (score < -0.2) {
        sentiment = 'negativo';
    } else {
        sentiment = 'neutral';
    }

    return {
        score,
        sentiment,
        confidence: Math.abs(score) * 100
    };
}

// Si necesitas funcionalidad de stemming, usa el de natural:
export function stemWord(word) {
    return natural.PorterStemmer.stem(word);
}

/**
 * Extrae términos clave usando TF-IDF
 * @param {string} text - Texto a analizar
 * @param {number} count - Cantidad de términos a extraer
 * @returns {Array} Términos clave con sus puntuaciones
 */
export function extractKeyTerms(text, count = 10) {
    const tfidf = new natural.TfIdf();
    const tokenizer = new natural.WordTokenizer();
    const stopwords = natural.stopwords;

    const processedText = text
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ');

    const tokens = tokenizer.tokenize(processedText)
        .filter(token => !stopwords.includes(token) && token.length > 2);

    tfidf.addDocument(tokens);

    const terms = [];
    tfidf.listTerms(0).slice(0, count).forEach(item => {
        terms.push({
            term: item.term,
            tfidf: item.tfidf
        });
    });

    return terms;
}

/**
 * Calcula la similitud del coseno entre dos textos
 * @param {string} text1 - Primer texto
 * @param {string} text2 - Segundo texto
 * @returns {number} Puntuación de similitud (0-1)
 */
export function calculateTextSimilarity(text1, text2) {
    const tokenizer = new natural.WordTokenizer();
    const stopwords = natural.stopwords;

    // Tokenización y filtrado de stopwords
    const tokens1 = tokenizer.tokenize(text1.toLowerCase())
        .filter(token => !stopwords.includes(token) && token.length > 2);
    const tokens2 = tokenizer.tokenize(text2.toLowerCase())
        .filter(token => !stopwords.includes(token) && token.length > 2);

    // Crear conjunto de todos los términos únicos
    const uniqueTerms = new Set([...tokens1, ...tokens2]);

    // Crear vectores de frecuencia
    const vector1 = Array(uniqueTerms.size).fill(0);
    const vector2 = Array(uniqueTerms.size).fill(0);

    const termsArray = Array.from(uniqueTerms);

    // Rellenar vectores con frecuencias
    tokens1.forEach(token => {
        const index = termsArray.indexOf(token);
        vector1[index]++;
    });

    tokens2.forEach(token => {
        const index = termsArray.indexOf(token);
        vector2[index]++;
    });

    // Calcular similitud de coseno
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    for (let i = 0; i < vector1.length; i++) {
        dotProduct += vector1[i] * vector2[i];
        magnitude1 += vector1[i] * vector1[i];
        magnitude2 += vector2[i] * vector2[i];
    }

    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);

    if (magnitude1 === 0 || magnitude2 === 0) return 0;

    return dotProduct / (magnitude1 * magnitude2);
}

/**
 * Extrae entidades nombradas (personas, organizaciones, lugares)
 * @param {string} text - Texto a analizar
 * @returns {Object} Entidades detectadas por categoría
 */
export function extractEntities(text) {
    // Implementación básica de detección de entidades
    const entities = {
        organizations: [],
        locations: [],
        dates: [],
        skills: []
    };

    // Detectar organizaciones (patrones comunes)
    const orgRegex = /\b(?:[A-Z][a-z]+ )+(?:Inc|LLC|Ltd|SA|SL|GmbH|Corp|Company|Technologies|Solutions)\b/g;
    entities.organizations = text.match(orgRegex) || [];

    // Detectar fechas (patrones simples)
    const dateRegex = /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{4}\b|\b\d{1,2}\/\d{1,2}\/\d{4}\b|\b\d{4}\b/g;
    entities.dates = text.match(dateRegex) || [];

    // Eliminar duplicados
    entities.organizations = Array.from(new Set(entities.organizations));
    entities.dates = Array.from(new Set(entities.dates));

    return entities;
}