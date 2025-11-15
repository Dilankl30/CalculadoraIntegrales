// Variables globales
let myChart = null; 

// Valores por defecto
const DEFAULT_A = 1;
const DEFAULT_B = -4;
const DEFAULT_C = 3;
const DEFAULT_LIMIT_A = 0;
const DEFAULT_LIMIT_B = 5;

document.addEventListener('DOMContentLoaded', () => {
    updateFunctionDisplay();
    calculate(); // Cálculo inicial
});

// --- FUNCIONALIDAD DE BÚSQUEDA ---
function filterSections() {
    const query = document.getElementById('keywordSearch').value.toLowerCase().trim();
    // Usamos querySelectorAll con :not(#busqueda) para no contar la sección eliminada, aunque ya se eliminó del HTML
    const sections = document.querySelectorAll('main > section.card'); 
    // Usaremos el system-status para el feedback de búsqueda en lugar de un div dedicado, por simplicidad
    const feedbackText = document.getElementById('system-status');
    let found = false;

    // Quitar resaltado de todas las secciones
    sections.forEach(sec => sec.classList.remove('highlight'));
    feedbackText.textContent = `Buscando: "${query}"...`;
    feedbackText.className = 'status-message info';


    if (query.length < 3) {
        // Restaurar mensaje inicial o un mensaje neutral
        updateSystemStatus('¡Bienvenido! Ingresa los coeficientes y haz clic en CALCULAR.', 'info');
        return;
    }

    sections.forEach(section => {
        const content = section.textContent.toLowerCase();
        
        if (content.includes(query)) {
            section.classList.add('highlight');
            found = true;
        }
    });

    if (found) {
        feedbackText.textContent = `Éxito: Se encontraron resultados para "${query}". La(s) sección(es) relevante(s) está(n) resaltada(s).`;
    } else {
        feedbackText.textContent = `No se encontraron resultados para "${query}". Intenta con otras palabras clave (ej: "Mínimo", "Integral").`;
        feedbackText.className = 'status-message error'; // Usar color de error para no encontrado
    }
}
// ------------------------------------------

// --- Funciones para manejar el estado de carga ---
function setCalculatingState(isCalculating) {
    const btn = document.getElementById('calculateBtn');
    const btnText = document.getElementById('button-text');
    const loader = document.getElementById('calc-loader');

    if (isCalculating) {
        btn.classList.add('calculating');
        btn.disabled = true;
        btnText.style.display = 'none';
        loader.style.display = 'block';
        updateSystemStatus('Cargando... Calculando valores.', 'info');
    } else {
        btn.classList.remove('calculating');
        btn.disabled = false;
        btnText.style.display = 'block';
        loader.style.display = 'none';
    }
}

// --- Funcionalidad de Reseteo y Mensajes ---
function resetForm() {
    document.getElementById('coefA').value = DEFAULT_A;
    document.getElementById('coefB').value = DEFAULT_B;
    document.getElementById('coefC').value = DEFAULT_C;
    document.getElementById('limitA').value = DEFAULT_LIMIT_A;
    document.getElementById('limitB').value = DEFAULT_LIMIT_B;
    
    updateSystemStatus('¡Valores restablecidos a los predeterminados! Listo para calcular.', 'info');
    document.getElementById('coefA').classList.remove('input-error');

    updateFunctionDisplay();
    calculate(true); 
}

function updateSystemStatus(message, type) {
    const statusDiv = document.getElementById('system-status');
    statusDiv.textContent = message;
    statusDiv.className = 'status-message ' + type;
}

function updateFunctionDisplay() {
    const a = parseFloat(document.getElementById('coefA').value);
    const b = parseFloat(document.getElementById('coefB').value);
    const c = parseFloat(document.getElementById('coefC').value);

    let funcString = 'f(x) = ';

    const formatTerm = (coeff, variable, power) => {
        if (isNaN(coeff) || coeff === 0) return '';
        let str = '';
        const absCoeff = Math.abs(coeff);

        if (funcString.length > 8) { str += coeff > 0 ? ' + ' : ' - '; } 
        else if (coeff < 0) { str += '-'; }

        if (absCoeff !== 1 || power === 0) { str += absCoeff; }
        if (variable) { str += variable; }
        if (power > 1) { str += (power === 2 ? '²' : '³'); }
        return str;
    };

    funcString += formatTerm(a, 'x', 2);
    funcString += formatTerm(b, 'x', 1).replace(/^\s*(\+)\s*/, '');
    funcString += formatTerm(c, '', 0).replace(/^\s*(\+)\s*/, '');

    if (funcString.trim() === 'f(x) =') {
        funcString = 'f(x) = ax² + bx + c';
    } else {
        funcString = funcString.replace(/\s(\-)\s(\d)/, ' - $2'); 
        if (funcString.startsWith('f(x) = + ')) {
            funcString = funcString.substring(8);
        }
    }

    document.getElementById('functionEq').textContent = funcString;
}

// --- Función Principal de Cálculo ---
function calculate(bypassLoad = false) {
    if (bypassLoad) {
        performCalculation();
    } else {
        setCalculatingState(true);
        setTimeout(() => {
            performCalculation();
            setCalculatingState(false);
        }, 500);
    }
}

function performCalculation() {
    const aInput = document.getElementById('coefA');
    const b = parseFloat(document.getElementById('coefB').value);
    const c = parseFloat(document.getElementById('coefC').value);
    const limitA = parseFloat(document.getElementById('limitA').value);
    const limitB = parseFloat(document.getElementById('limitB').value);
    let a = parseFloat(aInput.value);

    if (isNaN(a) || isNaN(b) || isNaN(c) || isNaN(limitA) || isNaN(limitB)) {
        updateSystemStatus('ERROR: Ingresa valores numéricos válidos en todos los campos.', 'error');
        return;
    }
    
    if (a === 0) {
        aInput.classList.add('input-error');
        updateSystemStatus('ADVERTENCIA: a = 0. La función es lineal. Resultados del Vértice: N/A.', 'error');
    } else {
        aInput.classList.remove('input-error');
        updateSystemStatus('Cálculo realizado', 'info');
    }

    // --- Cálculos de Mínimos y Máximos (Vértice) ---
    let vertexType = '';
    let vertexX, vertexY;

    if (a > 0) {
        vertexType = 'Mínimo';
        vertexX = -b / (2 * a);
        vertexY = a * Math.pow(vertexX, 2) + b * vertexX + c;
    } else if (a < 0) {
        vertexType = 'Máximo';
        vertexX = -b / (2 * a);
        vertexY = a * Math.pow(vertexX, 2) + b * vertexX + c;
    } else { // a === 0
        vertexType = 'No aplica (función lineal)';
        vertexX = 'N/A';
        vertexY = 'N/A';
    }

    const formatValue = (val) => typeof val === 'number' ? val.toFixed(2) : val;

    document.getElementById('vertexType').textContent = vertexType;
    document.getElementById('vertexX').textContent = formatValue(vertexX);
    document.getElementById('vertexY').textContent = formatValue(vertexY);
    document.getElementById('vertexPoint').textContent = `(${formatValue(vertexX)}, ${formatValue(vertexY)})`;

    // --- Cálculos de Integral Definida y Indefinida ---
    const F = (x) => (a / 3) * Math.pow(x, 3) + (b / 2) * Math.pow(x, 2) + c * x;
    const definiteIntegralResult = F(limitB) - F(limitA);
    document.getElementById('definiteIntegral').textContent = definiteIntegralResult.toFixed(2) + ' unidades cuadradas';
}

// Se eliminan las funciones initializeChart y updateChart.