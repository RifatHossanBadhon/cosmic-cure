function updateWelcomeMessages() {
    const userName = localStorage.getItem('userName');
    if (userName) {
        const patientWelcome = document.getElementById('patient-welcome-message');
        if (patientWelcome) patientWelcome.textContent = `Welcome, ${userName}!`;

        const doctorWelcome = document.getElementById('doctor-welcome-message');
        if (doctorWelcome) doctorWelcome.textContent = `Welcome, Dr. ${userName}!`;

        const adminWelcome = document.getElementById('admin-welcome-message');
        if (adminWelcome) adminWelcome.textContent = `Welcome, Admin ${userName}!`;

        const pharmacyWelcome = document.getElementById('pharmacy-welcome-message');
        if (pharmacyWelcome) pharmacyWelcome.textContent = `Welcome, Pharmacist ${userName}!`;
    }
}

function updateNextAppointment() {
    const userId = localStorage.getItem('userId');
    const nextAppointmentInfo = document.getElementById('next-appointment-info');

    if (!userId) {
        if (nextAppointmentInfo) {
            nextAppointmentInfo.textContent = 'No upcoming appointments.';
        }
        return;
    }

    fetch(`http://localhost:8080/api/appointments/patient/${userId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch appointments.');
            }
            return response.json();
        })
        .then(appointments => {
            if (appointments.length > 0 && nextAppointmentInfo) {
                appointments.sort((a, b) => new Date(a.appointmentTime) - new Date(b.appointmentTime));
                const nextAppointment = appointments[0];
                const appDate = new Date(nextAppointment.appointmentTime);
                const dateString = appDate.toLocaleDateString();
                const timeString = appDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                nextAppointmentInfo.textContent = `Next appointment: ${nextAppointment.doctor.fullName} on ${dateString} at ${timeString}`;
            } else if (nextAppointmentInfo) {
                nextAppointmentInfo.textContent = 'No upcoming appointments.';
            }
        })
        .catch(error => {
            console.error('Error updating next appointment:', error);
            if (nextAppointmentInfo) {
                nextAppointmentInfo.textContent = 'Error loading appointments.';
            }
        });
}
