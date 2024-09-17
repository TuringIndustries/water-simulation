const canvas = document.getElementById('waterCanvas');
const ctx = canvas.getContext('2d');

// Function to set canvas dimensions and ensure it fills the container properly
function setCanvasDimensions() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

setCanvasDimensions(); // Initialize the canvas dimensions

const numPoints = 100;
const initialWaterHeight = canvas.height * 0.5;
let points = new Array(numPoints).fill(initialWaterHeight);
let velocities = new Array(numPoints).fill(0);
const damping = 0.95;
const waveSpeed = 0.02;
const equilibriumReturnRate = 0.005;

let mouseX = null;
let mouseY = null;
let mouseActive = false;
let mouseRadius = 50;
let maxMouseDistance = 50; // Maximum vertical distance for mouse interaction
let lastMouseInteraction = 0; // Track the last time the mouse interacted
const interactionTimeout = 100; // Time in milliseconds before mouse influence fades

function getTotalArea() {
    let totalArea = 0;
    for (let i = 0; i < numPoints; i++) {
        totalArea += points[i];
    }
    return totalArea;
}

function adjustForVolume() {
    const currentArea = getTotalArea();
    const targetArea = initialWaterHeight * numPoints;
    const areaDifference = targetArea - currentArea;
    const adjustmentPerPoint = areaDifference / numPoints;

    for (let i = 0; i < numPoints; i++) {
        points[i] += adjustmentPerPoint;
    }
}

function updateWater() {
    const segmentWidth = canvas.width / numPoints;

    for (let i = 0; i < numPoints; i++) {
        let left = points[i - 1] || points[i];
        let right = points[i + 1] || points[i];
        velocities[i] += waveSpeed * (left + right - 2 * points[i]);
        velocities[i] *= damping;
        points[i] += velocities[i];

        // Check if the mouse is within the sphere of influence
        let currentTime = Date.now();
        if (mouseActive && (currentTime - lastMouseInteraction < interactionTimeout)) {
            let pointX = i * segmentWidth;
            let distX = Math.abs(pointX - mouseX);
            let distY = Math.abs(mouseY - points[i]);

            // Only perturb the water if the mouse is within a close vertical range and radius
            if (distX < mouseRadius && distY < maxMouseDistance) {
                // The closer the mouse is to the water point, the stronger the perturbation
                let strength = 1 - (distY / maxMouseDistance); // Strength decreases with distance
                velocities[i] += 0.03 * strength * (mouseY - points[i]);
            }
        }

        // Prevent points from going below the bottom of the canvas
        if (points[i] > canvas.height) {
            points[i] = canvas.height;
        }
    }

    adjustForVolume();

    for (let i = 0; i < numPoints; i++) {
        points[i] += equilibriumReturnRate * (initialWaterHeight - points[i]);
    }
}

function renderWater() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0077b6';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(0, points[0]);

    let segmentWidth = canvas.width / numPoints;
    for (let i = 1; i < numPoints; i++) {
        ctx.lineTo(i * segmentWidth, points[i]);
    }

    ctx.lineTo(canvas.width, points[numPoints - 1]);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();
    ctx.fill();
}

canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
    lastMouseInteraction = Date.now(); // Update last interaction time
    mouseActive = true; // Ensure the mouse is active while moving
});

canvas.addEventListener('mousedown', () => {
    mouseActive = true;
    lastMouseInteraction = Date.now(); // Track when the mouse starts interacting
});

canvas.addEventListener('mouseup', () => {
    mouseActive = false; // Stop mouse interaction on mouse release
});

window.addEventListener('resize', () => {
    setCanvasDimensions(); // Update canvas size on window resize
    points = new Array(numPoints).fill(initialWaterHeight); // Reset water points after resize
});

function animate() {
    updateWater();
    renderWater();
    requestAnimationFrame(animate);
}

animate();
