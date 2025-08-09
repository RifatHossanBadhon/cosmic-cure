async function updateNextAppointment() {
    const patientId = localStorage.getItem('patientEntityId');
    const nextAppointmentInfo = document.getElementById('next-appointment-info');

    if (!patientId) {
        nextAppointmentInfo.textContent = 'Please log in to view appointments.';
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/api/appointments/patient/${patientId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch appointments.');
        }
        const appointments = await response.json();

        const now = new Date();
        const upcomingAppointments = appointments.filter(app => new Date(app.appointmentTime) > now);

        if (upcomingAppointments.length > 0) {
            upcomingAppointments.sort((a, b) => new Date(a.appointmentTime) - new Date(b.appointmentTime));
            const nextApp = upcomingAppointments[0];
            const appDate = new Date(nextApp.appointmentTime);
            nextAppointmentInfo.innerHTML = `Next: Dr. ${nextApp.doctor.fullName} on ${appDate.toLocaleDateString()} at ${appDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else {
            nextAppointmentInfo.textContent = 'No upcoming appointments.';
        }
    } catch (error) {
        console.error('Error fetching next appointment:', error);
        nextAppointmentInfo.textContent = 'Error loading appointments.';
    }
}

async function loadPatientHistory() {
    const userId = localStorage.getItem('userId');
    const patientEntityId = localStorage.getItem('patientEntityId');
    console.log('Fetching patient history for userId:', userId, 'patientEntityId:', patientEntityId);
    const historyContainer = document.getElementById('patient-history-container');
    historyContainer.innerHTML = 'Loading...';

    if (!userId) {
        historyContainer.innerHTML = 'Could not find user ID.';
        return;
    }

    try {
       const patientResponse = await fetch(`http://localhost:8080/api/patients/user/${userId}/history`);
        if (!patientResponse.ok) {
            throw new Error('Failed to fetch patient history.');
        }
        const patientHistory = await patientResponse.json();

        let html = '<h3>Patient Details</h3>';
        html += `<p><strong>Name:</strong> ${patientHistory.fullName}</p>`;
        html += `<p><strong>Date of Birth:</strong> ${new Date(patientHistory.dob).toLocaleDateString()}</p>`;
        html += `<p><strong>Gender:</strong> ${patientHistory.gender}</p>`;
        html += `<p><strong>Phone:</strong> ${patientHistory.phone}</p>`;
        html += `<p><strong>Address:</strong> ${patientHistory.address}</p>`;

        html += '<hr><h3>Appointment History</h3>';

        const appointmentsResponse = await fetch(`http://localhost:8080/api/appointments/patient/${patientEntityId}`);
        if (!appointmentsResponse.ok) {
            throw new Error('Failed to fetch appointments.');
        }
        const appointments = await appointmentsResponse.json();

        if (appointments.length > 0) {
            html += '<table class="styled-table">';
            html += '<thead><tr><th>Doctor</th><th>Date</th><th>Time</th><th>Fee</th></tr></thead>';
            html += '<tbody>';
            appointments.forEach(app => {
                const appDate = new Date(app.appointmentTime);
                const dateString = appDate.toLocaleDateString();
                const timeString = appDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                html += `<tr>
                            <td>${app.doctor.fullName}</td>
                            <td>${dateString}</td>
                            <td>${timeString}</td>
                            <td>BDT ${app.fee}</td>
                         </tr>`;
            });
            html += '</tbody></table>';
        } else {
            html += '<p>No appointment history.</p>';
        }

        historyContainer.innerHTML = html;
    } catch (error) {
        historyContainer.innerHTML = `<p class="error-message">${error.message}</p>`;
    }
}


function initializeDropdowns() {
    const dropdownContainers = document.querySelectorAll('.dropdown-container');
    dropdownContainers.forEach(container => {
        const link = container.querySelector('.nav-link');
        const menu = container.querySelector('.dropdown-menu');
        if (link && menu) {
            link.addEventListener('click', function(event) {
                event.preventDefault();
                document.querySelectorAll('.dropdown-menu.active-dropdown').forEach(openMenu => {
                    if (openMenu !== menu) {
                        openMenu.classList.remove('active-dropdown');
                    }
                });
                menu.classList.toggle('active-dropdown');
            });
        }
    });
    document.addEventListener('click', function(event) {
        dropdownContainers.forEach(container => {
            if (!container.contains(event.target)) {
                const menu = container.querySelector('.dropdown-menu');
                if (menu) {
                    menu.classList.remove('active-dropdown');
                }
            }
        });
    });
}

function initializeSlideshow() {
    const homeSection = document.getElementById('home');
    if (!homeSection) return;

    const slideshowContainer = homeSection.querySelector('.slideshow-container');
    if (!slideshowContainer) return;

    let currentSlideIdx = 0;
    const slides = slideshowContainer.querySelectorAll('.slide');
    const dots = slideshowContainer.querySelectorAll('.dots-navigation-container .dot');
    const slideInterval = 4000;
    let slideshowTimer;

    function displaySlide(index) {
        slides.forEach((slide) => {
            slide.classList.remove('active-slide');
        });
        dots.forEach(dot => {
            dot.classList.remove('active');
        });

        if (slides[index]) {
            slides[index].classList.add('active-slide');
        }
        if (dots[index]) {
            dots[index].classList.add('active');
        }
        currentSlideIdx = index;
    }

    function nextSlide() {
        currentSlideIdx = (currentSlideIdx + 1) % slides.length;
        displaySlide(currentSlideIdx);
    }

    function startSlideshow() {
        stopSlideshow();
        if (slides.length > 0) {
            displaySlide(currentSlideIdx);
            slideshowTimer = setInterval(nextSlide, slideInterval);
        }
    }

    function stopSlideshow() {
        clearInterval(slideshowTimer);
    }

    if (slides.length > 0 && dots.length > 0 && slides.length === dots.length) {
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                displaySlide(index);
                stopSlideshow();
            });
        });

        slideshowContainer.addEventListener('mouseenter', stopSlideshow);
        slideshowContainer.addEventListener('mouseleave', startSlideshow);

        startSlideshow();
    } else {
        if (slides.length === 0) {
            console.warn("Slideshow: No slides found.");
        }
        if (dots.length === 0 && slides.length > 0) {
            console.warn("Slideshow: No dots found for navigation.");
        }
        if (slides.length > 0 && dots.length > 0 && slides.length !== dots.length) {
            console.warn("Slideshow error: Number of slides and dots do not match.");
        }
    }
}

