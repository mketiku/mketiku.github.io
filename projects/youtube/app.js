let fullData = [];
let filteredData = [];
let charts = {};

// Upload handling
const uploadBox = document.getElementById('uploadBox');
const fileInput = document.getElementById('fileInput');

uploadBox.addEventListener('click', () => fileInput.click());

uploadBox.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadBox.classList.add('dragover');
});

uploadBox.addEventListener('dragleave', () => {
    uploadBox.classList.remove('dragover');
});

uploadBox.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadBox.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) loadFile(file);
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) loadFile(file);
});

function loadFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            processData(data);
        } catch (error) {
            alert('Error parsing JSON file. Please make sure it\'s a valid YouTube history file.');
        }
    };
    reader.readAsText(file);
}

function processData(data) {
    fullData = data
        .filter(item => item.title && item.time)
        .map(item => {
            let title = item.title.replace(/^watched\s+/i, '').trim();
            title = title.replace(/https:\/\/www\.youtube\.com\/watch\?v\\u003d/g, '');
            title = title.replace(/https:\/\/www\.youtube\.com\/watch\?v=/g, '');
            
            const time = new Date(item.time);
            const subtitles = item.subtitles || [];
            
            return {
                title,
                titleUrl: item.titleUrl,
                channelName: subtitles[0]?.name || '[Unknown]',
                channelUrl: subtitles[0]?.url,
                time,
                year: time.getFullYear(),
                month: time.getMonth(),
                weekday: time.toLocaleDateString('en-US', { weekday: 'long' }),
                hour: time.getHours()
            };
        })
        .sort((a, b) => a.time - b.time);

    populateFilters();
    filteredData = [...fullData];
    updateDashboard();
    
    document.getElementById('uploadSection').style.display = 'none';
    document.getElementById('content').style.display = 'block';
}

function populateFilters() {
    const years = [...new Set(fullData.map(d => d.year))].sort();
    const channels = [...new Set(fullData.map(d => d.channelName))].sort();
    
    const yearFilter = document.getElementById('yearFilter');
    yearFilter.innerHTML = years.map(y => `<option value="${y}" selected>${y}</option>`).join('');
    
    const channelFilter = document.getElementById('channelFilter');
    channelFilter.innerHTML = '<option value="all">All Channels</option>' + 
        channels.map(c => `<option value="${c}">${c}</option>`).join('');
}

document.getElementById('yearFilter').addEventListener('change', applyFilters);
document.getElementById('channelFilter').addEventListener('change', applyFilters);

function applyFilters() {
    const selectedYears = Array.from(document.getElementById('yearFilter').selectedOptions).map(o => parseInt(o.value));
    const selectedChannel = document.getElementById('channelFilter').value;
    
    filteredData = fullData.filter(d => {
        const yearMatch = selectedYears.length === 0 || selectedYears.includes(d.year);
        const channelMatch = selectedChannel === 'all' || d.channelName === selectedChannel;
        return yearMatch && channelMatch;
    });
    
    updateDashboard();
}

function updateDashboard() {
    updateMetrics();
    updateYearlyChart();
    updateWeekdayChart();
    updateHourChart();
    updateChannelsChart();
    updateRewatchSection();
    updateKeywordsChart();
}

function updateMetrics() {
    const uniqueChannels = new Set(filteredData.map(d => d.channelName)).size;
    const firstWatch = filteredData[0]?.time.toLocaleDateString() || 'N/A';
    const longestStreak = calculateLongestStreak();
    
    document.getElementById('metrics').innerHTML = `
        <div class="metric-card">
            <div class="metric-label">Total Videos</div>
            <div class="metric-value">${filteredData.length.toLocaleString()}</div>
        </div>
        <div class="metric-card">
            <div class="metric-label">Unique Channels</div>
            <div class="metric-value">${uniqueChannels}</div>
        </div>
        <div class="metric-card">
            <div class="metric-label">First Watched</div>
            <div class="metric-value" style="font-size: 1.3em;">${firstWatch}</div>
        </div>
        <div class="metric-card">
            <div class="metric-label">Longest Streak</div>
            <div class="metric-value">${longestStreak} days</div>
        </div>
    `;
}

