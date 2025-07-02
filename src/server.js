import express from 'express';
import fileUpload from 'express-fileupload';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Imports de tu código existente
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

// Crear la aplicación Express
const app = express();
// Definir el puerto
const PORT = process.env.PORT || 3000;

// Configuración para __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Ruta a la raíz del proyecto (un nivel arriba de src)
const projectRoot = path.join(__dirname, '..');

// Asegurar que los directorios necesarios existen
// Usa rutas absolutas basadas en la raíz del proyecto
ensureDirectories([
    path.join(projectRoot, 'data/samples'),
    path.join(projectRoot, 'data/output'),
    path.join(projectRoot, 'data/uploads')
]);

// Middleware para parsear JSON y manejar archivos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
    createParentPath: true,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
}));

// Servir archivos estáticos desde la carpeta public
app.use(express.static(path.join(__dirname, '../public')));

// Endpoint para obtener los roles disponibles
app.get('/api/roles', (req, res) => {
    try {
        const roles = getAvailableRoles().map(roleId => ({
            id: roleId,
            title: getRoleById(roleId).title
        }));
        res.json(roles);
    } catch (error) {
        console.error('Error al obtener roles:', error);
        res.status(500).json({ error: 'Error al obtener roles disponibles' });
    }
});

// Endpoint para analizar CV
app.post('/api/analyze', async (req, res) => {
    try {
        // Verificar si se subió un archivo
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ error: 'No se ha subido ningún archivo' });
        }

        const cvFile = req.files.cv;
        const targetRole = req.body.role || 'FULLSTACK_DEVELOPER';

        // Verificar extensión del archivo
        const fileExt = path.extname(cvFile.name).toLowerCase();
        if (!['.pdf', '.docx'].includes(fileExt)) {
            return res.status(400).json({ error: 'Formato de archivo no soportado. Por favor, suba un archivo PDF o DOCX.' });
        }

        // Guardar archivo temporalmente
        const uploadPath = path.join(projectRoot, 'data', 'uploads', cvFile.name);
        await cvFile.mv(uploadPath);

        console.log('🔍 Analizando el CV...');
        console.log('📄 Archivo:', cvFile.name);

        // Realizar análisis completo del CV
        const documentData = await parseResumeFile(uploadPath);
        const cvText = documentData.text;

        console.log('✅ Documento analizado correctamente');
        console.log(`📊 Número de páginas: ${documentData.numpages}`);
        console.log(`📝 Total de caracteres: ${cvText.length}`);

        // Obtener el rol objetivo
        const targetJobRole = getRoleById(targetRole);
        console.log(`🎯 Analizando para el puesto: ${targetJobRole ? targetJobRole.title : 'General'}`);

        // Análisis básico de texto
        const basicAnalysis = await analyzeCVText(cvText);

        // Análisis de experiencia
        const experienceAnalysis = await analyzeExperience(cvText);

        // Análisis de palabras clave
        const keywordsAnalysis = analyzeKeywords(cvText, targetJobRole);

        // Análisis de formato
        const formatAnalysis = analyzeFormat(cvText, documentData);

        // Categorizar habilidades
        const categorizedSkills = categorizeSkills(basicAnalysis.skills);

        // Extraer entidades y términos clave
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
                fileType: fileExt.replace('.', '').toUpperCase(),
                fileName: cvFile.name,
                pages: documentData.numpages,
                characterCount: cvText.length,
                targetRole
            }
        };

        // Generar recomendaciones
        const recommendations = generateRecommendations({ ...fullAnalysis, cvText }, targetRole);

        // Guardar resultados
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `analisis-${timestamp}.json`;
        const savedPath = await saveResultsToJSON(fullAnalysis, fileName);
        console.log(`💾 Resultados guardados en: ${savedPath}`);

        // Eliminar archivo temporal después del análisis
        fs.unlinkSync(uploadPath);

        // Enviar respuesta al cliente
        res.json({
            success: true,
            analysis: {
                ...fullAnalysis,
                recommendations: recommendations.recommendations,
                priority: recommendations.priority,
                totalRecommendations: recommendations.totalRecommendations
            }
        });

    } catch (error) {
        console.error('❌ Error procesando el CV:', error);
        res.status(500).json({ error: 'Error procesando el CV', details: error.message });
    }
});

// Ruta de la API para información de salud del servidor
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Manejar rutas no encontradas
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('Error no manejado:', err);
    res.status(500).json({
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'production' ? 'Ocurrió un error inesperado' : err.message
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor ATS-CV ejecutándose en http://localhost:${PORT}`);
});