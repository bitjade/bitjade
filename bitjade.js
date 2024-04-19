const API = "https://api.bitjade.net/api"

// Function to update currentPool based on token selection
function updateCurrentPool(token) {
    // Update currentPool based on the token
    currentPool = token.toLowerCase(); // Assuming the token is in lowercase format
    
    // Fetch data for the selected pool via AJAX
    fetchDataForPool(currentPool);
}

// Function to fetch data for the selected pool via AJAX
function fetchDataForPool(pool) {
    // Make an AJAX request to fetch data for the selected pool
    fetch('https://api.bitjade.net/api/pools')
        .then(response => response.json())
        .then(data => {
            // Find the pool with matching ID
            const selectedPool = data.pools.find(p => p.id === pool);
            
            if (selectedPool) {
                // Once data is fetched, update the content on the right side of the page
                updateContent(selectedPool);
            } else {
                console.error('Pool not found:', pool);
            }
        })
        .catch(error => {
            console.error('Error fetching data for pool:', error);
        });
}

// Function to update the content on the right side of the page
function updateContent(poolData) {
    // Example: Assuming you have elements with IDs to update the content
    document.getElementById('poolName').textContent = poolData.coin.name;
    document.getElementById('poolStats').textContent = `Connected Miners: ${poolData.poolStats.connectedMiners}, Pool Hashrate: ${poolData.poolStats.poolHashrate}`;
    // Update other elements as needed with data fetched for the selected pool
}

// Add event listeners to token links in the sidebar
document.addEventListener('DOMContentLoaded', function() {
    // Assuming each token link in the sidebar has a class named 'token-link'
    var tokenLinks = document.querySelectorAll('.token-link');
    
    // Loop through each token link and attach click event listener
    tokenLinks.forEach(function(link) {
        link.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent default link behavior
            
            // Get the token from the link's href attribute
            var token = link.getAttribute('href').replace('#', ''); // Assuming the href attribute contains the token preceded by '#'
            
            // Update currentPool based on the selected token
            updateCurrentPool(token);
        });
    });
});


// Function to fetch block data from the API
function fetchBlockData() {
    return fetch('https://api.bitjade.net/api/pools/pgn1/blocks')
        .then(response => response.json())
        .then(data => data)
        .catch(error => {
            console.error('Error fetching block data:', error);
            return [];
        });
}

// Function to fetch block data from the API
function fetchMinerData() {
    return fetch('https://api.bitjade.net/api/pools/pgn1/miners')
        .then(response => response.json())
        .then(data => data)
        .catch(error => {
            console.error('Error fetching Miner data:', error);
            return [];
        });
}

// Function to fetch block data from the API
function fetchPerformanceData() {
    return fetch('https://api.bitjade.net/api/pools/pgn1/performance')
        .then(response => response.json())
        .then(data => data)
        .catch(error => {
            console.error('Error fetching Performance data:', error);
            return [];
        });
}

// Function to fetch data from the API
function fetchDataFromAPI(callback) {
    // Array to store promises for each fetch request
    const endpoints = [
        '/pools',
        '/pools/pgn1/blocks',
        '/pools/pgn1/performance',
        '/pools/pgn1/miners'
    ];
    const fetchPromises = endpoints.map(endpoint =>
        fetch(API + endpoint)
            .then(response => response.json())
            .then(data => ({ endpoint, data })) // Pass endpoint along with data
    );
    // Wait for all fetch requests to complete
    Promise.all(fetchPromises)
        .then(responses => {
            // Process each response separately
            responses.forEach(({ endpoint, data }) => {
                if (data.error) {
                    console.error('Error fetching data for endpoint', endpoint, ':', data.error);
                    return;
                }
                replaceTextWithAPIValues(endpoint, data); // Pass endpoint along with data
            });
        })
        .catch(error => console.error('Error fetching data:', error))
        .finally(() => {
            // After fetching data, call the callback function
            if (typeof callback === 'function') {
                callback();
            }
        });
}

