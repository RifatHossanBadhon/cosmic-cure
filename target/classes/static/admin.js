function switchAdminTab(type) {
    const navItems = document.querySelectorAll('.admin-nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    document.getElementById(`nav-${type}`).classList.add('active');

    const panels = document.querySelectorAll('.admin-panel');
    panels.forEach(panel => panel.style.display = 'none');
    document.getElementById(`${type}-panel`).style.display = 'block';
}

async function fetchData(type) {
    try {
        const response = await fetch(`http://localhost:8080/api/${type}`);
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Failed to fetch ${type}:`, response.status, errorText);
            throw new Error(`Failed to fetch ${type}: ${response.status} ${errorText}`);
        }
        const data = await response.json();
        console.log(`Fetched ${type} data:`, data); 
        return data;
    } catch (error) {
        console.error(`Error fetching ${type}:`, error);
        return [];
    }
}

async function deleteData(type, id) {
    try {
        const response = await fetch(`http://localhost:8080/api/${type}/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error(`Failed to delete ${type}`);
        }
        return true;
    } catch (error) {
        console.error(`Error deleting ${type}:`, error);
        return false;
    }
}

async function renderUserLists() {
    renderUserList('patients');
    renderUserList('doctors');
    renderUserList('staff');
}

async function renderUserList(type) {
    const data = await fetchData(type);
    const containerId = `${type}-list-container`;
    const container = document.getElementById(containerId);
    if (!container) return;

    let list = '';
    data.forEach((item, index) => {
        list += `
            <div class="user-list-item">
                <span>${index + 1}. ${item.fullName}</span>
                <div>
                    <button class="button-profile animated-button" onclick="viewUser('${type}', ${item.id})">View</button>
                    <button class="button-profile animated-button" onclick="showUserForm('${type}', 'edit', ${item.id})">Edit</button>
                    <button class="button-profile animated-button" onclick="deleteItem('${type}', ${item.id})">Delete</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = list;
}

async function viewUser(type, id) {
    const data = await fetchData(`${type}/${id}`);
    const modalBody = document.getElementById('modal-body');
    let details = '';
    for (const [key, value] of Object.entries(data)) {
        details += `<p><strong>${key}:</strong> ${value}</p>`;
    }
    modalBody.innerHTML = details;
    openAdminModal();
}

async function showUserForm(type, formType, id = null) {
    const modalBody = document.getElementById('modal-body');
    let data = {};
    if (id) {
        data = await fetchData(`${type}/${id}`);
    }
    const form = createForm(type, data, formType, id);
    modalBody.innerHTML = form;
    openAdminModal();
}

function openAdminModal() {
    document.getElementById('admin-modal').style.display = 'flex';
}

function closeAdminModal() {
    document.getElementById('admin-modal').style.display = 'none';
}

async function deleteItem(type, id) {
    if (confirm('Are you sure you want to delete this item?')) {
        const success = await deleteData(type, id);
        if (success) {
            renderUserList(type);
        }
    }
}

function createForm(type, data = {}, formType = 'add', id = null) {
    const isEdit = formType === 'edit';
    const action = isEdit ? `updateUser('${type}', ${id})` : `addUser('${type}')`;
    let form = `<form class="styled-form" onsubmit="event.preventDefault(); ${action}">`;
    const fields = getFieldsForType(type, isEdit);

    fields.forEach(field => {
        if (field.type === 'select') {
            form += `<div class="form-field-group"><label>${field.label}</label><select name="${field.name}" class="styled-input" ${field.required ? 'required' : ''}>`;
            field.options.forEach(option => {
                form += `<option value="${option.value}" ${data[field.name] === option.value ? 'selected' : ''}>${option.label}</option>`;
            });
            form += `</select></div>`;
        } else {
            form += `<div class="form-field-group"><label>${field.label}</label><input type="${field.type}" name="${field.name}" value="${data[field.name] || ''}" class="styled-input" ${field.required ? 'required' : ''}></div>`;
        }
    });

    form += `<button type="submit" class="form-button-submit animated-button gradient-blue-green">${isEdit ? 'Update' : 'Add'}</button></form>`;
    return form;
}

async function addUser(type) {
    const form = document.querySelector('#modal-body form');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    if (type === 'staff') {
        data.staffType = data.role.toUpperCase(); 
        data.role = 'STAFF';
    } else {
        data.role = type.slice(0, -1).toUpperCase();
    }

    const url = `http://localhost:8080/api/auth/register`;
    const method = 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            closeAdminModal();
            renderUserList(type);
        } else {
            const error = await response.text();
            alert('Failed to add user: ' + error);
        }
    } catch (error) {
        console.error('Error submitting form:', error);
    }
}

