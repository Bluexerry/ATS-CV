import { skillCategories } from './skills.js';

/**
 * Definición de perfiles de trabajo tecnológicos con habilidades y palabras clave relevantes
 */
export const jobRoles = {
    FRONTEND_DEVELOPER: {
        title: 'Desarrollador Frontend',
        essentialSkills: ['JavaScript', 'HTML', 'CSS'],
        preferredSkills: ['React', 'Angular', 'Vue.js', 'TypeScript', 'SASS'],
        keyPhrases: [
            'desarrollo de interfaces', 'experiencia de usuario', 'componentes web',
            'optimización frontend', 'responsive design', 'mobile first'
        ],
        skillWeightByCategory: {
            [skillCategories.PROGRAMMING]: 0.4,
            [skillCategories.FRAMEWORKS]: 0.35,
            [skillCategories.SOFT_SKILLS]: 0.15,
            [skillCategories.TOOLS]: 0.1,
        }
    },

    BACKEND_DEVELOPER: {
        title: 'Desarrollador Backend',
        essentialSkills: ['Java', 'Python', 'Node.js', 'SQL'],
        preferredSkills: ['Spring', 'Django', 'Express', 'MongoDB', 'PostgreSQL', 'AWS'],
        keyPhrases: [
            'desarrollo de APIs', 'arquitectura de servicios', 'bases de datos',
            'optimización de consultas', 'servicios web', 'seguridad'
        ],
        skillWeightByCategory: {
            [skillCategories.PROGRAMMING]: 0.35,
            [skillCategories.DATABASES]: 0.3,
            [skillCategories.FRAMEWORKS]: 0.2,
            [skillCategories.CLOUD_DEVOPS]: 0.15
        }
    },

    FULLSTACK_DEVELOPER: {
        title: 'Desarrollador Full Stack',
        essentialSkills: ['JavaScript', 'HTML', 'CSS', 'SQL', 'Node.js'],
        preferredSkills: ['React', 'Angular', 'Vue.js', 'Express', 'MongoDB', 'PostgreSQL', 'Git'],
        keyPhrases: [
            'desarrollo frontend y backend', 'arquitectura completa', 'implementación de aplicaciones',
            'desarrollo full-stack', 'soluciones end-to-end'
        ],
        skillWeightByCategory: {
            [skillCategories.PROGRAMMING]: 0.3,
            [skillCategories.FRAMEWORKS]: 0.25,
            [skillCategories.DATABASES]: 0.2,
            [skillCategories.CLOUD_DEVOPS]: 0.15,
            [skillCategories.SOFT_SKILLS]: 0.1
        }
    },

    DEVOPS_ENGINEER: {
        title: 'Ingeniero DevOps',
        essentialSkills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Git'],
        preferredSkills: ['Terraform', 'Ansible', 'Jenkins', 'Prometheus', 'Linux', 'Python'],
        keyPhrases: [
            'automatización', 'infraestructura como código', 'integración continua',
            'despliegue continuo', 'monitorización', 'observabilidad'
        ],
        skillWeightByCategory: {
            [skillCategories.CLOUD_DEVOPS]: 0.6,
            [skillCategories.PROGRAMMING]: 0.2,
            [skillCategories.TOOLS]: 0.15,
            [skillCategories.SOFT_SKILLS]: 0.05
        }
    },

    DATA_SCIENTIST: {
        title: 'Científico de Datos',
        essentialSkills: ['Python', 'SQL', 'R'],
        preferredSkills: ['Machine Learning', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Estadística'],
        keyPhrases: [
            'análisis de datos', 'machine learning', 'modelado predictivo',
            'visualización de datos', 'minería de datos', 'big data'
        ],
        skillWeightByCategory: {
            [skillCategories.PROGRAMMING]: 0.35,
            [skillCategories.DATABASES]: 0.2,
            [skillCategories.TOOLS]: 0.3,
            [skillCategories.SOFT_SKILLS]: 0.15
        }
    }
};

/**
 * Obtiene la lista de roles disponibles para análisis
 * @returns {string[]} Lista de IDs de roles disponibles
 */
export function getAvailableRoles() {
    return Object.keys(jobRoles);
}

/**
 * Obtiene un rol específico por su ID
 * @param {string} roleId - ID del rol a obtener
 * @returns {Object|null} Datos del rol o null si no existe
 */
export function getRoleById(roleId) {
    return jobRoles[roleId] || null;
}