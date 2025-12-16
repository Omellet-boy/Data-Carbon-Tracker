// ** Content Team Integration: Activity-Specific Emissions Factors **
// Estimates in grams of CO2e per Gigabyte (g/GB) for Operational Energy.
// Note: These figures are illustrative and represent simplified averages.
const EMISSION_FACTORS_G_PER_GB = {
    // High Impact: Large data transfer + high processing/rendering (e.g., 4K streaming, heavy cloud gaming)
    'streaming_hd': 0.8, 
    // Moderate Impact: Consistent data transfer, less processing (e.g., general online gaming, large file uploads)
    'gaming': 0.4, 
    // Low Impact: Smaller data transfer, text/image heavy (e.g., standard browsing, email, audio streaming)
    'browsing': 0.2 
};

/**
 * Calculates the total CO2 emissions based on data usage and activity type.
 */
function calculateCarbon() {
    const dataInput = document.getElementById('data-input');
    const activitySelector = document.getElementById('activity-selector');

    const dataUsageGB = parseFloat(dataInput.value);
    const selectedActivity = activitySelector.value;

    const resultBox = document.getElementById('result-box');
    const co2ResultSpan = document.getElementById('co2-result');
    const explanationBox = document.getElementById('explanation-box');
    const explanationText = document.getElementById('explanation-text');
    
    // 1. Validation for Data and Activity
    if (isNaN(dataUsageGB) || dataUsageGB < 0) {
        co2ResultSpan.textContent = "Invalid Data Input";
        resultBox.classList.remove('hidden');
        explanationBox.classList.add('hidden');
        return;
    }

    if (selectedActivity === 'default') {
        co2ResultSpan.textContent = "Select Activity";
        resultBox.classList.remove('hidden');
        explanationBox.classList.add('hidden');
        return;
    }

    // 2. Get the specific CO2 factor (in grams/GB)
    const co2_per_gb_grams = EMISSION_FACTORS_G_PER_GB[selectedActivity];
    const co2_per_gb_kg = co2_per_gb_grams / 1000; // Convert to kg/GB

    // 3. Calculation: Total CO2 (kg) = Data Usage (GB) * CO2 per GB (kg/GB)
    const totalCO2_kg = dataUsageGB * co2_per_gb_kg;

    // Formatting the result to a maximum of 3 decimal places
    const formattedCO2 = totalCO2_kg.toFixed(3);

    // 4. Update UI
    co2ResultSpan.textContent = formattedCO2;
    resultBox.classList.remove('hidden');

    // 5. Generate Explanation
    explanationText.innerHTML = generateExplanation(totalCO2_kg, co2_per_gb_grams);
    explanationBox.classList.remove('hidden');
}

/**
 * Generates an explanation text based on the calculated CO2 in kg and the factor used.
 * @param {number} co2_kg - The calculated CO2 in kilograms.
 * @param {number} factor_g - The emission factor used in grams/GB.
 * @returns {string} HTML string with explanation and comparison.
 */
function generateExplanation(co2_kg, factor_g) {
    if (co2_kg < 0.001) {
        return `Your data usage generated negligible emissions (${factor_g.toFixed(1)}g/GB used).`;
    }

    // Comparison Values (same as previous version)
    const drivingDistance_km = co2_kg / 0.1; // 100g CO2 per km
    const kettleBoils = co2_kg / 0.036;     // 36g CO2 per boil
    
    let explanation = `Using a factor of ${factor_g.toFixed(1)}g CO2 per GB, your usage generated ${co2_kg.toFixed(3)} kg of CO2.`;

    if (drivingDistance_km >= 0.1) {
        explanation += ` This is roughly equivalent to driving a small petrol car for ${drivingDistance_km.toFixed(1)} km.`;
    }

    if (kettleBoils >= 1) {
        explanation += ` Or, it's the same carbon footprint as boiling a kettle ${kettleBoils.toFixed(0)} times.`;
    }

    explanation += "<br>The emissions factor used here reflects the higher energy demands of data centers and network components for your chosen activity. Choosing energy-efficient services and lowering video quality can significantly reduce this impact.";

    return explanation;
}