async function updateUser(type, id) {
    const form = document.querySelector('#modal-body form');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    const url = `http://localhost:8080/api/${type}/${id}`;
    const method = 'PUT';

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            closeAdminModal();
            renderUserList(type);
        } else {
            console.error('Form submission failed');
        }
    } catch (error) {
        console.error('Error submitting form:', error);
    }
}

function getFieldsForType(type, isEdit = false) {
    let fields = [];
    switch (type) {
        case 'patients':
            fields = [
                { name: 'fullName', label: 'Full Name', type: 'text', required: true },
                { name: 'email', label: 'Email', type: 'email', required: true },
                { name: 'dob', label: 'Date of Birth', type: 'date', required: true },
                { name: 'gender', label: 'Gender', type: 'select', required: true, options: [{value: 'male', label: 'Male'}, {value: 'female', label: 'Female'}, {value: 'other', label: 'Other'}] },
                { name: 'phone', label: 'Phone', type: 'tel', required: true },
                { name: 'address', label: 'Address', type: 'text', required: true },
            ];
            break;
        case 'doctors':
            fields = [
                { name: 'fullName', label: 'Full Name', type: 'text', required: true },
                { name: 'email', label: 'Email', type: 'email', required: true },
                { name: 'gender', label: 'Gender', type: 'select', required: true, options: [{value: 'male', label: 'Male'}, {value: 'female', label: 'Female'}, {value: 'other', label: 'Other'}] },
                { name: 'phone', label: 'Phone', type: 'tel', required: true },
                { name: 'specialty', label: 'Specialty', type: 'text', required: true },
                { name: 'fee', label: 'Consultation Fee', type: 'number', required: true },
            ];
            break;
        case 'staff':
            fields = [
                { name: 'fullName', label: 'Full Name', type: 'text', required: true },
                { name: 'email', label: 'Email', type: 'email', required: true },
                { name: 'gender', label: 'Gender', type: 'select', required: true, options: [{value: 'male', label: 'Male'}, {value: 'female', label: 'Female'}, {value: 'other', label: 'Other'}] },
                { name: 'phone', label: 'Phone', type: 'tel', required: true },
                { name: 'role', label: 'Role', type: 'select', required: true, options: [{value: 'admin', label: 'Admin'}, {value: 'pharmacist', label: 'Pharmacist'}, {value: 'support_staff', label: 'Support Staff'}] },
            ];
            break;
    }
    if (!isEdit) {
        fields.push({ name: 'password', label: 'Password', type: 'password', required: true });
    }
    return fields;
}

async function sendEmergencyAlert() {
    const patientId = localStorage.getItem('userId');
    const patientName = localStorage.getItem('userName');

    if (!patientId || !patientName) {
        alert('Please log in as a patient to send an emergency alert.');
        return;
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            try {
                const response = await fetch('http://localhost:8080/api/emergency/alert', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        patientId: patientId,
                        patientName: patientName,
                        latitude: latitude,
                        longitude: longitude
                    }),
                });

                if (response.ok) {
                    alert('Emergency alert sent successfully! Help is on the way.');
                } else {
                    const errorText = await response.text();
                    alert('Failed to send emergency alert: ' + errorText);
                }
            } catch (error) {
                console.error('Error sending emergency alert:', error);
                alert('An error occurred while sending the emergency alert. Please try again.');
            }
        }, (error) => {
            console.error('Geolocation error:', error);
            alert('Could not retrieve your location. Please enable location services and try again.');
        });
    } else {
        alert('Geolocation is not supported by your browser.');
    }
}

