// Global array variable
let currentArray = [100, 30, 25, 22];

// Initialize array from input
function initializeArrayFromInput() {
    const input = document.getElementById('array-input').value;
    const numbers = input.split(',').map(n => parseFloat(n.trim())).filter(n => !isNaN(n));
    if (numbers.length > 0) {
        currentArray = numbers;
        updateArrayDisplay();
        return true;
    }
    showMessage('Please enter valid numbers!');
    return false;
}

// Update array display
function updateArrayDisplay() {
    document.getElementById('array-display').innerHTML = `Array: [${currentArray.join(', ')}]`;
}

// Mutation Operations
function performPush() {
    if (!initializeArrayFromInput()) return;
    const newNum = 99; // Default push value
    currentArray.push(newNum);
    updateArrayDisplay();
    showMessage(`✓ Added ${newNum} to array using push()`);
}

function performPop() {
    if (!initializeArrayFromInput()) return;
    if (currentArray.length > 0) {
        const removed = currentArray.pop();
        updateArrayDisplay();
        showMessage(`✓ Removed: ${removed} using pop()`);
    } else {
        showMessage('Array is empty!');
    }
}

function performUnshift() {
    if (!initializeArrayFromInput()) return;
    const newNum = 11; // Default unshift value
    currentArray.unshift(newNum);
    updateArrayDisplay();
    showMessage(`✓ Added ${newNum} at beginning using unshift()`);
}

function performSplice() {
    if (!initializeArrayFromInput()) return;
    if (currentArray.length > 0) {
        const removed = currentArray.splice(1, 1, 55);
        updateArrayDisplay();
        showMessage(`✓ Replaced element at index 1 with 55. Removed: ${removed[0]}`);
    } else {
        showMessage('Array is empty!');
    }
}

// Find Max and Min
function findMaxMin() {
    if (!initializeArrayFromInput()) return;

    if (currentArray.length === 0) {
        showMessage('Array is empty!');
        return;
    }

    // Method 1: Math.max/Math.min
    const method1Max = Math.max(...currentArray);
    const method1Min = Math.min(...currentArray);

    // Method 2: Using reduce
    const result = currentArray.reduce((acc, num) => ({
        max: Math.max(acc.max, num),
        min: Math.min(acc.min, num)
    }), { max: -Infinity, min: Infinity });

    // Method 3: Using loop
    let method3Max = currentArray[0];
    let method3Min = currentArray[0];
    for (let i = 1; i < currentArray.length; i++) {
        if (currentArray[i] > method3Max) method3Max = currentArray[i];
        if (currentArray[i] < method3Min) method3Min = currentArray[i];
    }

    const output = `
╔════════════════════════════════════╗
║  MAX & MIN ANALYSIS               ║
╚════════════════════════════════════╝

Array: [${currentArray.join(', ')}]
Length: ${currentArray.length}

─────────────────────────────────────
✓ Method 1: Math.max() / Math.min()
  Maximum: ${method1Max}
  Minimum: ${method1Min}

─────────────────────────────────────
✓ Method 2: Using reduce()
  Maximum: ${result.max}
  Minimum: ${result.min}

─────────────────────────────────────
✓ Method 3: Using Loop
  Maximum: ${method3Max}
  Minimum: ${method3Min}

─────────────────────────────────────
📊 Summary:
   Range: ${method1Min} to ${method1Max}
   Difference: ${method1Max - method1Min}`;

    document.getElementById('result-output').textContent = output;
}

function showMessage(message) {
    document.getElementById('result-output').textContent = message;
}

// Initialize on page load
window.addEventListener('load', function() {
    updateArrayDisplay();
    
    // Load array when input changes
    const inputField = document.getElementById('array-input');
    if (inputField) {
        inputField.addEventListener('change', function() {
            initializeArrayFromInput();
        });
    }
});

