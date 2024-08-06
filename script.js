// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBrKddsPrn-P1K-AbCr68PkpghadU4Qf2k",
    authDomain: "myapp-19a00.firebaseapp.com",
    projectId: "myapp-19a00",
    storageBucket: "myapp-19a00.appspot.com",
    messagingSenderId: "239542332118",
    appId: "1:239542332118:web:445f7b6d27353140ccb777"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Display current date
const dateElement = document.getElementById('currentDate');
const currentDate = new Date();
dateElement.textContent = currentDate.toLocaleDateString();

// Driver form functionality
const driverForm = document.getElementById('driverForm');
const driverStatus = document.getElementById('driverStatus');
const dieselStatus = document.getElementById('dieselStatus');
const dieselAmountGroup = document.getElementById('dieselAmountGroup');
const dieselAmount = document.getElementById('dieselAmount');
const paymentMethodGroup = document.getElementById('paymentMethodGroup');
const paymentMethod = document.querySelectorAll('input[name="paymentMethod"]');
const trips = document.getElementById('trips');
const tripsDetails = document.getElementById('tripsDetails');
const totalAmount = document.getElementById('totalAmount');
const dieselAmountError = document.getElementById('dieselAmountError');
const totalAmountError = document.getElementById('totalAmountError');
const tripsError = document.getElementById('tripsError');
const paymentMethodError = document.getElementById('paymentMethodError');

function updateFields() {
    const isDriver = driverStatus.value === 'yes' || driverStatus.value === 'self';
    dieselStatus.disabled = !isDriver;
    trips.disabled = !isDriver;
    paymentMethod.forEach(method => method.disabled = !isDriver);

    if (!isDriver) {
        dieselStatus.value = 'no';
        dieselAmountGroup.style.display = 'none';
        paymentMethodGroup.style.display = 'none';
        dieselAmount.value = '';
        trips.value = '';
        tripsDetails.style.display = 'none';
        document.getElementById('aboveTripsDetails').style.display = 'none';
        document.getElementById('phonePayAmounts').style.display = 'none';
        document.getElementById('phonePayAmounts').innerHTML = '';
        paymentMethod.forEach(method => method.checked = false);
        totalAmount.value = '';
    }

    updateDieselAmount();
}

function updateDieselAmount() {
    if (dieselStatus.value === 'yes') {
        dieselAmountGroup.style.display = 'block';
        paymentMethodGroup.style.display = 'block';
    } else {
        dieselAmountGroup.style.display = 'none';
        paymentMethodGroup.style.display = 'none';
        dieselAmount.value = '';
        paymentMethod.forEach(method => method.checked = false);
    }
}

driverStatus.addEventListener('change', updateFields);
dieselStatus.addEventListener('change', updateDieselAmount);

function createPhonePayFields(numberOfFields) {
    const phonePayAmounts = document.getElementById('phonePayAmounts');
    phonePayAmounts.innerHTML = ''; // Clear previous fields
    phonePayAmounts.style.display = 'block';

    for (let i = 1; i <= numberOfFields; i++) {
        const inputGroup = document.createElement('div');
        inputGroup.className = 'input-group';

        const label = document.createElement('label');
        if (trips.value === '0.5') {
            label.textContent = `PhonePay Amount for Half Trip:`;
        } else if (trips.value === '1') {
            label.textContent = `PhonePay Amount for Full Trip:`;
        } else if (trips.value === '1.5') {
            label.textContent = i === 1 ? `PhonePay Amount for First Trip:` : `PhonePay Amount for Half Trip:`;
        } else if (trips.value === '2') {
            label.textContent = `PhonePay Amount for Trip ${i}:`;
        } else {
            label.textContent = `PhonePay Amount for Trip ${i}:`;
        }
        label.htmlFor = `phonePayAmount${i}`;

        const input = document.createElement('input');
        input.type = 'number';
        input.name = `phonePayAmount${i}`;
        input.id = `phonePayAmount${i}`;
        input.placeholder = `Enter PhonePay amount`;
        input.classList.add('no-spinners');
        input.addEventListener('input', calculateTotalAmount);

        inputGroup.appendChild(label);
        inputGroup.appendChild(input);
        phonePayAmounts.appendChild(inputGroup);
    }
}

