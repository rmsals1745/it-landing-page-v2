const skillsData = {
    labels: ['Frontend', 'Backend', 'Design', 'Communication', 'DevOps', 'Mobile'],
    datasets: [{
        label: 'My Skills',
        data: [8, 9, 6, 7, 5, 7],
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        borderColor: 'rgba(76, 175, 80, 1)',
        pointBackgroundColor: 'rgba(76, 175, 80, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(77, 182, 172, 1)'
    }]
};

const chartOptions = {
    scales: {
        r: {
            angleLines: {
                display: true
            },
            suggestedMin: 0,
            suggestedMax: 10
        }
    },
    maintainAspectRatio: false
};

const ctx = document.getElementById('skillsRadarChart').getContext('2d');
new Chart(ctx, {
    type: 'radar',
    data: skillsData,
    options: chartOptions
});

document.addEventListener('DOMContentLoaded', () => {
    const hermesStatsContainer = document.getElementById('hermes-stats-content');

    async function fetchHermesStats() {
        try {
            // Assuming the API is running on localhost:8000 as per agent-harness
            const response = await fetch('http://localhost:8000/api/hermes/stats');
            const stats = await response.json();

            if (stats.error) {
                throw new Error(stats.error);
            }

            if (!stats.installed) {
                hermesStatsContainer.innerHTML = '<p>Hermes is not installed on this system.</p>';
                return;
            }

            let recentMemoriesHtml = '<ul>';
            if (stats.recentMemories) {
                stats.recentMemories.forEach(mem => {
                    recentMemoriesHtml += `<li>${mem.name} - <i>${new Date(mem.mtime).toLocaleString()}</i></li>`;
                });
            }
            recentMemoriesHtml += '</ul>';

            let recentSkillsHtml = '<ul>';
            if (stats.recentSkillUsage) {
                stats.recentSkillUsage.forEach(skill => {
                    recentSkillsHtml += `<li>${skill.skill} - <i>${new Date(skill.calledAt).toLocaleString()}</i></li>`;
                });
            }
            recentSkillsHtml += '</ul>';

            hermesStatsContainer.innerHTML = `
                <div class="stat"><span>Memories</span><span class="value">${stats.memoriesCount || 0}</span></div>
                <p><b>Recent Memories:</b></p>
                ${recentMemoriesHtml}
                <div class="stat"><span>Skills</span><span class="value">${stats.skillsCount || 0}</span></div>
                <p><b>Recent Skill Usage:</b></p>
                ${recentSkillsHtml}
                <div class="stat"><span>Active Sessions</span><span class="value">${stats.activeSessions || 0}</span></div>
                <div class="stat"><span>Learning Events (7d)</span><span class="value">${stats.learningEvents7d || 0}</span></div>
                <div class="stat"><span>Paperclip Tasks Done (30d)</span><span class="value">${stats.paperclipDone30d || 0}</span></div>
            `;
             if(stats.db_error) {
                const errorEl = document.createElement('p');
                errorEl.style.color = 'orange';
                errorEl.textContent = `Warning: Could not read Hermes state DB. Some stats may be stale or missing. (${stats.db_error})`;
                hermesStatsContainer.appendChild(errorEl);
            }


        } catch (error) {
            hermesStatsContainer.innerHTML = `<p style="color: red;">Error loading Hermes stats: ${error.message}</p>`;
        }
    }

    fetchHermesStats();
});
