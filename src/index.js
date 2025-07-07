import path from 'path';
import fs from 'fs/promises';
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
ensureDirectories(['./data/samples']);

const SAMPLES_DIR = './data/samples';
const DEFAULT_CV_PATH = path.join(SAMPLES_DIR, 'cv.pdf');
const TARGET_ROLE = 'FULLSTACK_DEVELOPER';

// Nueva función para buscar archivos CV
async function findCVFile() {
    try {
        // Primero intentamos con el archivo predeterminado
        try {
            await fs.access(DEFAULT_CV_PATH);
            return DEFAULT_CV_PATH;
        } catch (err) {
            // Si no existe, buscamos otros archivos CV
            const files = await fs.readdir(SAMPLES_DIR);
            const cvFiles = files.filter(file => {
                const lowerFile = file.toLowerCase();
                return (
                    (lowerFile.endsWith('.pdf') || lowerFile.endsWith('.docx')) &&
                    (lowerFile.includes('cv') ||
                        lowerFile.includes('resume') ||
                        lowerFile.includes('curriculum'))
                );
            });

            // NUEVO: Verificar si hay múltiples archivos CV
            if (cvFiles.length > 1) {
                throw new Error(`Se encontraron múltiples archivos CV en ${SAMPLES_DIR}. Por favor, deja solo uno para evitar ambigüedades.`);
            }

            if (cvFiles.length === 1) {
                return path.join(SAMPLES_DIR, cvFiles[0]);
            } else {
                throw new Error(`No se encontró ningún CV en ${SAMPLES_DIR}. Por favor, coloca tu CV en esta carpeta.`);
            }
        }
    } catch (error) {
        throw error;
    }
}

async function main() {
    try {
        console.log('🔍 Analizando el CV...');

        // Buscar un archivo CV válido
        let cvPath;
        try {
            cvPath = await findCVFile();
            console.log('📄 Archivo:', cvPath);
        } catch (error) {
            console.error(`❌ ${error.message}`);
            console.log('\n📝 SUGERENCIAS:');
            console.log('1. Coloca tu CV en la carpeta ./data/samples/');
            console.log('2. Asegúrate de que tu archivo tenga la palabra "cv", "resume" o "curriculum" en el nombre');
            console.log('3. Formatos aceptados: PDF, DOCX');
            return;
        }

        // Parsear el CV (PDF o DOCX)
        const documentData = await parseResumeFile(cvPath);
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

        // El resto del código permanece igual...
        // 2. Análisis de experiencia
        const experienceAnalysis = await analyzeExperience(cvText);

        // 3. Análisis de palabras clave
        const keywordsAnalysis = analyzeKeywords(cvText, targetJobRole);

        // 4. Análisis de formato
        const formatAnalysis = analyzeFormat(cvText, documentData);

        // 5. Categorizar habilidades
        const categorizedSkills = categorizeSkills(basicAnalysis.skills);

        // 6. Extraer entidades y términos clave
        const entities = extractEntities(cvText);
        const keyTerms = extractKeyTerms(cvText, 15);

        // Calcular puntuación ATS
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
                atsScore: atsScores.total
            },
            experience: experienceAnalysis,
            keywords: keywordsAnalysis,
            format: formatAnalysis,
            categorizedSkills,
            entities,
            keyTerms,
            atsScores,
            documentInfo: {
                fileType: path.extname(cvPath).replace('.', '').toUpperCase(),
                fileName: path.basename(cvPath),
                pages: documentData.numpages,
                characterCount: cvText.length,
                targetRole: TARGET_ROLE
            }
        };

        // 7. Generar recomendaciones
        const recommendations = generateRecommendations({ ...fullAnalysis, cvText }, TARGET_ROLE);

        // === MOSTRAR RESULTADOS ===
        // (El resto del código de visualización permanece igual)

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

        console.log(`\n✅ Análisis completado.`);

    } catch (error) {
        console.error('❌ Error procesando el CV:', error);
        // Mostrar mensaje de ayuda más detallado
        console.log('\n🔧 POSIBLES SOLUCIONES:');
        console.log('1. Verifica que el formato del CV sea válido (PDF o DOCX)');
        console.log('2. Comprueba que el CV no esté dañado o protegido');
        console.log('3. Intenta con otro archivo CV');
    }
}

// Ejecutar el análisis
main();