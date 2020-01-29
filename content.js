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
        </div>

        <div class='logs_container'>
            <p>Logs</p>
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
    console.log('Process halted!');
};

// Function: click search button
const clickSearchBtn = async sec => {
    const searchBtn = document.getElementById("btn-search");
    if (searchBtn) searchBtn.click();
    await timer(sec);
}

// Function: Query each property from warehouse
const queryProperty = async args => {
    const [property, inputType] = args;
    const textBox = inputType === 'propertyId' ? document.getElementById("property_id") : document.getElementById("address");
    textBox.value = property;
    let waitTime = 1;
    let searchResult;
    let warehouseResponse;
    while (!warehouseResponse) {
        await clickSearchBtn(waitTime);
        warehouseResponse = document.getElementById('results');
        searchResult = warehouseResponse ? warehouseResponse.children : null;
        waitTime += 0.1;
    }
    return Array.from(searchResult);
};

// Function: Main function for task type = search
const searchProperties = async () => {
    let results = [];
    let updatedResults = [];
    const properties = getData();
    const inputType = getInputType();
    console.log(inputType);
    if (properties) {
        setProcessToRun();
        for (let property of properties) {
            if (isProcessRunning) {
                const result = await queryProperty([property, inputType]);
                results.push({ [property]: [...result] });
            }
        }
    }
    for (let result of results) {
        for (let key in result) {
            result[key].map(res => {
                res.childNodes.forEach(child => {
                    if (child.nodeType === 3) {
                        console.log(child);
                        updatedResults.push({ [key]: child });
                    } else if (child.nodeType === 1) {
                        console.log(child);
                    }
                });
            });
        }
    }
};

// Function: Main function for task type = exclude
const excludeProperties = () => { };

// Function: Main function for task type = include
const includeProperties = () => { };

const routeTaskType = () => {
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
                routeTaskType();
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
            if (response) {
                setProcessToStop();
            } else {
                console.log('Proceeding.');
            }
        }
    };
};

// Function: START/STOP button clicked handler
const clickedClear = clearBtn => {
    clearBtn.onclick = () => {
        console.log('Clicked clear')
    };
};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.panel === 'display') {
        showHideMainPanel();
        clickedStartStop(document.getElementById('startStopBtn'));
        clickedClear(document.getElementById('clearBtn'));
    }
});



