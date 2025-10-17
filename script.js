document.addEventListener('DOMContentLoaded', () => {

    // ======================= SELECTORES DE ELEMENTOS DEL DOM =======================
    // Contenedores principales
    const loginContainer = document.getElementById('login-container');
    const teacherDashboard = document.getElementById('teacher-dashboard');
    const studentDashboard = document.getElementById('student-dashboard');
    const adminDashboard = document.getElementById('admin-dashboard');
    const courseView = document.getElementById('course-view');
    const allContainers = document.querySelectorAll('.container');

    // Formularios
    const loginForm = document.getElementById('login-form');
    const courseForm = document.getElementById('course-form');
    const taskForm = document.getElementById('task-form');
    const quizTopicForm = document.getElementById('quiz-topic-form');

    // Modales
    const courseModal = document.getElementById('course-modal');
    const taskModal = document.getElementById('task-modal');
    const quizModal = document.getElementById('quiz-modal');
    const quizReviewModal = document.getElementById('quiz-review-modal');
    const allModals = document.querySelectorAll('.modal');
    
    // Botones
    const logoutBtns = document.querySelectorAll('[id^="logout-btn"]');
    const addCourseBtn = document.getElementById('add-course-btn');
    const createTaskBtn = document.getElementById('create-task-btn');
    const createQuizBtn = document.getElementById('create-quiz-btn');
    const backToDashboardBtn = document.getElementById('back-to-dashboard-btn');
    const confirmStudentBtn = document.getElementById('confirm-student-details');
    const confirmQuizBtn = document.getElementById('confirm-quiz-btn');

    // Áreas de contenido dinámico
    const courseGrid = document.getElementById('course-grid');
    const courseViewTitle = document.getElementById('course-view-title');
    const activityList = document.getElementById('activity-list');
    const studentContent = document.getElementById('student-content');
    const studentSelection = document.getElementById('student-selection');
    const studentNotifications = document.getElementById('student-notifications');
    const quizReviewArea = document.getElementById('quiz-review-area');

    // ======================= ESTADO DE LA APLICACIÓN Y DATOS =======================
    // Usamos localStorage para simular una base de datos persistente en el navegador
    let state = {
        currentUser: null,
        currentCourseId: null,
        courses: JSON.parse(localStorage.getItem('courses')) || [],
        activities: JSON.parse(localStorage.getItem('activities')) || []
    };
    let generatedQuizData = [];

    const saveData = () => {
        localStorage.setItem('courses', JSON.stringify(state.courses));
        localStorage.setItem('activities', JSON.stringify(state.activities));
    };

    // ======================= LÓGICA DE NAVEGACIÓN Y VISTAS =======================
    const showContainer = (containerToShow) => {
        allContainers.forEach(container => container.classList.remove('active'));
        containerToShow.classList.add('active');
    };

    const openModal = (modal) => modal.style.display = 'block';
    const closeModal = (modal) => modal.style.display = 'none';

    // Cerrar modales al hacer clic en 'x' o fuera del contenido
    allModals.forEach(modal => {
        modal.querySelector('.close-btn').addEventListener('click', () => closeModal(modal));
    });
    window.addEventListener('click', (event) => {
        allModals.forEach(modal => {
            if (event.target === modal) {
                closeModal(modal);
            }
        });
    });

    // ======================= FUNCIONALIDAD DE LOGIN Y LOGOUT =======================
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;
        const errorMsg = document.getElementById('login-error');

        // Credenciales de prueba (en una app real, esto sería una llamada a un servidor)
        const users = {
            admin: 'admin123',
            docente: 'docente123',
            estudiante: 'estudiante123'
        };

        if (users[role] && password === users[role]) {
            state.currentUser = { username, role };
            errorMsg.textContent = '';
            switch (role) {
                case 'admin': showContainer(adminDashboard); break;
                case 'docente': showContainer(teacherDashboard); renderCourses(); break;
                case 'estudiante': showContainer(studentDashboard); break;
            }
        } else {
            errorMsg.textContent = 'Credenciales incorrectas. Inténtalo de nuevo.';
        }
    });

    logoutBtns.forEach(btn => btn.addEventListener('click', () => {
        state.currentUser = null;
        loginForm.reset();
        showContainer(loginContainer);
    }));
    
    backToDashboardBtn.addEventListener('click', () => {
        showContainer(teacherDashboard);
        state.currentCourseId = null;
    });

    // ======================= FUNCIONALIDAD DEL DOCENTE =======================

    // Renderizar cursos en el panel
    const renderCourses = () => {
        courseGrid.innerHTML = '';
        state.courses.forEach(course => {
            const courseCard = document.createElement('div');
            courseCard.className = 'course-card';
            courseCard.dataset.id = course.id;
            courseCard.innerHTML = `
                <div class="card-banner" style="background-color: ${course.color}; background-image: url('${course.image}')"></div>
                <div class="card-content">
                    <h3>${course.name}</h3>
                    <div class="card-actions">
                        <button class="edit-btn" data-id="${course.id}"><i class="fas fa-edit"></i> Editar</button>
                        <button class="delete-btn" data-id="${course.id}"><i class="fas fa-trash"></i> Borrar</button>
                    </div>
                </div>
            `;
            courseGrid.appendChild(courseCard);
        });
    };

    // Manejar clics en la grilla de cursos (entrar, editar, borrar)
    courseGrid.addEventListener('click', (e) => {
        const courseId = e.target.closest('.course-card').dataset.id;
        if (e.target.classList.contains('edit-btn')) {
            const course = state.courses.find(c => c.id == courseId);
            document.getElementById('modal-title').textContent = 'Editar Curso';
            document.getElementById('course-id').value = course.id;
            document.getElementById('course-name').value = course.name;
            document.getElementById('course-image').value = course.image;
            document.getElementById('course-color').value = course.color;
            openModal(courseModal);
        } else if (e.target.classList.contains('delete-btn')) {
            if (confirm('¿Estás seguro de que quieres borrar este curso y todas sus actividades?')) {
                state.courses = state.courses.filter(c => c.id != courseId);
                state.activities = state.activities.filter(a => a.courseId != courseId);
                saveData();
                renderCourses();
            }
        } else { // Clic en la tarjeta para entrar al curso
            state.currentCourseId = courseId;
            const course = state.courses.find(c => c.id == courseId);
            courseViewTitle.textContent = course.name;
            renderActivities();
            showContainer(courseView);
        }
    });
    
    // Botón para abrir modal de crear curso
    addCourseBtn.addEventListener('click', () => {
        courseForm.reset();
        document.getElementById('modal-title').textContent = 'Crear Nuevo Curso';
        document.getElementById('course-id').value = '';
        document.getElementById('course-color').value = '#007bff';
        openModal(courseModal);
    });

    // Enviar formulario de curso (crear/editar)
    courseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('course-id').value;
        const courseData = {
            name: document.getElementById('course-name').value,
            image: document.getElementById('course-image').value,
            color: document.getElementById('course-color').value
        };

        if (id) { // Editando
            const index = state.courses.findIndex(c => c.id == id);
            state.courses[index] = { ...state.courses[index], ...courseData };
        } else { // Creando
            courseData.id = Date.now();
            state.courses.push(courseData);
        }
        saveData();
        renderCourses();
        closeModal(courseModal);
    });

    // Renderizar actividades (tareas/quizes) dentro de un curso
    const renderActivities = () => {
        activityList.innerHTML = '';
        const courseActivities = state.activities.filter(a => a.courseId == state.currentCourseId);
        if (courseActivities.length === 0) {
            activityList.innerHTML = '<p>Aún no hay actividades en este curso.</p>';
            return;
        }
        courseActivities.forEach(activity => {
            const li = document.createElement('li');
            li.classList.add(activity.type); // 'task' o 'quiz'
            if (activity.type === 'task') {
                li.innerHTML = `
                    <i class="fas fa-tasks"></i>
                    <div>
                        <strong>Tarea: ${activity.title}</strong>
                        <p>Fecha de entrega: ${new Date(activity.dueDate).toLocaleDateString()} a las ${activity.dueTime}</p>
                    </div>
                `;
            } else { // quiz
                 li.innerHTML = `
                    <i class="fas fa-question-circle"></i>
                    <div>
                        <strong>Quiz: ${activity.topic}</strong>
                        <p>${activity.questions.length} preguntas</p>
                    </div>
                `;
            }
            activityList.appendChild(li);
        });
    };

    // Botón para abrir modal de crear tarea
    createTaskBtn.addEventListener('click', () => {
        taskForm.reset();
        openModal(taskModal);
    });

    // Enviar formulario de tarea
    taskForm.addEventListener('submit', e => {
        e.preventDefault();
        const newTask = {
            id: Date.now(),
            courseId: state.currentCourseId,
            type: 'task',
            title: document.getElementById('task-title').value,
            dueDate: document.getElementById('task-due-date').value,
            dueTime: document.getElementById('task-due-time').value,
        };
        state.activities.push(newTask);
        saveData();
        renderActivities();
        closeModal(taskModal);
    });
    
    // Botón para abrir modal de crear quiz
    createQuizBtn.addEventListener('click', () => {
        quizTopicForm.reset();
        openModal(quizModal);
    });

    // "IA" para generar preguntas (simulación)
    const generateAIQuestions = (topic) => {
        const questions = [];
        for (let i = 1; i <= 15; i++) {
            questions.push({
                text: `Pregunta ${i} sobre ${topic}`,
                alternatives: [
                    `Respuesta A para la pregunta ${i}`,
                    `Respuesta B para la pregunta ${i}`,
                    `Respuesta C para la pregunta ${i}`,
                    `Respuesta D para la pregunta ${i}`
                ],
                correct: 0 // La primera es la correcta por defecto
            });
        }
        return questions;
    };
    
    // Generar preguntas al enviar el tema
    quizTopicForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const topic = document.getElementById('quiz-topic').value;
        generatedQuizData = generateAIQuestions(topic);
        
        quizReviewArea.innerHTML = '';
        generatedQuizData.forEach((q, index) => {
            quizReviewArea.innerHTML += `
                <div class="quiz-question-review">
                    <p>${index + 1}. ${q.text}</p>
                    <div class="alternatives">
                        ${q.alternatives.map((alt, i) => `<div>${String.fromCharCode(65+i)}) ${alt}</div>`).join('')}
                    </div>
                </div>
            `;
        });
        
        closeModal(quizModal);
        openModal(quizReviewModal);
    });
    
    // Confirmar y guardar el quiz
    confirmQuizBtn.addEventListener('click', () => {
        const newQuiz = {
            id: Date.now(),
            courseId: state.currentCourseId,
            type: 'quiz',
            topic: document.getElementById('quiz-topic').value,
            questions: generatedQuizData
        };
        state.activities.push(newQuiz);
        saveData();
        renderActivities();
        closeModal(quizReviewModal);
    });

    // ======================= FUNCIONALIDAD DEL ESTUDIANTE =======================
    confirmStudentBtn.addEventListener('click', () => {
        studentSelection.classList.add('hidden');
        studentContent.classList.remove('hidden');
        renderStudentNotifications();
    });

    const renderStudentNotifications = () => {
        studentNotifications.innerHTML = '';
        // Simulación: el estudiante está en todos los cursos. En una app real, se filtraría por inscripción.
        const pendingActivities = state.activities.filter(act => new Date(act.dueDate) >= new Date() || act.type === 'quiz');

        if(pendingActivities.length === 0) {
            studentNotifications.innerHTML = '<li>No tienes notificaciones pendientes. ¡Buen trabajo!</li>';
            speak("No tienes notificaciones pendientes. ¡Buen trabajo!");
            return;
        }

        let speechText = "Hola. Tienes las siguientes notificaciones pendientes. ";
        
        pendingActivities.forEach(activity => {
            const course = state.courses.find(c => c.id == activity.courseId);
            const courseName = course ? course.name : 'un curso';
            const li = document.createElement('li');
            
            if (activity.type === 'task') {
                const text = `Tienes una nueva tarea de ${courseName}: '${activity.title}'. La fecha de entrega es el ${new Date(activity.dueDate).toLocaleDateString()}.`;
                li.innerHTML = `<i class="fas fa-tasks"></i> ${text}`;
                speechText += text + ". ";
            } else { // quiz
                const text = `Se ha creado un nuevo quiz de ${courseName} sobre '${activity.topic}'.`;
                li.innerHTML = `<i class="fas fa-question-circle"></i> ${text}`;
                speechText += text + ". ";
            }
            studentNotifications.appendChild(li);
        });

        speak(speechText);
    };

    // Función para usar la Web Speech API para hablar
    const speak = (text) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'es-ES'; // Establecer el idioma a español
            window.speechSynthesis.speak(utterance);
        } else {
            console.log('Tu navegador no soporta la síntesis de voz.');
        }
    };

});