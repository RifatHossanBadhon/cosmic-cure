async function updateDoctorDashboard() {
    const doctorId = localStorage.getItem('userId');
    if (!doctorId) return;
    try {
        const response = await fetch(`http://localhost:8080/api/appointments/count/today?doctorId=${doctorId}`);
        if (response.ok) {
            const count = await response.json();
            document.getElementById('appointments-today-count').textContent = count;
        }
    } catch (error) {
        console.error('Error fetching appointment count:', error);
    }
}

async function viewDoctorSchedule() {
    const doctorId = localStorage.getItem('userId');
    const scheduleContainer = document.getElementById('doctor-schedule-container-page');
    scheduleContainer.innerHTML = 'Loading...';

    try {
        const response = await fetch(`http://localhost:8080/api/appointments/schedule/today?doctorId=${doctorId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch schedule.');
        }
        const appointments = await response.json();

        let html = '';
        if (appointments.length > 0) {
            html += '<table class="styled-table">';
            html += '<thead><tr><th>Patient</th><th>Time</th><th>Reason</th></tr></thead>';
            html += '<tbody>';
            appointments.forEach(app => {
                const appDate = new Date(app.appointmentTime);
                const timeString = appDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                html += `<tr>
                            <td>${app.patient.fullName}</td>
                            <td>${timeString}</td>
                            <td>${app.reason || ''}</td>
                         </tr>`;
            });
            html += '</tbody></table>';
        } else {
            html += '<p>No appointments scheduled for today.</p>';
        }
        scheduleContainer.innerHTML = html;
    } catch (error) {
        scheduleContainer.innerHTML = `<p class="error-message">${error.message}</p>`;
    }
}

async function accessDoctorRecords() {
    const doctorId = localStorage.getItem('userId');
    const recordsContainer = document.getElementById('doctor-records-container-page');
    recordsContainer.innerHTML = 'Loading...';

    try {
        const response = await fetch(`http://localhost:8080/api/doctors/${doctorId}/patients`);
        if (!response.ok) {
            throw new Error('Failed to fetch patient records.');
        }
        const patients = await response.json();

        let html = '';
        if (patients.length > 0) {
            html += '<div class="user-list">';
            patients.forEach(patient => {
                html += `
                    <div class="user-list-item">
                        <span>${patient.fullName}</span>
                        <button class="button-profile animated-button" onclick="viewPatientRecordsForDoctor(${patient.id})">View</button>
                    </div>
                `;
            });
            html += '</div>';
        } else {
            html += '<p>No patient records found.</p>';
        }
        recordsContainer.innerHTML = html;
    } catch (error) {
        recordsContainer.innerHTML = `<p class="error-message">${error.message}</p>`;
    }
}

async function viewPatientRecordsForDoctor(patientId) {
    const doctorId = localStorage.getItem('userId');
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = 'Loading...';
    openAdminModal();

    try {
        const patientResponse = await fetch(`http://localhost:8080/api/patients/${patientId}`);
        if (!patientResponse.ok) {
            throw new Error('Failed to fetch patient details.');
        }
        const patient = await patientResponse.json();
        const appointmentsResponse = await fetch(`http://localhost:8080/api/appointments/patient/${patientId}`);
        if (!appointmentsResponse.ok) {
            throw new Error('Failed to fetch appointments.');
        }
        let appointments = await appointmentsResponse.json();
        appointments = appointments.filter(app => app.doctor.id == doctorId);

        let html = '<h3>Patient Details</h3>';
        html += `<p><strong>Name:</strong> ${patient.fullName}</p>`;
        html += `<p><strong>Date of Birth:</strong> ${new Date(patient.dob).toLocaleDateString()}</p>`;
        html += `<p><strong>Gender:</strong> ${patient.gender}</p>`;
        html += `<p><strong>Phone:</strong> ${patient.phone}</p>`;
        html += `<p><strong>Address:</strong> ${patient.address}</p>`;

        html += '<hr><h3>Appointment History</h3>';

        if (appointments.length > 0) {
            html += '<table class="styled-table">';
            html += '<thead><tr><th>Date</th><th>Time</th><th>Reason</th></tr></thead>';
            html += '<tbody>';
            appointments.forEach(app => {
                const appDate = new Date(app.appointmentTime);
                const dateString = appDate.toLocaleDateString();
                const timeString = appDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                html += `<tr>
                            <td>${dateString}</td>
                            <td>${timeString}</td>
                            <td>${app.reason || ''}</td>
                         </tr>`;
            });
            html += '</tbody></table>';
        } else {
            html += '<p>No previous bookings with this patient.</p>';
        }

        modalBody.innerHTML = html;
    } catch (error) {
        modalBody.innerHTML = `<p class="error-message">${error.message}</p>`;
    }
}


async function fetchDoctorsAndPopulateDropdown() {
    const doctorSelect = document.getElementById('doctorSelect');
    doctorSelect.innerHTML = '<option value="">-- Choose a Doctor --</option>'; 

    try {
        const response = await fetch('http://localhost:8080/api/appointments/doctors');
        if (!response.ok) {
            throw new Error('Failed to fetch doctors.');
        }
        const doctors = await response.json();

        doctors.forEach(doctor => {
            const option = document.createElement('option');
            option.value = doctor.id;
            option.textContent = `${doctor.fullName} (${doctor.specialty}) - BDT ${doctor.fee}`;
            doctorSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching doctors:', error);
    }
}