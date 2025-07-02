/**
 * Analiza las habilidades mencionadas en el texto del CV
 * @param {string} text - El texto del CV
 * @returns {Promise<string[]>} Lista de habilidades detectadas
 */
export async function analyzeSkills(text) {
    const commonSkills = [
        'javascript', 'python', 'java', 'react', 'node', 'express', 'sql', 'nosql',
        'mongodb', 'aws', 'azure', 'docker', 'kubernetes', 'git', 'agile', 'scrum',
        'comunicación', 'liderazgo', 'gestión de proyectos', 'resolución de problemas',
        'html', 'css', 'typescript', 'php', 'c#', '.net', 'angular', 'vue', 'spring',
        'django', 'flask', 'laravel', 'ruby', 'go', 'rust', 'scala', 'swift',
        'microservicios', 'devops', 'ci/cd', 'jenkins', 'github actions'
    ];

    // Convertimos el texto a minúsculas para la comparación
    const lowerText = text.toLowerCase();

    // Filtramos las habilidades que aparecen en el texto
    return commonSkills.filter(skill =>
        lowerText.includes(skill.toLowerCase())
    );
}

/**
 * Clasifica las habilidades por categorías
 * @param {string[]} skills - Lista de habilidades detectadas
 * @returns {Object} Habilidades clasificadas por categoría
 */
export function categorizeSkills(skills) {
    const categories = {
        'Lenguajes de Programación': [],
        'Frameworks y Bibliotecas': [],
        'Bases de Datos': [],
        'Cloud y DevOps': [],
        'Habilidades Blandas': [],
        'Otras': []
    };

    // Mapa de categorización de habilidades
    const skillCategories = {
        'javascript': 'Lenguajes de Programación',
        'python': 'Lenguajes de Programación',
        'java': 'Lenguajes de Programación',
        'typescript': 'Lenguajes de Programación',
        'php': 'Lenguajes de Programación',
        'c#': 'Lenguajes de Programación',
        'ruby': 'Lenguajes de Programación',
        'go': 'Lenguajes de Programación',
        'rust': 'Lenguajes de Programación',
        'scala': 'Lenguajes de Programación',
        'swift': 'Lenguajes de Programación',
        'html': 'Lenguajes de Programación',
        'css': 'Lenguajes de Programación',

        'react': 'Frameworks y Bibliotecas',
        'angular': 'Frameworks y Bibliotecas',
        'vue': 'Frameworks y Bibliotecas',
        'node': 'Frameworks y Bibliotecas',
        'express': 'Frameworks y Bibliotecas',
        'spring': 'Frameworks y Bibliotecas',
        'django': 'Frameworks y Bibliotecas',
        'flask': 'Frameworks y Bibliotecas',
        'laravel': 'Frameworks y Bibliotecas',
        '.net': 'Frameworks y Bibliotecas',

        'sql': 'Bases de Datos',
        'nosql': 'Bases de Datos',
        'mongodb': 'Bases de Datos',
        'mysql': 'Bases de Datos',
        'postgresql': 'Bases de Datos',
        'oracle': 'Bases de Datos',
        'redis': 'Bases de Datos',

        'aws': 'Cloud y DevOps',
        'azure': 'Cloud y DevOps',
        'gcp': 'Cloud y DevOps',
        'docker': 'Cloud y DevOps',
        'kubernetes': 'Cloud y DevOps',
        'devops': 'Cloud y DevOps',
        'ci/cd': 'Cloud y DevOps',
        'jenkins': 'Cloud y DevOps',
        'github actions': 'Cloud y DevOps',
        'git': 'Cloud y DevOps',
        'microservicios': 'Cloud y DevOps',

        'comunicación': 'Habilidades Blandas',
        'liderazgo': 'Habilidades Blandas',
        'gestión de proyectos': 'Habilidades Blandas',
        'resolución de problemas': 'Habilidades Blandas',
        'trabajo en equipo': 'Habilidades Blandas',
        'agile': 'Habilidades Blandas',
        'scrum': 'Habilidades Blandas'
    };

    // Categorizamos cada habilidad
    skills.forEach(skill => {
        const category = skillCategories[skill.toLowerCase()] || 'Otras';
        categories[category].push(skill);
    });

    return categories;
}