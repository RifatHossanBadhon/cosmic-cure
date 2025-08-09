document.addEventListener('DOMContentLoaded', () => {
    const profileTypeSelect = document.getElementById('profileTypeSelect');
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword'); 
    const loginBtn = document.getElementById('loginBtn');
    const loginError = document.getElementById('loginError');
        
    async function handleLogin() {
        const email = loginEmail.value;
        const password = loginPassword.value;
        const profileType = profileTypeSelect.value;
        loginError.textContent = ''; 
        loginError.classList.remove('error-message'); 

        if (!email || !password || !profileType) {
            loginError.textContent = 'Please fill in all fields and select a profile type.';
            loginError.classList.add('error-message');
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, profileType }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('userName', data.name);
                localStorage.setItem('userId', data.userId);
                if (data.patientEntityId) {
                    localStorage.setItem('patientEntityId', data.patientEntityId);
                }
                const userRole = data.role.toLowerCase();
                localStorage.setItem('userRole', userRole);
                if (userRole === 'pharmacist') {
                    showPage('pharmacy-profile');
                } else if (userRole === 'staff' && data.specificRole) {
                    const specificRoleLower = data.specificRole.toLowerCase();
                    if (specificRoleLower === 'support_staff') {
                        showPage('admin-profile');
                    } else {
                        showPage(`${specificRoleLower}-profile`);
                    }
                } else {
                    showPage(`${userRole}-profile`);
                }
            } else {
                loginError.textContent = data.message || 'Login failed. Please check your credentials.';
                loginError.classList.add('error-message');
            }
        } catch (error) {
            console.error('Login error:', error);
            loginError.textContent = 'An error occurred during login. Please try again later.';
            loginError.classList.add('error-message');
        }
    }

    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }
    if (loginPassword) {
        loginPassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleLogin();
            }
        });
    }

    // Patient 
    const patientRegistrationForm = document.querySelector('#patient-registration .styled-form');
    if (patientRegistrationForm) {
        patientRegistrationForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const fullName = document.getElementById('patient-name').value;
            const email = document.getElementById('patient-email').value;
            const dob = document.getElementById('patient-dob').value;
            const gender = document.getElementById('patient-gender').value;
            const phone = document.getElementById('patient-phone').value;
            const address = document.getElementById('address').value;
            const password = document.getElementById('patient-password').value;

            const registerData = {
                email,
                password,
                role: 'PATIENT',
                fullName,
                dob: dob ? new Date(dob).toISOString() : null, 
                gender,
                phone,
                address
            };

            try {
                const response = await fetch('http://localhost:8080/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(registerData),
                });

                const data = await response.text();

                if (response.ok) {
                    alert('Patient registered successfully!');
                    showPage('login');
                } else {
                    alert('Registration failed: ' + data);
                }
            } catch (error) {
                console.error('Patient registration error:', error);
                alert('An error occurred during registration. Please try again later.');
            }
        });
    }

    // DocRes
    const doctorRegistrationForm = document.querySelector('#doctor-registration .styled-form');
    if (doctorRegistrationForm) {
        doctorRegistrationForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const fullName = document.getElementById('doc-name').value;
            const gender = document.getElementById('doctor-gender').value;
            const phone = document.getElementById('doctor-phone').value;
            const email = document.getElementById('doctor-email').value;
            const password = document.getElementById('doctor-password').value;
            const specialty = document.getElementById('doctor-specialty').value;
            const fee = parseFloat(document.getElementById('doctor-fee').value);

            const registerData = {
                email,
                password,
                role: 'DOCTOR',
                fullName,
                gender,
                phone,
                specialty,
                fee
            };

            try {
                const response = await fetch('http://localhost:8080/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(registerData),
                });

                const data = await response.text();

                if (response.ok) {
                    alert('Doctor registered successfully!');
                    showPage('login');
                } else {
                    alert('Registration failed: ' + data);
                }
            } catch (error) {
                console.error('Doctor registration error:', error);
                alert('An error occurred during registration. Please try again later.');
            }
        });
    }

    // Staff 
    const staffRegistrationForm = document.querySelector('#admin-pharmacist-registration .styled-form');
    if (staffRegistrationForm) {
        staffRegistrationForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const fullName = document.getElementById('staff-name').value;
            const phone = document.getElementById('staff-phone').value;
            const email = document.getElementById('staff-email').value;
            const gender = document.getElementById('staff-gender').value;
            const staffRole = document.getElementById('staff-role').value;
            const password = document.getElementById('staff-password').value;

            const registerData = {
                email,
                password,
                role: 'STAFF',
                fullName,
                phone,
                gender,
                staffType: staffRole.toUpperCase().replace(' ', '_') 
            };

            try {
                const response = await fetch('http://localhost:8080/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(registerData),
                });

                const data = await response.text();

                if (response.ok) {
                    alert('Staff registered successfully!');
                    showPage('login');
                } else {
                    alert('Registration failed: ' + data);
                }
            } catch (error) {
                console.error('Staff registration error:', error);
                alert('An error occurred during registration. Please try again later.');
            }
        });
    }

    // app
    const doctorSelect = document.getElementById('doctorSelect');
    const appointmentDate = document.getElementById('appointmentDate');
    const appointmentTime = document.getElementById('appointmentTime');
    const appointmentReason = document.getElementById('appointmentReason');
    const confirmAppointmentBtn = document.getElementById('confirmAppointmentBtn');
    const appointmentMessage = document.getElementById('appointmentMessage');

    if (confirmAppointmentBtn) {
        confirmAppointmentBtn.addEventListener('click', async () => {
            const patientId = localStorage.getItem('patientEntityId');
            const doctorId = doctorSelect.value;
            const date = appointmentDate.value;
            const time = appointmentTime.value;
            const reason = appointmentReason.value;

            appointmentMessage.textContent = ''; 
            appointmentMessage.classList.remove('error-message', 'success'); 

            if (!patientId) {
                appointmentMessage.textContent = 'Please log in to book an appointment.';
                appointmentMessage.classList.add('error-message');
                return;
            }

            if (!doctorId || !date || !time) {
                appointmentMessage.textContent = 'Please fill all appointment details.';
                appointmentMessage.classList.add('error-message');
                return;
            }

            const today = new Date().toISOString().split('T')[0];
            if (date < today) {
                appointmentMessage.textContent = 'You cannot book an appointment in the past.';
                appointmentMessage.classList.add('error-message');
                return;
            }

            const appointmentDateTime = `${date}T${time}:00`;

            try {
                const response = await fetch('http://localhost:8080/api/appointments/book', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        patientId: parseInt(patientId, 10),
                        doctorId: parseInt(doctorId, 10),
                        appointmentTime: appointmentDateTime,
                        reason: reason
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    const selectedOption = doctorSelect.options[doctorSelect.selectedIndex];
                    const doctorName = selectedOption.textContent.split(' (')[0];
                    const fee = data.fee;

                    appointmentMessage.textContent = `Appointment with ${doctorName} on ${date} at ${time} (Fee: BDT ${fee}) confirmed! You will receive a notification shortly.`;
                    appointmentMessage.classList.add('success');
                    doctorSelect.value = '';
                    appointmentDate.value = '';
                    appointmentTime.value = '';
                    updateDoctorDashboard();
                } else {
                    const errorText = await response.text();
                    appointmentMessage.textContent = `Failed to book appointment: ${errorText}`;
                    appointmentMessage.classList.add('error-message');
                    console.error('Booking error:', errorText);
                }
            } catch (error) {
                console.error('Error booking appointment:', error);
                appointmentMessage.textContent = 'An error occurred while booking the appointment. Please try again.';
                appointmentMessage.classList.add('error-message');
            }
        });
    }

    initializeDropdowns();
    initializeSlideshow();
    initializeThemeToggle(); 
    const userRole = localStorage.getItem('userRole');
    const hash = window.location.hash.substring(1);
    if (hash) {
        showPage(hash);
    } else if (userRole) {
        if (userRole === 'pharmacist') {
            showPage('pharmacy-profile');
        } else {
            showPage(`${userRole}-profile`);
        }
    } else if(document.getElementById('home')) {
        showPage('home');
    } else {
        const firstSection = document.querySelector('.page-section');
        if(firstSection) {
            showPage(firstSection.id);
        }
    }

    //fun
    const chatbotIcon = document.getElementById('chatbot-icon');
    const chatbotContainer = document.getElementById('chatbot-container');
    const closeChatbotBtn = document.getElementById('close-chatbot');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotSendBtn = document.getElementById('chatbot-send-btn');
    const chatbotMessages = document.getElementById('chatbot-messages');

    if (chatbotIcon && chatbotContainer && closeChatbotBtn && chatbotInput && chatbotSendBtn && chatbotMessages) {
        chatbotIcon.addEventListener('click', () => {
            chatbotContainer.classList.toggle('active');
        });

        closeChatbotBtn.addEventListener('click', () => {
            chatbotContainer.classList.remove('active');
        }); 

        const addChatMessage = (message, sender) => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${sender}-message`;
            messageDiv.textContent = message;
            chatbotMessages.appendChild(messageDiv);
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        };

        const generateBotResponse = (message) => {
            const lowerCaseMessage = message.toLowerCase();
            if (lowerCaseMessage.includes('symptoms') || lowerCaseMessage.includes('sick')) {
                return "I'm sorry to hear that. Please describe your symptoms in more detail, and I can suggest if you should see a doctor.";
            } else if (lowerCaseMessage.includes('appointment') || lowerCaseMessage.includes('book')) {
                return "You can book an appointment through the 'Book an Appointment' section on the patient dashboard. Would you like me to guide you there?";
            } else if (lowerCaseMessage.includes('help') || lowerCaseMessage.includes('support')) {
                return "I'm here to help! What specific assistance do you need?";
            } else if (lowerCaseMessage.includes('hello') || lowerCaseMessage.includes('hi')) {
                return "Hello there! How can I assist you today?";
            } else if (lowerCaseMessage.includes('thank you') || lowerCaseMessage.includes('thanks')) {
                return "You're welcome! Is there anything else I can help you with?";
            } else if (lowerCaseMessage.includes('doctor')) {
                return "Are you looking for a specific doctor or a specialist? You can find a list of our doctors in the 'Heroes' section.";
            } else if (lowerCaseMessage.includes('pharmacy') || lowerCaseMessage.includes('medicine')) {
                return "Our pharmacy services are available on-site. Do you need information about a specific medicine or prescription?";
            } else if (lowerCaseMessage.includes('fever')) {
                return "Fever can be a symptom of many conditions. Please monitor your temperature and other symptoms. If it's high or persistent, consider consulting a doctor.";
            } else if (lowerCaseMessage.includes('cold')) {
                return "For a common cold, rest, fluids, and over-the-counter remedies can help. If symptoms worsen or don't improve, please see a doctor.";
            } else if (lowerCaseMessage.includes('headache')) {
                return "Headaches can have various causes. Try resting, staying hydrated, and pain relievers. If you experience severe, sudden, or unusual headaches, seek medical attention.";
            } else if (lowerCaseMessage.includes('emergency')) {
                return "If this is a medical emergency, please use the 'Emergency Help' button on your patient dashboard or call emergency services immediately.";
            } else {
                return "I'm a simple bot and might not understand complex queries. Can you rephrase your question or ask about symptoms, appointments, or general help?";
            }
        };

        const handleChatbotSend = () => {
            const userMessage = chatbotInput.value.trim();
            if (userMessage) {
                addChatMessage(userMessage, 'user');
                chatbotInput.value = '';

                setTimeout(() => {
                    const botResponse = generateBotResponse(userMessage);
                    addChatMessage(botResponse, 'bot');
                }, 500);
            }
        };

        chatbotSendBtn.addEventListener('click', handleChatbotSend);
        chatbotInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleChatbotSend();
            }
        });
        const originalShowPage = showPage;
        showPage = (pageId) => {
            originalShowPage(pageId);
            if (pageId === 'home') {
                chatbotIcon.style.display = 'flex';
            } else {
                chatbotIcon.style.display = 'none';
                chatbotContainer.classList.remove('active');
            }
        };
        if (document.getElementById('home') && document.getElementById('home').classList.contains('active')) {
            chatbotIcon.style.display = 'flex';
        } else {
            chatbotIcon.style.display = 'none';
        }
    }
});