// Function to replace text on the webpage with API values
function replaceTextWithAPIValues(endpoint, data) {
    try {
        switch (endpoint) {
            case '/pools':
                if (data && data.pools && data.pools.length > 0) {
                    const poolData = data.pools[0]; // Access the first item in the 'pools' array
                    if (poolData.coin && poolData.paymentProcessing) {
                        // Handle data from /pools endpoint
                        document.querySelector('[data-fetch="algorithm"]').textContent = poolData.coin.algorithm;
                        document.querySelector('[data-fetch="type"]').textContent = poolData.coin.type;
                        document.querySelector('[data-fetch="name"]').textContent = poolData.coin.name;
                        document.querySelector('[data-fetch="minimumPayment"]').textContent = poolData.paymentProcessing.minimumPayment;
                        document.querySelector('[data-fetch="poolFeePercent"]').textContent = poolData.poolFeePercent;
                        document.querySelector('[data-fetch="networkHashrate"]').setAttribute('data-value', poolData.networkStats.networkHashrate);
                        document.querySelector('[data-fetch="networkDifficulty"]').setAttribute('data-value', poolData.networkStats.networkDifficulty);
                        document.querySelector('[data-fetch="blockHeight"]').textContent = poolData.networkStats.blockHeight;
                        document.querySelector('[data-fetch="poolHashrate"]').setAttribute('data-value', poolData.poolStats.poolHashrate);
                        document.querySelector('[data-fetch="connectedMiners"]').textContent = poolData.poolStats.connectedMiners;

                        // Update data-value and data-unit
                        updateDataValues();
                    } else {
                        console.error('Required properties are missing in the API response for /pools endpoint.');
                    }
                } else {
                    console.error('Empty or invalid API response for /pools endpoint.');
                }
                break;
            case '/pools/pgn1/blocks':
                // Handle data from /pools/pgn1/blocks endpoint
                if (data && data.length > 0) {
                    const latestBlock = data[0]; // Assuming you want data from the latest block
                    const hashElement = document.querySelector('[data-fetch="hash"]');
                    const hash = latestBlock.hash;
                    // Cut off the hash to 12 characters followed by "..."
                    const truncatedHash = hash.substring(0, 17) + "...";
                    hashElement.textContent = truncatedHash;
                    // Populate the link property with a modified link based on the hash value
                    hashElement.setAttribute('href', 'https://pgn-explorer.urgo.org/block/' + hash);
                    hashElement.setAttribute('title', hash); // Add the full hash as a tooltip
                    // resume the rest of block endpoint
                    document.querySelector('[data-fetch="reward"]').textContent = latestBlock.reward;
                    document.querySelector('[data-fetch="created"]').textContent = data.created;

                    // Update data-value and data-unit
                    updateDataValues();
                } else {
                    console.error('API response for /pools/pgn1/blocks does not contain expected properties.');
                }
                break;
            case '/pools/pgn1/performance':
                // Handle data from /pools/pgn1/payments endpoint
                // Example: document.querySelector('[data-fetch="paymentAmount"]').textContent = data[0].amount;
                break;
            // Add cases for other endpoints as needed
            default:
                console.error('Unsupported endpoint:', endpoint);
                break;
        }
    } catch (error) {
        console.error('Error handling API data for endpoint', endpoint, ':', error);
    }
}

// Function to update elements with data-format="data-value" using fetched data
function updateDataValues() {
    // Select all elements with the custom attribute data-format="data-value"
    var elements = document.querySelectorAll('[data-format="data-value"]');

    // Iterate over each element
    elements.forEach(function (element) {
        // Get the numerical value and unit based on the data-value attribute
        var value = parseFloat(element.getAttribute('data-value'));
        var unit = element.getAttribute('data-unit');

        // Check if the value is 0
        if (value === 0) {
            element.textContent = "0"; // Display 0 directly
            return; // Exit the function
        }

        // Call the function to convert value to smaller unit and update the content
        var convertedValue = convertToSmallerUnit(value);
        var formattedValue = convertedValue.value.toFixed(2); // Limiting to 2 decimal places
        element.textContent = formattedValue + " " + convertedValue.unit;
        element.setAttribute('data-unit', convertedValue.unit);
    });
}

