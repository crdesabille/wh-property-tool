chrome.runtime.sendMessage({ todo: "showPageAction" });

let isMainPanelVisible = false;
let isProcessRunning = false;

// Function: Promise based timer
const timer = sec => {
    const ms = sec * 1000;
    return new Promise(res => setTimeout(res, ms));
};

// Function: Create the main panel
const createMainPanel = () => {
    const wrapper = document.createElement('div');
    wrapper.id = 'warehouse_tool';
    wrapper.className = 'warehouse_tool';
    wrapper.innerHTML = `
        <h4>WH Property Tool</h4>
        
        <div class='task_type_container'>
            <p>Please select type of task:</p>
            <input type='radio' checked='checked' name='task_type' value='search'></input><span>Search</span>
            <input type='radio' name='task_type' value='exclude'></input><span>Exclude</span>
            <input type='radio' name='task_type' value='include'></input><span>Include</span>
        </div>

        <div class='input_type_container'>
            <p>Please select type of input:</p>
            <input type='radio' checked='checked' name='input_type' value='propertyId'></input><span>Property ID</span>
            <input type='radio' name='input_type' value='propertyAddress'></input><span>Property Address</span>
        </div>
        
        <div class='input_container'>
            <p>Paste the IDs / Addresses to process below:</p>
            <textarea id='input_data' placeholder="Input addresses or ids separated by ;"></textarea>
        </div>

        <div class='controls_container'>
            <button id='startStopBtn'>START</button>
            <button id='clearBtn'>Clear</button>
        </div>

        <div class='output_container'>
            <p>Output</p>
            <div id='output_contents'></div>
        </div>

        <div class='logs_container'>
            <p>Logs</p>
            <div id='logs'></div>
        </div>
    `;
    document.body.appendChild(wrapper);
};

// Function: Show or Hide main panel
const showHideMainPanel = async () => {
    if (document.getElementById('warehouse_tool') === null) {
        createMainPanel();
        await timer(0.15);
        const mainPanel = document.getElementById('warehouse_tool');
        if (!isMainPanelVisible) {
            isMainPanelVisible = !isMainPanelVisible;
            mainPanel.className = 'warehouse_tool warehouse_tool-open';
        } else {
            isMainPanelVisible = !isMainPanelVisible;
            mainPanel.className = 'warehouse_tool';
        }
    } else {
        const mainPanel = document.getElementById('warehouse_tool');
        if (!isMainPanelVisible) {
            isMainPanelVisible = !isMainPanelVisible;
            mainPanel.className = 'warehouse_tool warehouse_tool-open';
        } else {
            isMainPanelVisible = !isMainPanelVisible;
            mainPanel.className = 'warehouse_tool';
        }
    }
}

// Function: Fetch the data from text area
const getData = () => {
    const inputDataContainer = document.getElementById('input_data');
    let inputData = '';
    if (inputDataContainer) {
        const stringData = inputDataContainer.value.trim();
        if (stringData !== '') {
            const arrayData = stringData.split(';');
            if (arrayData.length > 0) {
                inputData = arrayData.map(arrayItem => arrayItem.trim()).filter(arrItem => arrItem !== '');
            }
        }
    }
    return inputData.length > 0 ? inputData : null;
};

// Function: Fetch task type selected by user [search, exclude, include]
const getTaskType = () => {
    const taskTypeSelectors = document.getElementsByName('task_type');
    let taskType;
    if (taskTypeSelectors.length > 0) {
        taskTypeSelectors.forEach(taskTypeSelector => {
            if (taskTypeSelector.checked) {
                taskType = taskTypeSelector.value;
            }
        });
    } else {
        taskType = null;
    }
    return taskType;
};

// Function: Fetch input type selected by user [propertyId, propertyAddress]
const getInputType = () => {
    const inputTypeSelectors = document.getElementsByName('input_type');
    let inputType;
    if (inputTypeSelectors.length > 0) {
        inputTypeSelectors.forEach(inputTypeSelector => {
            if (inputTypeSelector.checked) {
                inputType = inputTypeSelector.value;
            }
        });
    } else {
        inputType = null;
    }
    return inputType;
};

// Function: set all visuals/variables to indicate process is running
const setProcessToRun = () => {
    isProcessRunning = true;
    const startStopBtn = document.getElementById('startStopBtn');
    if (startStopBtn) startStopBtn.innerText = 'STOP';
    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) clearBtn.disabled = true;
    console.log('Process running!');
};

// Function: set all visuals/variables to indicate process has been stopped
const setProcessToStop = () => {
    isProcessRunning = false;
    const startStopBtn = document.getElementById('startStopBtn');
    if (startStopBtn) startStopBtn.innerText = 'START';
    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) clearBtn.disabled = false;
    console.log('Process halted or complete!');
};