function calculateLongestStreak() {
    const dates = [...new Set(filteredData.map(d => d.time.toDateString()))].sort();
    let maxStreak = 0;
    let currentStreak = 1;
    
    for (let i = 1; i < dates.length; i++) {
        const prev = new Date(dates[i - 1]);
        const curr = new Date(dates[i]);
        const diffDays = (curr - prev) / (1000 * 60 * 60 * 24);
        
        if (diffDays === 1) {
            currentStreak++;
        } else {
            maxStreak = Math.max(maxStreak, currentStreak);
            currentStreak = 1;
        }
    }
    
    return Math.max(maxStreak, currentStreak);
}

function updateYearlyChart() {
    const yearCounts = {};
    filteredData.forEach(d => {
        yearCounts[d.year] = (yearCounts[d.year] || 0) + 1;
    });
    
    destroyChart('yearlyChart');
    charts.yearlyChart = new Chart(document.getElementById('yearlyChart'), {
        type: 'bar',
        data: {
            labels: Object.keys(yearCounts).sort(),
            datasets: [{
                label: 'Videos Watched',
                data: Object.keys(yearCounts).sort().map(y => yearCounts[y]),
                backgroundColor: 'rgba(102, 126, 234, 0.8)',
                borderColor: 'rgba(102, 126, 234, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false }
            }
        }
    });
}

function updateWeekdayChart() {
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const weekdayCounts = {};
    weekdays.forEach(w => weekdayCounts[w] = 0);
    filteredData.forEach(d => weekdayCounts[d.weekday]++);
    
    destroyChart('weekdayChart');
    charts.weekdayChart = new Chart(document.getElementById('weekdayChart'), {
        type: 'bar',
        data: {
            labels: weekdays,
            datasets: [{
                label: 'Videos Watched',
                data: weekdays.map(w => weekdayCounts[w]),
                backgroundColor: 'rgba(118, 75, 162, 0.8)',
                borderColor: 'rgba(118, 75, 162, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false }
            }
        }
    });
}

function updateHourChart() {
    const hourCounts = Array(24).fill(0);
    filteredData.forEach(d => hourCounts[d.hour]++);
    
    destroyChart('hourChart');
    charts.hourChart = new Chart(document.getElementById('hourChart'), {
        type: 'bar',
        data: {
            labels: Array.from({length: 24}, (_, i) => i),
            datasets: [{
                label: 'Videos Watched',
                data: hourCounts,
                backgroundColor: 'rgba(102, 126, 234, 0.8)',
                borderColor: 'rgba(102, 126, 234, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { title: { display: true, text: 'Hour of Day' } }
            }
        }
    });
}

function updateChannelsChart() {
    const channelCounts = {};
    filteredData.forEach(d => {
        channelCounts[d.channelName] = (channelCounts[d.channelName] || 0) + 1;
    });
    
    const topChannels = Object.entries(channelCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 30);
    
    destroyChart('channelsChart');
    charts.channelsChart = new Chart(document.getElementById('channelsChart'), {
        type: 'bar',
        data: {
            labels: topChannels.map(c => c[0]),
            datasets: [{
                label: 'Videos Watched',
                data: topChannels.map(c => c[1]),
                backgroundColor: 'rgba(118, 75, 162, 0.8)',
                borderColor: 'rgba(118, 75, 162, 1)',
                borderWidth: 2
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false }
            }
        }
    });
}

function updateRewatchSection() {
    const minWatches = parseInt(document.getElementById('minWatches').value);
    const rewatchData = getRewatchedVideos(minWatches);
    
    if (rewatchData.length > 0) {
        document.getElementById('rewatchMetrics').innerHTML = `
            <div class="metric-card">
                <div class="metric-label">Total Rewatched Videos</div>
                <div class="metric-value">${rewatchData.length}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Most Rewatched</div>
                <div class="metric-value">${rewatchData[0].count}x</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Total Rewatch Count</div>
                <div class="metric-value">${rewatchData.reduce((sum, v) => sum + v.count, 0)}</div>
            </div>
        `;
        
        updateRewatchChart(rewatchData);
        updateRewatchTable(rewatchData);
    } else {
        document.getElementById('rewatchMetrics').innerHTML = '<div class="info-text">No videos found with the selected minimum watch count.</div>';
    }
}

function getRewatchedVideos(minWatches) {
    const videoMap = {};
    
    filteredData.forEach(d => {
        const key = `${d.title}|||${d.titleUrl}`;
        if (!videoMap[key]) {
            videoMap[key] = {
                title: d.title,
                titleUrl: d.titleUrl,
                channelName: d.channelName,
                times: []
            };
        }
        videoMap[key].times.push(d.time);
    });
    
    return Object.values(videoMap)
        .map(v => ({
            ...v,
            count: v.times.length,
            firstWatch: new Date(Math.min(...v.times)),
            lastWatch: new Date(Math.max(...v.times)),
            daysSpan: Math.floor((Math.max(...v.times) - Math.min(...v.times)) / (1000 * 60 * 60 * 24))
        }))
        .filter(v => v.count >= minWatches)
        .sort((a, b) => b.count - a.count);
}

function updateRewatchChart(rewatchData) {
    const top30 = rewatchData.slice(0, 30);
    
    destroyChart('rewatchChart');
    charts.rewatchChart = new Chart(document.getElementById('rewatchChart'), {
        type: 'bar',
        data: {
            labels: top30.map(v => v.title.length > 50 ? v.title.substring(0, 47) + '...' : v.title),
            datasets: [{
                label: 'Times Watched',
                data: top30.map(v => v.count),
                backgroundColor: 'rgba(102, 126, 234, 0.8)',
                borderColor: 'rgba(102, 126, 234, 1)',
                borderWidth: 2
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: (context) => top30[context[0].dataIndex].title
                    }
                }
            }
        }
    });
}

function updateRewatchTable(rewatchData) {
    const table = `
        <table>
            <thead>
                <tr>
                    <th>Video Title</th>
                    <th>Channel</th>
                    <th>Watch Count</th>
                    <th>First Watched</th>
                    <th>Last Watched</th>
                    <th>Days Span</th>
                </tr>
            </thead>
            <tbody>
                ${rewatchData.map(v => `
                    <tr>
                        <td>${v.title}</td>
                        <td>${v.channelName}</td>
                        <td>${v.count}</td>
                        <td>${v.firstWatch.toLocaleDateString()}</td>
                        <td>${v.lastWatch.toLocaleDateString()}</td>
                        <td>${v.daysSpan}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    document.getElementById('rewatchTable').innerHTML = table;
}

function updateKeywordsChart() {
    const words = {};
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'be', 'been', 'has', 'have', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'it', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'we', 'they', 'what', 'which', 'who', 'when', 'where', 'why', 'how']);
    
    filteredData.forEach(d => {
        const titleWords = d.title.toLowerCase().match(/\b\w+\b/g) || [];
        titleWords.forEach(word => {
            if (word.length > 2 && !stopWords.has(word)) {
                words[word] = (words[word] || 0) + 1;
            }
        });
    });
    
    const topWords = Object.entries(words)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 30);
    
    destroyChart('keywordsChart');
    charts.keywordsChart = new Chart(document.getElementById('keywordsChart'), {
        type: 'bar',
        data: {
            labels: topWords.map(w => w[0]),
            datasets: [{
                label: 'Frequency',
                data: topWords.map(w => w[1]),
                backgroundColor: 'rgba(118, 75, 162, 0.8)',
                borderColor: 'rgba(118, 75, 162, 1)',
                borderWidth: 2
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false }
            }
        }
    });
}

function destroyChart(chartId) {
    if (charts[chartId]) {
        charts[chartId].destroy();
    }
}

// Tab navigation
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');
    });
});

// Rewatch filter controls
document.getElementById('minWatches').addEventListener('input', (e) => {
    document.getElementById('minWatchesValue').textContent = e.target.value;
    updateRewatchSection();
});

// CSV Download
document.getElementById('downloadCSV').addEventListener('click', () => {
    const minWatches = parseInt(document.getElementById('minWatches').value);
    const rewatchData = getRewatchedVideos(minWatches);
    
    const csv = [
        ['Video Title', 'Channel', 'Watch Count', 'First Watched', 'Last Watched', 'Days Span'],
        ...rewatchData.map(v => [
            v.title,
            v.channelName,
            v.count,
            v.firstWatch.toLocaleDateString(),
            v.lastWatch.toLocaleDateString(),
            v.daysSpan
        ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rewatched_videos.csv';
    a.click();
    window.URL.revokeObjectURL(url);
});