// Function to convert value to smaller unit
function convertToSmallerUnit(value) {
    var si = [
        { value: 1e24, symbol: "Y" },
        { value: 1e21, symbol: "Z" },
        { value: 1e18, symbol: "E" },
        { value: 1e15, symbol: "P" },
        { value: 1e12, symbol: "T" },
        { value: 1e9, symbol: "G" },
        { value: 1e6, symbol: "M" },
        { value: 1e3, symbol: "k" }
    ];

    for (var i = 0; i < si.length; i++) {
        if (value >= si[i].value) {
            return { value: value / si[i].value, unit: si[i].symbol };
        }
    }

    // If the value is smaller than the smallest unit, return original value and unit
    return { value: value, unit: "" };
}

// Call the function to fetch data from the API
fetchDataFromAPI();


// Function to calculate average block time in seconds
async function calculateAverageBlockTime() {
    const blockData = await fetchBlockData();
    
    // Sort blockData array based on the created timestamps
    blockData.sort((a, b) => new Date(a.created) - new Date(b.created));
    
    const blockCount = blockData.length;
    const timeDifferences = [];

    // Calculate time differences between consecutive blocks and log them
    for (let i = 1; i < blockCount; i++) {
        const prevTimestamp = new Date(blockData[i - 1].created).getTime();
        const currentTimestamp = new Date(blockData[i].created).getTime();
        const timeDifference = currentTimestamp - prevTimestamp;
        if (timeDifference > 0) {
            // Store positive time differences
            timeDifferences.push(timeDifference);
        }
        console.log(`Time difference between block ${i - 1} and ${i}: ${timeDifference} ms`);
    }

    // Calculate the average of time differences
    const sumTimeDifferences = timeDifferences.reduce((acc, cur) => acc + cur, 0);
    const averageTimeDifference = sumTimeDifferences / timeDifferences.length;

    return averageTimeDifference;
}

// Function to update HTML element with the average block time
async function updateAverageBlockTime() {
    const averageBlockTimeInSeconds = await calculateAverageBlockTime();
    let formattedAverageBlockTime = "";

    if (averageBlockTimeInSeconds < 0) {
        // If the average block time is negative, set it to 0
        formattedAverageBlockTime = "0 s";
    } else if (averageBlockTimeInSeconds < 60) {
        // Display in seconds with the unit "s"
        formattedAverageBlockTime = averageBlockTimeInSeconds.toFixed(2) + " s";
    } else {
        // Convert to minutes and display with the unit "m"
        const averageBlockTimeInMinutes = averageBlockTimeInSeconds / 60;
        formattedAverageBlockTime = averageBlockTimeInMinutes.toFixed(2) + " m";
    }

    document.querySelector('[data-id="averageBlockTime"]').textContent = formattedAverageBlockTime;
}

// Call the function to update the average block time
updateAverageBlockTime();

//CHARTS BELOW
// Function to load stats chart from MiningCore API
function loadStatsChart() {
    return $.ajax(API + "pools/" + currentPool + "/performance")
        .done(function(data) {
            labels = [];
            poolHashRate = [];
            networkHashRate = [];
            networkDifficulty = [];
            connectedMiners = [];
            connectedWorkers = [];

            $.each(data.stats, function(index, value) {
                // Your existing data processing logic...
            });

            var dataPoolHash          = {labels: labels, series: [poolHashRate]};
            var dataNetworkHash       = {labels: labels, series: [networkHashRate]};
            var dataNetworkDifficulty = {labels: labels, series: [networkDifficulty]};
            var dataMiners            = {labels: labels, series: [connectedMiners, connectedWorkers]};

            var options = {
                // Your chart options...
            };

            var responsiveOptions = [
                // Your responsive options...
            ];

            // Render charts using Chartist.js
            Chartist.Line("#chartStatsHashRate", dataNetworkHash, options, responsiveOptions);
            Chartist.Line("#chartStatsHashRatePool", dataPoolHash, options, responsiveOptions);
            Chartist.Line("#chartStatsDiff", dataNetworkDifficulty, options, responsiveOptions);
            Chartist.Line("#chartStatsMiners", dataMiners, options, responsiveOptions);

        })
        .fail(function() {
            // Error handling...
        });
}

// Call the loadStatsChart function to load the chart
loadStatsChart();


// TEST 