// Function: Clear fields and reset button
const resetFields = () => {
    const inputTypeSelectors = document.getElementsByName('input_type');
    if (inputTypeSelectors.length > 0) {
        inputTypeSelectors.forEach(inputTypeSelector => {
            inputTypeSelector.checked = inputTypeSelector.value === 'propertyId' ? true : false;
        });
    }
    const taskTypeSelectors = document.getElementsByName('task_type');
    if (taskTypeSelectors.length > 0) {
        taskTypeSelectors.forEach(taskTypeSelector => {
            taskTypeSelector.checked = taskTypeSelector.value === 'search' ? true : false;
        });
    }
    const inputDataContainer = document.getElementById('input_data');
    if (inputDataContainer) inputDataContainer.value = '';
    const propertyIdTextBox = document.getElementById('property_id');
    if (propertyIdTextBox) propertyIdTextBox.value = '';
    const addressTextBox = document.getElementById('address');
    if (addressTextBox) addressTextBox.value = '';
};

// Function: click search button
const clickSearchBtn = async sec => {
    const searchBtn = document.getElementById('btn-search');
    if (searchBtn) searchBtn.click();
    await timer(sec);
}

// Function: Query each property from warehouse
const queryProperty = async args => {
    const [property, inputType] = args;
    const textBox = inputType === 'propertyId' ? document.getElementById('property_id') : document.getElementById('address');
    textBox.value = property;
    let waitTime = 1;
    let warehouseResponse;
    do {
        await clickSearchBtn(waitTime);
        warehouseResponse = document.getElementById('results');
        waitTime += 0.1;
    } while (document.getElementById('results').style.display === 'none' || document.getElementById('results') === null);
    const searchResult = warehouseResponse ? warehouseResponse.children : null;
    return searchResult;
};

// Function: take only the needed data from searchResult and put it in one object
const formatResult = results => {
    let formattedResult = {};
    for (const result of results) {
        if (result.className === 'alert alert-danger') {
            formattedResult = { resultCount: result.innerText, results: null }; // No listings found
        } else if (result.className === 'col-md-8 col-md-offset-2') {
            formattedResult = { resultCount: result.innerText }; // ### listings found
        } else if (result.className === 'well col-md-8 col-md-offset-2') {
            // Each listing
            for (const child of result.children) {
                if (child.className === 'property-details') {
                    let details = {};
                    const rows = child.childNodes[0].childNodes[0].rows;
                    for (const index in rows) {
                        if (index <= 22) {
                            const key = rows[index].cells[0].innerText;
                            const content = rows[index].cells[1].innerText;
                            details = { ...details, [key]: content };
                        }
                    }
                    formattedResult = { ...formattedResult, results: { ...formattedResult.results, [details['property_id']]: { ...details } } };
                }
            }
        }
    }
    return formattedResult;
};

// Function: Main function for task type = search
const searchProperties = async () => {
    let searchResults = [];
    const searchKeys = getData();
    const inputType = getInputType();
    if (searchKeys) {
        setProcessToRun();
        for (const searchKey of searchKeys) {
            if (isProcessRunning) {
                const searchResult = await queryProperty([searchKey, inputType]);
                const formattedResult = formatResult(searchResult);
                const completeSearchResult = { searchKey: searchKey, ...formattedResult };
                searchResults.push(completeSearchResult);
            }
        }
    }
    console.log(searchResults);
    setProcessToStop();
};

// Function: Main function for task type = exclude
const excludeProperties = () => { };

// Function: Main function for task type = include
const includeProperties = () => { };

const selectTaskType = () => {
    const taskType = getTaskType();
    switch (taskType) {
        case 'search': return searchProperties();
        case 'exclude': return excludeProperties();
        case 'include': return includeProperties();
        default: return console.log('No Task Type selected.');
    }
};

// Function: Perform initial checks prior to starting process
const checkDependencies = () => {
    const officeSelector = document.getElementById('datacode');
    const inputData = getData();
    if (!isProcessRunning) {
        if (officeSelector.value !== '') {
            if (inputData) {
             selectTaskType();
            } else {
                alert('Please input IDs/Addresses of properties you want to process!');
            }
        } else {
            alert('Please select an office!');
        }
    } else {
        alert('A process is still running!');
    }
};

// Function: START/STOP button clicked handler
const clickedStartStop = startStopBtn => {
    startStopBtn.onclick = () => {
        if (startStopBtn.innerText === 'START') {
            checkDependencies();
        } else {
            const response = confirm('Are you sure you want to stop the process?');
            if (response) setProcessToStop();
        }
    };
};

// Function: START/STOP button clicked handler
const clickedClear = clearBtn => {
    clearBtn.onclick = () => {
        const response = confirm('Are you sure you want to reset all fields?');
        if (response) resetFields();
    };
};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.panel === 'display') {
        showHideMainPanel();
        clickedStartStop(document.getElementById('startStopBtn'));
        clickedClear(document.getElementById('clearBtn'));
    }
});



