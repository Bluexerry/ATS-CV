/**
 * Catálogo de palabras clave comunes en ofertas de trabajo tecnológicas
 */

// Palabras clave comunes por categoría
export const commonJobKeywords = [
    // Lenguajes de programación
    'JavaScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'PHP', 'Swift', 'Kotlin',
    'Go', 'Rust', 'TypeScript', 'Scala', 'R', 'MATLAB', 'Perl', 'Shell', 'Bash',
    'HTML', 'CSS', 'SQL', 'NoSQL',

    // Frameworks y bibliotecas
    'React', 'Angular', 'Vue.js', 'Next.js', 'Svelte', 'Express', 'Django', 'Flask',
    'Spring', 'Laravel', 'Ruby on Rails', 'ASP.NET', '.NET Core', 'Bootstrap',
    'jQuery', 'TensorFlow', 'PyTorch', 'Keras', 'Pandas', 'NumPy', 'Node.js',

    // Bases de datos
    'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Cassandra', 'Oracle', 'SQL Server',
    'DynamoDB', 'Firebase', 'Elasticsearch', 'Neo4j', 'MariaDB',

    // Cloud y DevOps
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'GitLab CI',
    'GitHub Actions', 'Terraform', 'Ansible', 'Puppet', 'Chef', 'Prometheus',
    'Grafana', 'ELK Stack', 'CI/CD', 'DevOps', 'SRE', 'Microservicios',

    // Control de versiones
    'Git', 'GitHub', 'GitLab', 'Bitbucket', 'SVN',

    // Metodologías
    'Agile', 'Scrum', 'Kanban', 'Lean', 'XP', 'Waterfall', 'TDD', 'BDD',

    // Roles y posiciones
    'Desarrollador', 'Developer', 'Ingeniero', 'Engineer', 'Arquitecto', 'Architect',
    'Full Stack', 'Frontend', 'Backend', 'Mobile', 'iOS', 'Android', 'DevOps',
    'QA', 'Tester', 'Project Manager', 'Product Owner', 'Scrum Master',
    'UX Designer', 'UI Designer', 'Data Scientist', 'Data Engineer', 'Data Analyst',
    'Machine Learning', 'IA', 'Artificial Intelligence',

    // Soft skills
    'Trabajo en equipo', 'Teamwork', 'Comunicación', 'Communication',
    'Liderazgo', 'Leadership', 'Resolución de problemas', 'Problem solving',
    'Pensamiento crítico', 'Critical thinking', 'Adaptabilidad', 'Adaptability',
    'Creatividad', 'Creativity', 'Gestión del tiempo', 'Time management',

    // Verbos de acción (logros)
    'Desarrollé', 'Implemented', 'Lideré', 'Led', 'Diseñé', 'Designed',
    'Optimicé', 'Optimized', 'Aumenté', 'Increased', 'Reduje', 'Reduced',
    'Mejoré', 'Improved', 'Automaticé', 'Automated', 'Gestioné', 'Managed',
    'Coordiné', 'Coordinated', 'Colaboré', 'Collaborated', 'Creé', 'Created'
];

// Palabras clave por sectores específicos
export const keywordsByIndustry = {
    webDevelopment: [
        'JavaScript', 'HTML', 'CSS', 'React', 'Angular', 'Vue.js', 'Node.js',
        'Responsive Design', 'Web Components', 'PWA', 'SPA', 'SSR', 'JAMstack'
    ],

    dataScienceAI: [
        'Python', 'R', 'Machine Learning', 'Deep Learning', 'Neural Networks',
        'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'NLP', 'Computer Vision',
        'Big Data', 'Hadoop', 'Spark', 'Data Mining', 'Estadística'
    ],

    devOps: [
        'Docker', 'Kubernetes', 'CI/CD', 'Jenkins', 'Ansible', 'Terraform',
        'Cloud', 'AWS', 'Azure', 'GCP', 'Monitorización', 'Logging', 'SRE',
        'Infraestructura como código', 'Automatización'
    ],

    mobileDevelopment: [
        'iOS', 'Android', 'Swift', 'Kotlin', 'React Native', 'Flutter',
        'Xamarin', 'Mobile UI', 'App Store', 'Google Play', 'Notifications',
        'Mobile Testing', 'Responsive Design'
    ],

    cybersecurity: [
        'Seguridad', 'Ethical Hacking', 'Pentesting', 'Vulnerabilidades',
        'Firewall', 'Encryption', 'Cryptography', 'Identity Management',
        'OWASP', 'Security Audit', 'Compliance', 'Risk Assessment'
    ]
};

// Palabras clave negativas que pueden afectar el ATS
export const negativeKeywords = [
    'Inexperiencia', 'Inexperienced', 'Limitado', 'Limited', 'Principiante', 'Beginner',
    'Falta de', 'Lack of', 'Poca experiencia', 'Little experience', 'Estudiante', 'Student'
];

// Expresiones que indican fortalezas en un CV
export const strengthIndicators = [
    'experiencia probada', 'proven experience',
    'experto en', 'expert in',
    'especialista en', 'specialist in',
    'amplia experiencia', 'extensive experience',
    'profundo conocimiento', 'deep knowledge',
    'certificado en', 'certified in'
];

// Exportar todas las palabras clave
export function getAllKeywords() {
    const allKeywords = [
        ...commonJobKeywords,
        ...Object.values(keywordsByIndustry).flat()
    ];

    // Eliminar duplicados
    return Array.from(new Set(allKeywords));
}