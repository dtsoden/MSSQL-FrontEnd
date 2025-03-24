// JWT Configuration
const JWT_SECRET = '123456';
const API_BASE_URL = 'https://auto.cnxlab.us/webhook/v1';

// Crypto functions for JWT
function sha256(message) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    return window.crypto.subtle.digest('SHA-256', data);
}

async function hmacSha256(message, secret) {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(message);
    
    const cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    
    const signature = await window.crypto.subtle.sign(
        'HMAC',
        cryptoKey,
        messageData
    );
    
    return new Uint8Array(signature);
}

function base64UrlEncode(str) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(str)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

// Generate JWT Token
async function generateJWT() {
    const header = {
        alg: 'HS256',
        typ: 'JWT'
    };

    const payload = {
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour expiration
    };

    const encodedHeader = btoa(JSON.stringify(header))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    
    const encodedPayload = btoa(JSON.stringify(payload))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

    const signatureInput = encodedHeader + '.' + encodedPayload;
    const signature = await hmacSha256(signatureInput, '123456');
    const encodedSignature = base64UrlEncode(signature);

    return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

// Add this variable at the top of your script to track max ID
let currentMaxId = 0;

// Update the fetchCustomers function to calculate max ID
async function fetchCustomers() {
    try {
        const token = await generateJWT();
        const response = await fetch(`${API_BASE_URL}/getAllCustomers`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const text = await response.text();
            console.error('Response text:', text);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Calculate the maximum ID
        currentMaxId = data.reduce((max, customer) => 
            Math.max(max, customer.customer_id), 0);
            
        // Update the ID input field with next available ID
        updateNextAvailableId();
        
        displayCustomers(data);

    } catch (error) {
        console.error('Error fetching customers:', error);
        alert('Error fetching customers. Check console for details.');
    }
}

// Function to update the next available ID
function updateNextAvailableId() {
    const idInput = document.getElementById('customerId');
    const nextId = currentMaxId + 1;
    
    // Set the next ID as the value
    idInput.value = nextId;
}

// Ensure the form submission uses the hidden ID
document.getElementById('customerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const customerData = {
        customer_id: parseInt(document.getElementById('customerId').value),
        customer_name: document.getElementById('customerName').value,
        customer_email: document.getElementById('customerEmail').value,
        customer_phone: document.getElementById('customerPhone').value
    };
    addCustomer(customerData);
    e.target.reset();
    // Update the ID after form reset
    updateNextAvailableId();
});

// Update the addCustomer function to refresh the max ID after successful addition
async function addCustomer(customerData) {
    try {
        const token = await generateJWT();
        
        // Construct the payload to match the API's expected format
        const payload = {
            id: customerData.customer_id,
            Name: customerData.customer_name,
            "E-Mail": customerData.customer_email,
            PhoneNo: customerData.customer_phone
        };

        // Debugging: Log the payload being sent
        console.log('Payload being sent:', JSON.stringify(payload));

        const response = await fetch(`${API_BASE_URL}/addCustomer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            alert('Customer added successfully!');
            // Update currentMaxId with the new customer's ID
            currentMaxId = Math.max(currentMaxId, customerData.customer_id);
            // Refresh the customer list
            fetchCustomers();
        } else {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(errorText);
        }
    } catch (error) {
        alert('Error adding customer: ' + error.message);
    }
}

// Also update the delete customer function to refresh the max ID
async function deleteCustomer(id) {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    try {
        const token = await generateJWT();
        const response = await fetch(`${API_BASE_URL}/deleteCustomer`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ id })
        });
        
        if (response.ok) {
            alert('Customer deleted successfully!');
            fetchCustomers();
        } else {
            throw new Error('Failed to delete customer');
        }
    } catch (error) {
        alert('Error deleting customer: ' + error.message);
    }
}

// UI Functions
function displayCustomers(customers) {
    const gridContainer = document.querySelector('.grid-container');
    gridContainer.innerHTML = '';

    if (!customers || customers.length === 0) {
        gridContainer.innerHTML = '<p>No customers found.</p>';
        return;
    }

    customers.forEach(customer => {
        const card = document.createElement('div');
        card.className = 'customer-card';
        
        // Using the correct property names from the API response
        const name = customer.customer_name;
        const id = customer.customer_id;
        const email = customer.customer_email;
        const phone = customer.customer_phone;

        card.innerHTML = `
            <h3>${name}</h3>
            <p><strong>ID:</strong> ${id}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <button onclick="deleteCustomer(${id})" class="submit-btn">
                <i class="fas fa-trash"></i> Delete
            </button>
        `;
        gridContainer.appendChild(card);
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize date in footer
    const dateElement = document.getElementById('current-date');
    const yearElement = document.getElementById('year');
    
    function updateDate() {
        const now = new Date();
        dateElement.textContent = now.toLocaleDateString('en-US');
        yearElement.textContent = now.getFullYear();
    }
    
    updateDate();
    setInterval(updateDate, 1000 * 60); // Update every minute

    // Navigation
    const navButtons = document.querySelectorAll('.nav-btn');
    const customersGrid = document.getElementById('customers-grid');
    const addCustomerForm = document.getElementById('add-customer-form');

    navButtons.forEach(btn => {
        btn.addEventListener('click', async () => {
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (btn.dataset.action === 'showCustomers') {
                customersGrid.classList.add('active');
                addCustomerForm.classList.remove('active');
                await fetchCustomers();
            } else {
                customersGrid.classList.remove('active');
                addCustomerForm.classList.add('active');
            }
        });
    });

    // Initial load
    fetchCustomers();
}); 