// Handle trips selection
trips.addEventListener('change', function() {
    const tripsDetails = document.getElementById('tripsDetails');
    const aboveTripsDetails = document.getElementById('aboveTripsDetails');
    const aboveTripsAmounts = document.getElementById('aboveTripsAmounts');

    if (this.value === 'above') {
        tripsDetails.style.display = 'none';
        aboveTripsDetails.style.display = 'block';
        aboveTripsAmounts.innerHTML = ''; // Clear previous inputs
        document.getElementById('numberOfTrips').value = ''; // Reset number of trips
        totalAmount.value = ''; // Reset total amount
    } else {
        tripsDetails.style.display = 'block';
        aboveTripsDetails.style.display = 'none';
        // Show/hide relevant input fields based on trip type
        document.getElementById('tripHalfAmount').style.display = this.value === '0.5' ? 'block' : 'none';
        document.getElementById('tripOneAmount').style.display = this.value === '1' ? 'block' : 'none';
        document.getElementById('tripOneAndHalfFirstAmount').style.display = this.value === '1.5' ? 'block' : 'none';
        document.getElementById('tripOneAndHalfHalfAmount').style.display = this.value === '1.5' ? 'block' : 'none';
        document.getElementById('tripTwoFirstAmount').style.display = this.value === '2' ? 'block' : 'none';
        document.getElementById('tripTwoSecondAmount').style.display = this.value === '2' ? 'block' : 'none';

        let numberOfFields;
        if (this.value === '0.5') {
            numberOfFields = 1;
        } else if (this.value === '1') {
            numberOfFields = 1;
        } else if (this.value === '1.5') {
            numberOfFields = 2;
        } else if (this.value === '2') {
            numberOfFields = 2;
        } else {
            numberOfFields = 0;
        }
        createPhonePayFields(numberOfFields);
    }
    calculateTotalAmount();
});

document.getElementById('numberOfTrips').addEventListener('input', function() {
    const aboveTripsAmounts = document.getElementById('aboveTripsAmounts');
    aboveTripsAmounts.innerHTML = ''; // Clear previous inputs

    const trips = parseInt(this.value) || 0;
    for (let i = 1; i <= trips; i++) {
        const inputGroup = document.createElement('div');
        inputGroup.className = 'input-group';

        const label = document.createElement('label');
        label.textContent = `Amount for Trip ${i}:`;
        label.htmlFor = `tripAmount${i}`;

        const input = document.createElement('input');
        input.type = 'number';
        input.name = `tripAmount${i}`;
        input.id = `tripAmount${i}`;
        input.placeholder = `Enter amount`;
        input.classList.add('no-spinners');
        input.addEventListener('input', calculateTotalAmount);

        inputGroup.appendChild(label);
        inputGroup.appendChild(input);
        aboveTripsAmounts.appendChild(inputGroup);
    }
    createPhonePayFields(trips);
    calculateTotalAmount();
});

function calculateTotalAmount() {
    const tripType = trips.value;
    let tripTotal = 0;
    let phonePayTotal = 0;

    if (tripType === '0.5') {
        tripTotal = parseFloat(document.getElementById('halfTripAmount').value) || 0;
    } else if (tripType === '1') {
        tripTotal = parseFloat(document.getElementById('oneTripAmount').value) || 0;
    } else if (tripType === '1.5') {
        const firstAmount = parseFloat(document.getElementById('oneAndHalfFirstTripAmount').value) || 0;
        const halfAmount = parseFloat(document.getElementById('oneAndHalfHalfTripAmount').value) || 0;
        tripTotal = firstAmount + halfAmount;
    } else if (tripType === '2') {
        const firstAmount = parseFloat(document.getElementById('twoFirstTripAmount').value) || 0;
        const secondAmount = parseFloat(document.getElementById('twoSecondTripAmount').value) || 0;
        tripTotal = firstAmount + secondAmount;
    } else if (tripType === 'above') {
        const tripInputs = document.querySelectorAll('#aboveTripsAmounts input');
        tripInputs.forEach(input => {
            tripTotal += parseFloat(input.value) || 0;
        });
    }

    // Calculate PhonePay amounts
    const phonePayInputs = document.querySelectorAll('#phonePayAmounts input');
    phonePayInputs.forEach(input => {
        phonePayTotal += parseFloat(input.value) || 0;
    });

    const total = tripTotal + phonePayTotal;
    totalAmount.value = total > 0 ? total.toFixed(2) : '';
}

