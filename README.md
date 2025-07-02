<div align="center">

# 🚀 ATS-CV Analyzer 🚀

<img src="https://img.shields.io/badge/Version-1.0.0-brightgreen?style=for-the-badge" alt="Version 1.0.0"/>
<img src="https://img.shields.io/badge/Node-v16.0+-blue?style=for-the-badge&logo=node.js" alt="Node v16+"/>
<img src="https://img.shields.io/badge/License-MIT-orange?style=for-the-badge" alt="License MIT"/>

---

#### _Analiza y optimiza tu CV para Sistemas de Seguimiento de Candidatos (ATS)_

</div>

---

## 🌟 Características Principales

- 📊 **Análisis profesional de CV**: Evaluación completa basada en criterios ATS empresariales.
- 🔍 **Detección de problemas de formato** (40%): Identifica tablas, gráficos y estructuras que confunden a los ATS.
- 🔑 **Análisis de palabras clave** (30%): Compara con perfiles de trabajo específicos.
- 🛠️ **Evaluación de habilidades** (25%): Categoriza y prioriza habilidades técnicas y blandas.
- 📝 **Recomendaciones personalizadas**: Sugerencias accionables para mejorar la compatibilidad ATS.
- 📱 **Interfaz web y CLI**: Úsalo como aplicación web o herramienta de línea de comandos.
- 📄 **Compatible con PDF y DOCX**: Analiza los formatos más comunes de CV.

<div align="center">
    <img src="https://via.placeholder.com/800x400/4361ee/ffffff?text=ATS-CV+Analyzer" alt="ATS-CV Analyzer Demo"/>
</div>

---

## 🧰 Tecnologías Utilizadas

| Frontend   | Backend   | Análisis      |
|:----------:|:---------:|:-------------:|
| HTML5      | Node.js   | Natural.js    |
| CSS3       | Express   | PDF-Parse     |
| JavaScript | ESModules | Mammoth       |

---

## 📋 Requisitos Previos

- Node.js v16.0 o superior
- npm v7.0 o superior
- Navegador web moderno (Chrome, Firefox, Edge, Safari)

---

## 🚀 Guía de Instalación

### 1️⃣ Clonar el repositorio

```bash
cd ats-cv
npm init -y # Si no existe package.json
npm install express express-fileupload pdf-parse mammoth natural stemmer
npm install
mkdir -p data/samples data/output data/uploads public/css public/js src/analyzers src/config src/parsers src/scoring src/utils
```

### 2️⃣ Modos de Uso

#### 💻 Interfaz Web

1. Inicia el servidor: `npm start`
2. Abre tu navegador en [http://localhost:3000](http://localhost:3000)
3. Sube tu CV en formato PDF o DOCX
4. Selecciona el perfil de trabajo objetivo
5. Analiza los resultados y recomendaciones

#### ⌨️ Línea de Comandos (CLI)

```bash
npm run cli
```

- Los resultados se mostrarán en la consola y se guardarán en `data/output`.

> ⚠️ **Importante:**  
> Debes tener obligatoriamente tu currículum con el nombre **`cv.pdf`** ubicado en la carpeta `data/samples`.  
> Si no existe ese archivo, el sistema mostrará un error.

---

## 📊 Puntuación ATS

El sistema utiliza un algoritmo de puntuación ponderada:

| Criterio         | Peso | Descripción                                 |
|------------------|------|---------------------------------------------|
| 📄 Formato       | 40%  | Estructura, tablas, gráficos, secciones     |
| 🔑 Palabras Clave| 30%  | Términos relevantes para el puesto          |
| 🛠️ Habilidades   | 25%  | Competencias técnicas y blandas             |
| 📏 Contenido     | 5%   | Longitud, densidad de texto                 |

---

## 📁 Estructura del Proyecto

```
ats-cv/
├── data/                  # Datos y almacenamiento
│   ├── samples/           # CV de ejemplo
│   ├── output/            # Resultados guardados
│   └── uploads/           # Archivos temporales
├── public/                # Frontend
│   ├── css/               # Estilos
│   ├── js/                # JavaScript del cliente
│   └── index.html         # Página principal
├── src/                   # Código fuente
│   ├── analyzers/         # Módulos de análisis
│   ├── config/            # Configuraciones y datos
│   ├── parsers/           # Analizadores de documentos
│   ├── scoring/           # Algoritmos de puntuación
│   └── utils/             # Utilidades
├── server.js              # Servidor Express
└── index.js               # Aplicación CLI
```

---

## 🚦 Ejemplos de Resultados

<div align="center">

**🟢 CV Optimizado para ATS**  

**🟠 CV Parcialmente Optimizado**  

**🔴 CV No Optimizado**  

</div>

---

<div align="center">

📊 **Mejora tu CV. Consigue más entrevistas. 🚀**  
[Documentación Completa](#) | [Reportar Problemas](#) | [Contribuir](#)

</div>