async function renderEmergencyAlerts() {
    const alertsContainer = document.getElementById('emergency-alerts-list');
    if (!alertsContainer) return;

    alertsContainer.innerHTML = 'Loading emergency alerts...';

    try {
        const response = await fetch('http://localhost:8080/api/emergency/alerts');
        if (!response.ok) {
            throw new Error('Failed to fetch emergency alerts.');
        }
        const alerts = await response.json();

        if (alerts.length === 0) {
            alertsContainer.innerHTML = '<p>No emergency alerts at this time.</p>';
            return;
        }

        let html = '';
        alerts.forEach(alert => {
            html += `
                <div class="user-list-item">
                    <span><strong>Patient:</strong> ${alert.patientName} (ID: ${alert.patientId})</span>
                    <span><strong>Location:</strong> Lat: ${alert.latitude}, Lon: ${alert.longitude}</span>
                    <span><strong>Time:</strong> ${new Date(alert.timestamp).toLocaleString()}</span>
                    <div>
                        <button class="button-profile animated-button" onclick="viewPatientHistory(${alert.patientId})">View History</button>
                        <button class="button-profile animated-button" onclick="deleteEmergencyAlert(${alert.id})">Delete</button>
                    </div>
                </div>
            `;
        });
        alertsContainer.innerHTML = html;

        const adminAlertsCount = document.getElementById('emergency-alerts-count');
        if (adminAlertsCount) {
            adminAlertsCount.textContent = `${alerts.length} new alerts.`;
        }

    } catch (error) {
        console.error('Error rendering emergency alerts:', error);
        alertsContainer.innerHTML = `<p class="error-message">${error.message}</p>`;
    }
}

async function viewPatientHistory(patientId) {
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = 'Loading patient history...';
    openAdminModal();

    try {
        const userResponse = await fetch(`http://localhost:8080/api/patients/${patientId}/user`);
        if (!userResponse.ok) {
            throw new Error('Failed to fetch user details.');
        }
        const user = await userResponse.json();
        const userId = user.id;

        const response = await fetch(`http://localhost:8080/api/patients/user/${userId}/history`);
        if (!response.ok) {
            throw new Error('Failed to fetch patient history.');
        }
        const history = await response.json();

        let html = '<h3>Patient History</h3>';
        html += `<p><strong>Name:</strong> ${history.fullName}</p>`;
        html += `<p><strong>Date of Birth:</strong> ${new Date(history.dob).toLocaleDateString()}</p>`;
        html += `<p><strong>Gender:</strong> ${history.gender}</p>`;
        html += `<p><strong>Phone:</strong> ${history.phone}</p>`;
        html += `<p><strong>Address:</strong> ${history.address}</p>`;

        modalBody.innerHTML = html;
    } catch (error) {
        console.error('Error fetching patient history:', error);
        modalBody.innerHTML = `<p class="error-message">${error.message}</p>`;
    }
}

async function deleteEmergencyAlert(alertId) {
    if (confirm('Are you sure you want to delete this emergency alert?')) {
        try {
            const response = await fetch(`http://localhost:8080/api/emergency/alerts/${alertId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                alert('Emergency alert deleted successfully.');
                renderEmergencyAlerts();
            } else {
                const errorText = await response.text();
                alert('Failed to delete emergency alert: ' + errorText);
            }
        } catch (error) {
            console.error('Error deleting emergency alert:', error);
            alert('An error occurred while deleting the emergency alert. Please try again.');
        }
    }
}