// Validate form submission
driverForm.addEventListener('submit', async function(event) {
    event.preventDefault();
    let isValid = true;

    // Reset error messages
    dieselAmountError.textContent = '';
    totalAmountError.textContent = '';
    tripsError.textContent = '';
    paymentMethodError.textContent = '';

    if (dieselStatus.value === 'yes' && (dieselAmount.value === '' || parseFloat(dieselAmount.value) <= 0)) {
        isValid = false;
        dieselAmountError.textContent = 'Diesel amount must be greater than 0';
    }

    if (totalAmount.value === '' || parseFloat(totalAmount.value) <= 0) {
        isValid = false;
        totalAmountError.textContent = 'Total amount must be greater than 0';
    }

    if (trips.value === '') {
        isValid = false;
        tripsError.textContent = 'Please select a trip option';
    }

    if (dieselStatus.value === 'yes' && !document.querySelector('input[name="paymentMethod"]:checked')) {
        isValid = false;
        paymentMethodError.textContent = 'Please select a payment method';
    }

    if (isValid) {
        try {
            const formData = {
                date: currentDate.toISOString(),
                driverStatus: driverStatus.value,
                dieselStatus: dieselStatus.value,
                dieselAmount: parseFloat(dieselAmount.value) || 0,
                paymentMethod: document.querySelector('input[name="paymentMethod"]:checked')?.value || '',
                trips: trips.value,
                totalAmount: parseFloat(totalAmount.value) || 0,
            };

            // Add trip-specific data
            if (trips.value === '0.5') {
                formData.halfTripAmount = parseFloat(document.getElementById('halfTripAmount').value) || 0;
            } else if (trips.value === '1') {
                formData.oneTripAmount = parseFloat(document.getElementById('oneTripAmount').value) || 0;
            } else if (trips.value === '1.5') {
                formData.oneAndHalfFirstTripAmount = parseFloat(document.getElementById('oneAndHalfFirstTripAmount').value) || 0;
                formData.oneAndHalfHalfTripAmount = parseFloat(document.getElementById('oneAndHalfHalfTripAmount').value) || 0;
            } else if (trips.value === '2') {
                formData.twoFirstTripAmount = parseFloat(document.getElementById('twoFirstTripAmount').value) || 0;
                formData.twoSecondTripAmount = parseFloat(document.getElementById('twoSecondTripAmount').value) || 0;
            } else if (trips.value === 'above') {
                formData.numberOfTrips = parseInt(document.getElementById('numberOfTrips').value) || 0;
                formData.tripAmounts = Array.from(document.querySelectorAll('#aboveTripsAmounts input')).map(input => parseFloat(input.value) || 0);
            }

            // Add PhonePay amounts
            formData.phonePayAmounts = Array.from(document.querySelectorAll('#phonePayAmounts input')).map(input => parseFloat(input.value) || 0);

            // Submit to Firebase
            const docRef = await addDoc(collection(db, "trips"), formData);
            console.log("Document written with ID: ", docRef.id);
            alert("Form submitted successfully!");
            driverForm.reset();
            updateFields();
        } catch (error) {
            console.error("Error adding document: ", error);
            alert("An error occurred while submitting the form. Please try again.");
        }
    }
});

// Ensure these event listeners are added to update total amount for all trip types
document.getElementById('tripsDetails').addEventListener('input', calculateTotalAmount);
document.getElementById('aboveTripsAmounts').addEventListener('input', calculateTotalAmount);

// Initial call to set the correct state
updateFields();