function initializeThemeToggle() {
    const themeToggleButton = document.getElementById('theme-toggle');
    const sunIcon = document.getElementById('theme-icon-sun');
    const moonIcon = document.getElementById('theme-icon-moon');
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            sunIcon.classList.add('hidden');
            moonIcon.classList.remove('hidden');
        } else {
            document.body.classList.remove('dark-mode');
            sunIcon.classList.remove('hidden');
            moonIcon.classList.add('hidden');
        }
    };
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
    themeToggleButton.addEventListener('click', () => {
        const isDarkMode = document.body.classList.contains('dark-mode');
        if (isDarkMode) {
            localStorage.setItem('theme', 'light');
            applyTheme('light');
        } else {
            localStorage.setItem('theme', 'dark');
            applyTheme('dark');
        }
    });
}
document.addEventListener('DOMContentLoaded', () => {
    const sendPatientChatMessageBtn = document.getElementById('sendPatientChatMessage');
    const patientChatMessageInput = document.getElementById('patientChatMessageInput');
    const patientChatMessages = document.getElementById('patientChatMessages');
    const patientChatLoading = document.getElementById('patientChatLoading');

    const addMessageToChat = (message, sender) => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}-message`;
        messageDiv.textContent = message;
        patientChatMessages.appendChild(messageDiv);
        patientChatMessages.scrollTop = patientChatMessages.scrollHeight;
    };

    const handlePatientChat = () => {
        const message = patientChatMessageInput.value.trim();
        if (message) {
            addMessageToChat(message, 'user');
            patientChatLoading.classList.remove('hidden');
            setTimeout(() => {
                patientChatLoading.classList.add('hidden');
                addMessageToChat("I've received your message. Please give me a moment to review it.", 'bot');
            }, 1500);

            patientChatMessageInput.value = '';
        }
    };

    if (sendPatientChatMessageBtn) {
        sendPatientChatMessageBtn.addEventListener('click', handlePatientChat);
    }

    if (patientChatMessageInput) {
        patientChatMessageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handlePatientChat();
            }
        });
    }
});


