import path from 'path';
import { parseResumeFile, saveResultsToJSON, ensureDirectories } from './utils/fileHandler.js';
import { analyzeCVText } from './analyzers/textAnalyzer.js';
import { analyzeKeywords } from './analyzers/keywordsAnalyzer.js';
import { analyzeExperience } from './analyzers/experienceAnalyzer.js';
import { analyzeFormat } from './analyzers/formatAnalyzer.js';
import { categorizeSkills } from './analyzers/skillAnalyzer.js';
import { generateRecommendations } from './scoring/recommendations.js';
import { getAvailableRoles, getRoleById } from './config/jobRoles.js';
import { extractEntities, extractKeyTerms } from './utils/nlpUtils.js';
import { calculateATSScore } from './scoring/scoreCalculator.js';

// Asegurar que los directorios necesarios existen
ensureDirectories(['./data/samples', './data/output']);

// Ruta al archivo del CV
const CV_PATH = './data/samples/cv.pdf';
// Rol objetivo para el análisis específico
const TARGET_ROLE = 'FULLSTACK_DEVELOPER';

async function main() {
    try {
        console.log('🔍 Analizando el CV...');
        console.log('📄 Archivo:', CV_PATH);

        // Parsear el CV (PDF o DOCX)
        const documentData = await parseResumeFile(CV_PATH);
        const cvText = documentData.text;

        console.log('✅ Documento analizado correctamente');
        console.log(`📊 Número de páginas: ${documentData.numpages}`);
        console.log(`📝 Total de caracteres: ${cvText.length}`);

        // Obtener el rol objetivo
        const targetJobRole = getRoleById(TARGET_ROLE);
        console.log(`🎯 Analizando para el puesto: ${targetJobRole ? targetJobRole.title : 'General'}`);

        // === ANÁLISIS COMPLETO DEL CV ===

        // 1. Análisis básico de texto
        const basicAnalysis = await analyzeCVText(cvText);

        // 2. Análisis de experiencia
        const experienceAnalysis = await analyzeExperience(cvText);

        // 3. Análisis de palabras clave
        const keywordsAnalysis = analyzeKeywords(cvText, targetJobRole);

        // 4. Análisis de formato - AHORA MÁS IMPORTANTE
        const formatAnalysis = analyzeFormat(cvText, documentData);

        // 5. Categorizar habilidades
        const categorizedSkills = categorizeSkills(basicAnalysis.skills);

        // 6. Extraer entidades y términos clave
        const entities = extractEntities(cvText);
        const keyTerms = extractKeyTerms(cvText, 15);

        // NUEVO: Calcular puntuación ATS que incluye formato
        const atsScores = calculateATSScore(
            keywordsAnalysis.keywordCount || basicAnalysis.keywordsFound?.length || 0,
            basicAnalysis.skills?.length || 0,
            basicAnalysis.wordCount || 0,
            formatAnalysis
        );

        // Crear análisis completo
        const fullAnalysis = {
            basic: {
                ...basicAnalysis,
                atsScore: atsScores.total  // Actualizar con nueva puntuación
            },
            experience: experienceAnalysis,
            keywords: keywordsAnalysis,
            format: formatAnalysis,
            categorizedSkills,
            entities,
            keyTerms,
            atsScores,  // Añadir puntuaciones detalladas
            documentInfo: {
                fileType: path.extname(CV_PATH).replace('.', '').toUpperCase(),
                fileName: path.basename(CV_PATH),
                pages: documentData.numpages,
                characterCount: cvText.length,
                targetRole: TARGET_ROLE
            }
        };

        // 7. Generar recomendaciones
        const recommendations = generateRecommendations({ ...fullAnalysis, cvText }, TARGET_ROLE);

        // === MOSTRAR RESULTADOS ===

        console.log('\n📊 RESULTADOS DEL ANÁLISIS DEL CV');
        console.log('==============================');

        console.log(`\n🏆 PUNTUACIÓN ATS TOTAL: ${atsScores.total}%`);
        console.log(`   ├─ Puntuación de contenido: ${atsScores.content}%`);
        console.log(`   └─ Puntuación de formato: ${formatAnalysis.formatScore.total}%`);

        // Mostrar resumen de resultados
        console.log('\n📋 RESUMEN:');
        console.log(`✓ Palabras clave encontradas: ${keywordsAnalysis.keywordCount || basicAnalysis.keywordsFound?.length || 0}`);
        console.log(`✓ Habilidades detectadas: ${basicAnalysis.skills?.length || 0}`);
        console.log(`✓ Años de experiencia estimados: ${experienceAnalysis.yearsOfExperience}`);

        if (TARGET_ROLE && keywordsAnalysis.profileMatch) {
            const essentialMatch = keywordsAnalysis.profileMatch.essentialKeywords.percentage;
            console.log(`✓ Compatibilidad con puesto ${targetJobRole.title}: ${essentialMatch}%`);
        }

        // MEJORADO: Análisis detallado de formato
        console.log('\n📑 ANÁLISIS DE FORMATO:');
        console.log(`✓ Puntuación de estructura: ${formatAnalysis.formatScore.structure}%`);
        console.log(`✓ Puntuación de legibilidad: ${formatAnalysis.formatScore.readability}%`);
        console.log(`✓ Secciones detectadas: ${formatAnalysis.sectionCount}`);

        // Problemas de formato
        if (formatAnalysis.formatIssues.length > 0) {
            console.log('\n⚠️ PROBLEMAS DE FORMATO DETECTADOS:');
            formatAnalysis.formatIssues.forEach(issue => console.log(`  ⚠️ ${issue}`));
        }

        // Habilidades por categoría
        console.log('\n🔧 HABILIDADES POR CATEGORÍA:');
        Object.entries(categorizedSkills).forEach(([category, skills]) => {
            if (skills.length > 0) {
                console.log(`  ${category}: ${skills.join(', ')}`);
            }
        });

        // Recomendaciones - con enfoque en formato
        if (recommendations.totalRecommendations > 0) {
            console.log('\n💡 RECOMENDACIONES PARA MEJORAR:');
            console.log(`  Prioridad: ${recommendations.priority}`);

            // Mostrar primero recomendaciones de formato
            if (recommendations.recommendations.formatting.length > 0) {
                console.log('\n  FORMATO (PRIORITARIO):');
                recommendations.recommendations.formatting.forEach(rec => console.log(`  ✦ ${rec}`));
            }

            // Luego mostrar el resto de recomendaciones
            const otherCategories = ['general', 'keywords', 'skills', 'experience'];
            otherCategories.forEach(category => {
                const recs = recommendations.recommendations[category];
                if (recs && recs.length > 0) {
                    console.log(`\n  ${category.toUpperCase()}:`);
                    recs.forEach(rec => console.log(`  ✦ ${rec}`));
                }
            });
        }

        // Guardar resultados
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `analisis-cv-${timestamp}.json`;
        const savedPath = await saveResultsToJSON(fullAnalysis, fileName);
        console.log(`\n💾 Resultados guardados en: ${savedPath}`);

    } catch (error) {
        console.error('❌ Error procesando el CV:', error);
    }
}

// Ejecutar el análisis
main();