/**
 * Catálogo de habilidades técnicas y blandas organizadas por categorías y con niveles
 */

export const skillLevels = {
    BASIC: 'Básico',
    INTERMEDIATE: 'Intermedio',
    ADVANCED: 'Avanzado',
    EXPERT: 'Experto'
};

export const skillCategories = {
    PROGRAMMING: 'Lenguajes de Programación',
    FRAMEWORKS: 'Frameworks y Bibliotecas',
    DATABASES: 'Bases de Datos',
    CLOUD_DEVOPS: 'Cloud y DevOps',
    SOFT_SKILLS: 'Habilidades Blandas',
    TOOLS: 'Herramientas',
    METHODOLOGIES: 'Metodologías',
    OTHER: 'Otras'
};

export const technicalSkills = [
    // Lenguajes de Programación
    { name: 'JavaScript', category: skillCategories.PROGRAMMING, keywords: ['js', 'javascript', 'ecmascript', 'es6'] },
    { name: 'Python', category: skillCategories.PROGRAMMING, keywords: ['python', 'py', 'python3'] },
    { name: 'Java', category: skillCategories.PROGRAMMING, keywords: ['java', 'jdk', 'j2ee'] },
    { name: 'TypeScript', category: skillCategories.PROGRAMMING, keywords: ['typescript', 'ts'] },
    { name: 'C#', category: skillCategories.PROGRAMMING, keywords: ['c#', 'csharp', '.net'] },
    { name: 'PHP', category: skillCategories.PROGRAMMING, keywords: ['php'] },
    { name: 'Ruby', category: skillCategories.PROGRAMMING, keywords: ['ruby', 'rb'] },
    { name: 'Go', category: skillCategories.PROGRAMMING, keywords: ['go', 'golang'] },
    { name: 'Rust', category: skillCategories.PROGRAMMING, keywords: ['rust', 'rustlang'] },
    { name: 'Swift', category: skillCategories.PROGRAMMING, keywords: ['swift'] },
    { name: 'Kotlin', category: skillCategories.PROGRAMMING, keywords: ['kotlin'] },
    { name: 'C++', category: skillCategories.PROGRAMMING, keywords: ['c++', 'cpp'] },
    { name: 'HTML', category: skillCategories.PROGRAMMING, keywords: ['html', 'html5'] },
    { name: 'CSS', category: skillCategories.PROGRAMMING, keywords: ['css', 'css3', 'scss', 'sass', 'less'] },
    { name: 'SQL', category: skillCategories.PROGRAMMING, keywords: ['sql', 't-sql', 'pl/sql'] },

    // Frameworks y Bibliotecas
    { name: 'React', category: skillCategories.FRAMEWORKS, keywords: ['react', 'reactjs', 'react.js'] },
    { name: 'Angular', category: skillCategories.FRAMEWORKS, keywords: ['angular', 'angularjs', 'angular2+'] },
    { name: 'Vue.js', category: skillCategories.FRAMEWORKS, keywords: ['vue', 'vuejs', 'vue.js'] },
    { name: 'Node.js', category: skillCategories.FRAMEWORKS, keywords: ['node', 'nodejs', 'node.js'] },
    { name: 'Express', category: skillCategories.FRAMEWORKS, keywords: ['express', 'expressjs'] },
    { name: 'Django', category: skillCategories.FRAMEWORKS, keywords: ['django'] },
    { name: 'Flask', category: skillCategories.FRAMEWORKS, keywords: ['flask'] },
    { name: 'Spring', category: skillCategories.FRAMEWORKS, keywords: ['spring', 'spring boot', 'spring mvc'] },
    { name: 'Laravel', category: skillCategories.FRAMEWORKS, keywords: ['laravel'] },
    { name: '.NET Core', category: skillCategories.FRAMEWORKS, keywords: ['.net core', 'dotnet', 'asp.net'] },

    // Bases de Datos
    { name: 'MongoDB', category: skillCategories.DATABASES, keywords: ['mongodb', 'mongo'] },
    { name: 'MySQL', category: skillCategories.DATABASES, keywords: ['mysql'] },
    { name: 'PostgreSQL', category: skillCategories.DATABASES, keywords: ['postgresql', 'postgres'] },
    { name: 'Oracle', category: skillCategories.DATABASES, keywords: ['oracle', 'oracle db'] },
    { name: 'Microsoft SQL Server', category: skillCategories.DATABASES, keywords: ['sql server', 'mssql'] },
    { name: 'Redis', category: skillCategories.DATABASES, keywords: ['redis'] },
    { name: 'Elasticsearch', category: skillCategories.DATABASES, keywords: ['elasticsearch', 'elastic', 'elk'] },

    // Cloud y DevOps
    { name: 'AWS', category: skillCategories.CLOUD_DEVOPS, keywords: ['aws', 'amazon web services'] },
    { name: 'Azure', category: skillCategories.CLOUD_DEVOPS, keywords: ['azure', 'microsoft azure'] },
    { name: 'Google Cloud', category: skillCategories.CLOUD_DEVOPS, keywords: ['gcp', 'google cloud'] },
    { name: 'Docker', category: skillCategories.CLOUD_DEVOPS, keywords: ['docker', 'contenedores'] },
    { name: 'Kubernetes', category: skillCategories.CLOUD_DEVOPS, keywords: ['kubernetes', 'k8s'] },
    { name: 'CI/CD', category: skillCategories.CLOUD_DEVOPS, keywords: ['ci/cd', 'integración continua', 'despliegue continuo'] },
    { name: 'Jenkins', category: skillCategories.CLOUD_DEVOPS, keywords: ['jenkins'] },
    { name: 'Git', category: skillCategories.CLOUD_DEVOPS, keywords: ['git', 'github', 'gitlab', 'control de versiones'] },
    { name: 'Terraform', category: skillCategories.CLOUD_DEVOPS, keywords: ['terraform', 'iac'] },
    { name: 'Ansible', category: skillCategories.CLOUD_DEVOPS, keywords: ['ansible'] },
    { name: 'Microservicios', category: skillCategories.CLOUD_DEVOPS, keywords: ['microservicios', 'microservices'] }
];

export const softSkills = [
    { name: 'Comunicación', category: skillCategories.SOFT_SKILLS, keywords: ['comunicación', 'communication'] },
    { name: 'Trabajo en Equipo', category: skillCategories.SOFT_SKILLS, keywords: ['trabajo en equipo', 'teamwork'] },
    { name: 'Liderazgo', category: skillCategories.SOFT_SKILLS, keywords: ['liderazgo', 'leadership', 'líder', 'dirigir'] },
    { name: 'Gestión de Proyectos', category: skillCategories.SOFT_SKILLS, keywords: ['gestión de proyectos', 'project management'] },
    { name: 'Resolución de Problemas', category: skillCategories.SOFT_SKILLS, keywords: ['resolución de problemas', 'problem solving'] },
    { name: 'Pensamiento Crítico', category: skillCategories.SOFT_SKILLS, keywords: ['pensamiento crítico', 'critical thinking'] },
    { name: 'Adaptabilidad', category: skillCategories.SOFT_SKILLS, keywords: ['adaptabilidad', 'adaptable', 'flexibility'] },
    { name: 'Creatividad', category: skillCategories.SOFT_SKILLS, keywords: ['creatividad', 'creativo', 'creativity'] },
    { name: 'Gestión del Tiempo', category: skillCategories.SOFT_SKILLS, keywords: ['gestión del tiempo', 'time management'] }
];

// Combinación de todas las habilidades
export const allSkills = [...technicalSkills, ...softSkills];