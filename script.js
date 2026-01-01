const SUPABASE_URL = 'https://jrdxoxzovgrrhisddlxg.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_1fOfJo6VXa7YDTOPeW2hcg_3LZTBR9V'; 

let supabaseClient = null;
if (typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

function generateSmartTips(activity, gb) {
    let tips = { immediate: [], habits: [], settings: [] };

    const isHighUsage = gb > 200;
    const isMediumUsage = gb > 50 && gb <= 200;

    if (activity === 'streaming_hd') {
        if (isHighUsage) {
            tips.immediate.push(`You used ${gb}GB. Consider switching to "Standard Definition" to save data.`);
            tips.immediate.push("If available, try using Wi-Fi instead of cellular data.");
            tips.habits.push("When binge-watching, remember that 2 hours of 4K is about 14GB.");
            tips.settings.push("Disabling 'Autoplay' can help prevent accidental usage.");
        } else if (isMediumUsage) {
            tips.immediate.push("Your usage is average. Closing unused tabs can help save a bit more.");
            tips.immediate.push("Try downloading instead of streaming video.");
            tips.habits.push("Downloading content on Wi-Fi before trips is a great habit.");
            tips.settings.push("Check if your app has a 'Data Saver' mode enabled.");
        } else {
            tips.immediate.push("Great job keeping your usage sustainable!");
            tips.habits.push("Keep up the good work of using Wi-Fi when possible.");
            tips.settings.push("You are already using efficient settings.");
        }
    } 
    else if (activity === 'gaming') {
        if (isHighUsage) {
            tips.immediate.push("Large game updates are likely the cause. Can you schedule them for off-peak hours?");
            tips.immediate.push("Reviewing installed games and removing unused ones helps stop updates.");
            tips.habits.push("Try to download big patches over night or when energy demand is lower.");
            tips.settings.push("Check your launcher settings for an 'Auto-Update Schedule'.");
        } else if (isMediumUsage) {
            tips.immediate.push("Closing game launchers when not in use prevents background drain.");
            tips.habits.push("Single-player or offline modes use significantly less data than online play.");
            tips.settings.push("Setting your console to 'Energy Saver' is a quick win.");
        } else {
            tips.immediate.push("Your gaming footprint is very low. Nice work!");
            tips.habits.push("Putting your device to sleep after playing helps maintain this.");
            tips.settings.push("Your current update schedule seems efficient.");
        }
    }
    else { 
        if (gb > 50) {
            tips.immediate.push("Browsing usage is a bit high. Video-heavy sites might be the cause.");
            tips.habits.push("Compressing large files before uploading to the cloud saves space.");
            tips.settings.push("An ad-blocker can improve load times and reduce data.");
        } else if (isMediumUsage) {
            tips.immediate.push("Closing browser tabs you aren't using is a simple way to save.");
            tips.habits.push("Bookmarking your favorite sites saves searching every time.");
            tips.settings.push("Clearing your cache occasionally helps browser efficiency.");
        } else {
            tips.immediate.push("Excellent! Text and image browsing has a very low impact.");
            tips.habits.push("Unsubscribing from unused newsletters keeps your inbox clean.");
            tips.settings.push(" 'Lite Mode' in browsers can save even more data.");
        }
    }
    return tips;
}

async function runCalculation() {
    const genderVal = document.getElementById('gender-select').value;
    const dataVal = parseFloat(document.getElementById('data-input').value);
    const activityVal = document.getElementById('activity-select').value;
    const statusMsg = document.getElementById('status-message');
    const tipsContainer = document.getElementById('tips-container');
    const chartVisual = document.getElementById('chart-visual');

    if (genderVal === "") { alert("Please select a Gender."); return; }
    if (isNaN(dataVal) || dataVal < 0) { alert("Please enter valid Data Usage."); return; }
    if (activityVal === "") { alert("Please select an Activity."); return; }

    statusMsg.textContent = "Analyzing...";
    statusMsg.style.color = "#666";

    const factors = { 'streaming_hd': 0.8, 'gaming': 0.4, 'browsing': 0.2 };
    const co2Result = dataVal * (factors[activityVal] / 1000); 

    const MONTHLY_LIMIT = 1.0; 
    let percent = (co2Result / MONTHLY_LIMIT) * 100;
    let visualPercent = Math.min(Math.max(percent, 5), 100);
    
    let color = '#4CAF50';
    let statusText = "Sustainable";
    let statusClass = "status-low";

    if (percent > 100) {
        color = '#D32F2F';
        statusText = "High Impact";
        statusClass = "status-high";
    } else if (percent > 50) {
        color = '#F57C00';
        statusText = "Moderate";
        statusClass = "status-mid";
    }

    document.getElementById('co2-result').textContent = co2Result.toFixed(3);
    chartVisual.style.background = `conic-gradient(${color} ${(visualPercent/100)*360}deg, #E5E7EB 0)`;
    document.getElementById('percentage-text').textContent = Math.round(percent) + '%';
    
    const explainText = document.getElementById('explanation-text');
    explainText.innerHTML = `Result: <span class="${statusClass}">${statusText}</span> usage level.`;

    const myTips = generateSmartTips(activityVal, dataVal);
    
    const fillList = (id, items) => {
        const list = document.getElementById(id);
        list.innerHTML = "";
        items.forEach(item => {
            let li = document.createElement("li");
            li.textContent = item;
            list.appendChild(li);
        });
    };

    fillList('tips-immediate', myTips.immediate);
    fillList('tips-habits', myTips.habits);
    fillList('tips-settings', myTips.settings);

    tipsContainer.style.display = "block";
    if(window.innerWidth < 768) {
        tipsContainer.scrollIntoView({ behavior: 'smooth' });
    }

    if (supabaseClient) {
        try {
            const { error } = await supabaseClient
                .from('carbon_entries')
                .insert([{ 
                    gender: genderVal,
                    data_usage_gb: dataVal, 
                    activity_type: activityVal, 
                    total_co2_kg: co2Result.toFixed(4)
                }]);

            if (error) {
                console.error("DB Error:", error);
                statusMsg.textContent = "Saved locally (Offline).";
            } else {
                statusMsg.textContent = "✔ Saved to cloud.";
                statusMsg.style.color = "green";
            }
        } catch (err) { console.error(err); }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('calc-btn');
    if(btn) btn.addEventListener('click', runCalculation);

    const acc = document.getElementsByClassName("accordion-btn");
    for (let i = 0; i < acc.length; i++) {
        acc[i].addEventListener("click", function() {
            for(let j=0; j<acc.length; j++) {
                if(acc[j] !== this) {
                    acc[j].classList.remove("active");
                    acc[j].nextElementSibling.style.maxHeight = null;
                    acc[j].querySelector('span').textContent = "+";
                }
            }

            this.classList.toggle("active");
            const panel = this.nextElementSibling;
            const icon = this.querySelector('span');
            
            if (panel.style.maxHeight) {
                panel.style.maxHeight = null;
                icon.textContent = "+";
            } else {
                panel.style.maxHeight = panel.scrollHeight + "px";
                icon.textContent = "−";
            } 
        });
    }
});