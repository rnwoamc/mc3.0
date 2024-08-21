document.addEventListener('DOMContentLoaded', function () {
    Promise.all([
        fetch('hardness.csv').then(response => response.text()),
        fetch('ops_details.csv').then(response => response.text())
    ])
    .then(([hardnessCSV, opsDetailsCSV]) => {
        const hardnessData = Papa.parse(hardnessCSV, { header: true, dynamicTyping: true }).data;
        const opsDetailsData = Papa.parse(opsDetailsCSV, { header: true, dynamicTyping: true }).data;

	const opsDetailsColumns = ['DG200 Units Consumed','DG250 Units Consumed','Cauvery Water Received','WTP Water Received','STP Water Received']; // Replace with actual columns from hardness.csv
	const hardnessColumns = ['Raw Tank Hardness Report','Final Tank Hardness Report']; // Replace with actual columns from ops_details.csv

        const hardnessStats = hardnessColumns.map(column => calculateStats(hardnessData, column));
        const opsDetailsStats = opsDetailsColumns.map(column => calculateStats(opsDetailsData, column));

        const allStats = [...hardnessStats, ...opsDetailsStats];

        displayTable(allStats);
    })
    .catch(error => console.error('Error loading CSV files:', error));
});

function calculateStats(data, columnName) {
    const columnData = data.map(row => ({
        value: row[columnName],
        date: row['Date'] || 'N/A' // Access the "Date" column
    })).filter(row => row.value !== null && row.value !== undefined);

    if (columnData.length === 0) {
        return { columnName, max: 'N/A', maxDate: 'N/A', min: 'N/A', minDate: 'N/A', avg: 'N/A' };
    }

    const max = Math.max(...columnData.map(row => row.value));
    const min = Math.min(...columnData.map(row => row.value));
    const maxDate = columnData.find(row => row.value === max)?.date || 'N/A';
    const minDate = columnData.find(row => row.value === min)?.date || 'N/A';
    const avg = columnData.reduce((a, b) => a + b.value, 0) / columnData.length;

    return { columnName, max, maxDate, min, minDate, avg: avg.toFixed(2) };
}

function displayTable(stats) {
    const tableContainer = document.getElementById('tableContainer');
    let table = `
        <table>
            <tr>
                <th>Column</th>
                <th>Max Value</th>
                <th>Date of Max</th>
                <th>Min Value</th>
                <th>Date of Min</th>
                <th>Average</th>
            </tr>
    `;

    stats.forEach(stat => {
        table += `
            <tr>
                <td>${stat.columnName}</td>
                <td>${stat.max}</td>
                <td>${stat.maxDate}</td>
                <td>${stat.min}</td>
                <td>${stat.minDate}</td>
                <td>${stat.avg}</td>
            </tr>
        `;
    });

    table += '</table>';
    tableContainer.innerHTML = table;
}

