document.addEventListener('DOMContentLoaded', function () {
    // Referencias a elementos del DOM
    const cvForm = document.getElementById('cv-form');
    const cvFileInput = document.getElementById('cv-file');
    const fileNameDisplay = document.getElementById('file-name');
    const roleSelect = document.getElementById('role-select');
    const analyzeBtn = document.getElementById('analyze-btn');
    const loadingIndicator = document.getElementById('loading');
    const uploadSection = document.getElementById('upload-section');
    const resultsSection = document.getElementById('results-section');
    const backBtn = document.getElementById('back-btn');

    // Cargar roles disponibles
    fetchRoles();

    // Event listeners
    cvFileInput.addEventListener('change', updateFileName);
    cvForm.addEventListener('submit', handleFormSubmit);
    backBtn.addEventListener('click', resetForm);

    // Función para actualizar el nombre del archivo mostrado
    function updateFileName() {
        fileNameDisplay.textContent = cvFileInput.files.length > 0
            ? cvFileInput.files[0].name
            : 'Selecciona un archivo PDF o DOCX';
    }

    // Cargar roles disponibles desde la API
    async function fetchRoles() {
        try {
            const response = await fetch('/api/roles');
            if (!response.ok) throw new Error('Error al obtener roles');

            const roles = await response.json();

            // Limpiar select
            roleSelect.innerHTML = '';

            // Añadir opciones al select
            roles.forEach(role => {
                const option = document.createElement('option');
                option.value = role.id;
                option.textContent = role.title;
                roleSelect.appendChild(option);
            });

        } catch (error) {
            console.error('Error cargando roles:', error);
        }
    }

    // Manejar envío del formulario
    async function handleFormSubmit(e) {
        e.preventDefault();

        // Validar que hay un archivo seleccionado
        if (cvFileInput.files.length === 0) {
            alert('Por favor, selecciona un archivo PDF o DOCX para analizar.');
            return;
        }

        // Mostrar indicador de carga
        cvForm.classList.add('hidden');
        loadingIndicator.classList.remove('hidden');

        // Preparar datos del formulario
        const formData = new FormData();
        formData.append('cv', cvFileInput.files[0]);
        formData.append('role', roleSelect.value);

        try {
            // Enviar solicitud al servidor
            const response = await fetch('/api/analyze', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error en el análisis');
            }

            const data = await response.json();

            // Mostrar resultados
            displayResults(data.analysis);

            // Ocultar sección de carga, mostrar resultados
            uploadSection.classList.add('hidden');
            resultsSection.classList.remove('hidden');

        } catch (error) {
            console.error('Error:', error);
            alert('Error al analizar el CV: ' + error.message);

            // Volver al estado inicial del formulario
            cvForm.classList.remove('hidden');
            loadingIndicator.classList.add('hidden');
        }
    }

    // Mostrar resultados del análisis
    function displayResults(analysis) {
        // Puntuación ATS
        const scoreText = document.getElementById('score-text');
        const circleProgress = document.getElementById('circle-progress');
        const contentScore = document.getElementById('content-score');
        const contentScoreText = document.getElementById('content-score-text');
        const formatScore = document.getElementById('format-score');
        const formatScoreText = document.getElementById('format-score-text');

        // Establecer color según puntuación
        let scoreColor = '#e74c3c'; // Rojo para puntuación baja
        if (analysis.atsScores.total > 70) {
            scoreColor = '#2ecc71'; // Verde para puntuación alta
        } else if (analysis.atsScores.total > 40) {
            scoreColor = '#f39c12'; // Naranja para puntuación media
        }

        // Actualizar gráfico circular
        scoreText.textContent = `${analysis.atsScores.total}%`;
        circleProgress.setAttribute('stroke-dasharray', `${analysis.atsScores.total}, 100`);
        circleProgress.setAttribute('stroke', scoreColor);

        // Actualizar barras de progreso
        contentScore.style.width = `${analysis.atsScores.content}%`;
        contentScoreText.textContent = `${analysis.atsScores.content}%`;

        formatScore.style.width = `${analysis.format.formatScore.total}%`;
        formatScoreText.textContent = `${analysis.format.formatScore.total}%`;

        // Recomendaciones
        const formatRecsList = document.getElementById('format-recommendations-list');
        const contentRecsList = document.getElementById('content-recommendations-list');

        formatRecsList.innerHTML = '';
        contentRecsList.innerHTML = '';

        if (analysis.recommendations.formatting && analysis.recommendations.formatting.length > 0) {
            analysis.recommendations.formatting.forEach(rec => {
                const li = document.createElement('li');
                li.textContent = rec;
                formatRecsList.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = 'No se detectaron problemas importantes de formato.';
            formatRecsList.appendChild(li);
        }

        // Combinar otras recomendaciones
        const contentRecs = [
            ...(analysis.recommendations.keywords || []),
            ...(analysis.recommendations.skills || []),
            ...(analysis.recommendations.experience || []),
            ...(analysis.recommendations.general || [])
        ];

        if (contentRecs.length > 0) {
            contentRecs.forEach(rec => {
                const li = document.createElement('li');
                li.textContent = rec;
                contentRecsList.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = 'No hay recomendaciones adicionales para el contenido.';
            contentRecsList.appendChild(li);
        }

        // Habilidades
        const skillsContainer = document.getElementById('skills-container');
        skillsContainer.innerHTML = '';

        if (analysis.categorizedSkills) {
            Object.entries(analysis.categorizedSkills).forEach(([category, skills]) => {
                if (skills.length > 0) {
                    skills.forEach(skill => {
                        const skillTag = document.createElement('div');
                        skillTag.className = 'skill-tag';
                        skillTag.textContent = skill;
                        skillTag.title = category; // Categoría como tooltip
                        skillsContainer.appendChild(skillTag);
                    });
                }
            });
        }

        // Palabras clave
        const keywordsContainer = document.getElementById('keywords-container');
        keywordsContainer.innerHTML = '';

        const keywords = analysis.keywords?.keywords || analysis.basic?.keywordsFound || [];
        keywords.slice(0, 15).forEach(keyword => {
            const keywordTag = document.createElement('div');
            keywordTag.className = 'keyword-tag';
            keywordTag.textContent = typeof keyword === 'string' ? keyword : keyword.keyword;
            keywordsContainer.appendChild(keywordTag);
        });

        // Experiencia
        document.getElementById('years-experience').textContent = analysis.experience.yearsOfExperience;
        document.getElementById('roles-detected').textContent =
            analysis.experience.roles.length > 0 ? analysis.experience.roles.join(', ') : 'Ninguno detectado';
        document.getElementById('measurable-results').textContent =
            analysis.experience.hasMeasurableResults ? 'Sí' : 'No';

        // Problemas de formato
        const formatIssuesList = document.getElementById('format-issues-list');
        formatIssuesList.innerHTML = '';

        if (analysis.format.formatIssues && analysis.format.formatIssues.length > 0) {
            analysis.format.formatIssues.forEach(issue => {
                const li = document.createElement('li');
                li.textContent = issue;
                formatIssuesList.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = 'No se detectaron problemas importantes de formato.';
            formatIssuesList.appendChild(li);
        }
    }

    // Volver al formulario inicial
    function resetForm() {
        resultsSection.classList.add('hidden');
        uploadSection.classList.remove('hidden');
        cvForm.classList.remove('hidden');
        loadingIndicator.classList.add('hidden');
        cvFileInput.value = '';
        fileNameDisplay.textContent = 'Selecciona un archivo PDF o DOCX';
    }
});