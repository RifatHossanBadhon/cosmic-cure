let emergencyAlertsInterval;

function showPage(pageId) {
    const sections = document.querySelectorAll('.page-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    if (emergencyAlertsInterval && pageId !== 'admin-profile') {
        clearInterval(emergencyAlertsInterval);
        emergencyAlertsInterval = null;
    }

    const activeSection = document.getElementById(pageId);
    if (activeSection) {
        setTimeout(() => {
            activeSection.classList.add('active');
            window.location.hash = pageId;
            if (pageId.includes('-profile')) {
                updateWelcomeMessages();
            }
            if (pageId === 'patient-profile') {
                updateNextAppointment();
            }
            if (pageId === 'doctor-profile') {
                updateDoctorDashboard();
            }
            if (pageId === 'doctor-schedule-page') {
                viewDoctorSchedule();
            }
            if (pageId === 'doctor-records-page') {
                accessDoctorRecords();
            }
            if (pageId === 'patient-records') {
                loadPatientHistory();
            }
            if (pageId === 'book-appointment') {
                fetchDoctorsAndPopulateDropdown();
            }
            if (pageId === 'admin-management') {
                renderUserLists();
            }
            if (pageId === 'admin-emergency-alerts') {
                renderEmergencyAlerts();
            }
            if (pageId === 'admin-profile' && !emergencyAlertsInterval) {
                renderEmergencyAlerts();
                emergencyAlertsInterval = setInterval(renderEmergencyAlerts, 5000);
            }
        }, 10);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        console.warn("Section with ID '" + pageId + "' not found.");
        if (pageId !== 'home' && document.getElementById('home')) {
            showPage('home');
        }
    }
}
