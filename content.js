chrome.runtime.sendMessage({ todo: "showPageAction" });

let isMainPanelVisible = false;
let isTaskRunning = false;

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
            <p id='warehouse_logs'></p>
        </div>
    `;
    document.body.appendChild(wrapper);
};

// Function: Promise based timer
const timer = sec => {
    const ms = sec * 1000;
    return new Promise(res => setTimeout(res, ms));
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
    isTaskRunning = true;
    const startStopBtn = document.getElementById('startStopBtn');
    if (startStopBtn) startStopBtn.innerText = 'STOP';
    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) clearBtn.disabled = true;
    console.log('A task is still running!');
};

// Function: set all visuals/variables to indicate process has been stopped
const setProcessToStop = () => {
    isTaskRunning = false;
    const startStopBtn = document.getElementById('startStopBtn');
    if (startStopBtn) startStopBtn.innerText = 'START';
    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) clearBtn.disabled = false;
    console.log('Task was either halted or has completed!');
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

// Function: Query each property if it can be found in warehouse
const queryPropertyInWarehouse = async () => {
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
        // If 0 listings found
        if (result.className === 'alert alert-danger') {
            formattedResult = { resultCount: result.innerText, results: null };
            // If at least 1 listing is found, get the total count
        } else if (result.className === 'col-md-8 col-md-offset-2') {
            formattedResult = { resultCount: result.innerText };
            // If the element holds the property details of each listing
        } else if (result.className === 'well col-md-8 col-md-offset-2') {
            const propertyId = result.dataset.propertyId;
            const listingStatus = result.childNodes[0].childNodes[3].innerText === 'Exclude' ? 'Included' : 'Excluded';
            const propertyDetails = result.childNodes[1];
            const propertyDetailsRows = propertyDetails.childNodes[0].childNodes[0].rows;
            let details = {};
            for (const rowIndex in propertyDetailsRows) {
                if (rowIndex <= 22) {
                    const key = propertyDetailsRows[rowIndex].cells[0].innerText;
                    const content = propertyDetailsRows[rowIndex].cells[1].innerText;
                    details = { ...details, [key]: content };
                }
            }
            formattedResult = { ...formattedResult, results: { ...formattedResult.results, [propertyId]: { ...details, listingStatus: listingStatus } } };
        }
    }
    return formattedResult;
};

// Function: Create CSV file containing all results
const createDownloadableCsv = results => {
    console.table(results);
};

// Function: Display all results to the output section of the panel
const displayResults = results => {
    console.log(results);
    if (document.getElementById('results_table')) document.getElementById('results_table').remove();
    const container = document.getElementById('output_contents');
    container.innerHTML = '';
    const resultsTable = document.createElement('table');
    resultsTable.setAttribute('id', 'results_table');
    resultsTable.setAttribute('class', 'results_table');
    const resultsThead = document.createElement('thead');
    resultsThead.setAttribute('class', 'table_header');
    const resultsTbody = document.createElement('tbody');
    resultsTbody.setAttribute('class', 'table_body');
    const heading = document.createElement('tr');
    heading.innerHTML = `
            <th>searchKey</th>
            <th>taskType</th>
            <th>taskStatus</th>
            <th>taskRemarks</th>
            <th>resultCount</th>
            <th>sourceID</th>
            <th>included/excluded</th>
            <th>status</th>
            <th>address</th>
        `;
    resultsThead.appendChild(heading);
    resultsTable.appendChild(resultsThead);
    resultsTable.appendChild(resultsTbody);
    container.appendChild(resultsTable);
    results.forEach(result => {
        const searchKey = result.searchKey ? result.searchKey : '';
        const taskType = result.taskType ? result.taskType : '';
        const taskStatus = result.taskStatus ? result.taskStatus : '';
        const taskRemarks = result.remarks ? result.remarks : '';
        const resultCount = result.resultCount ? result.resultCount : '';
        const firstContentLine = document.createElement('tr');
        firstContentLine.innerHTML = `
            <td>${searchKey}</td>
            <td>${taskType}</td>
            <td>${taskStatus}</td>
            <td>${taskRemarks}</td>
            <td>${resultCount}</td>
            <td>&#8628</td><td></td><td></td><td></td>
        `;
        resultsTbody.appendChild(firstContentLine);
        const resultsPerSearchKey = result.results;
        for (const resultPerSearchKey in resultsPerSearchKey) {
            const eachResult = resultsPerSearchKey[resultPerSearchKey];
            const contents = document.createElement('tr');
            contents.innerHTML = `
                    <td></td><td></td><td></td><td></td><td></td>
                    <td>${eachResult.property_id}</td>
                    <td>${eachResult.listingStatus}</td>
                    <td>${eachResult.status}</td>
                    <td>${eachResult.street_number} ${eachResult.street} ${eachResult.suburb}</td>
            `;
            resultsTbody.appendChild(contents);
        }
        const divider = document.createElement('tr');
        divider.innerHTML = '<td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>';
        divider.setAttribute('class', 'row_divider');
        resultsTbody.appendChild(divider);

    });
};

// Function: Main function for processing a given task
const mainTaskProcessor = async () => {
    let allResults = [];
    const taskType = getTaskType();
    const searchKeys = getData();
    const inputType = getInputType();
    let textBox;
    const warehouse_logs = document.getElementById('warehouse_logs');
    const container = document.getElementById('output_contents');
    container.innerHTML = `<p>Task [${taskType}] is running...</p>`;
    // If inputData is of propertyId type
    if (inputType === 'propertyId') {
        textBox = document.getElementById('property_id');
        document.getElementById('address').value = '';
        // If inputData is of propertyAddress type
    } else if (inputType === 'propertyAddress') {
        textBox = document.getElementById('address');
        document.getElementById('property_id').value = '';
        // If unable to determine either
    } else {
        console.log('Something went wrong in selecting the correct textBox.');
    }
    // If searchKeys is not nullish
    if (searchKeys) {
        setProcessToRun();
        for (const searchKey of searchKeys) {
            // If task has not been requested to be stopped
            if (isTaskRunning) {
                textBox.value = searchKey;
                warehouse_logs.innerText = `Performing [${taskType}] on ${searchKey}.`;
                let completedResult = { searchKey: searchKey, taskType: taskType };
                let formattedResult;
                let queryResult;
                queryResult = await queryPropertyInWarehouse();
                // If Task Type = search
                if (taskType === 'search') {
                    formattedResult = formatResult(queryResult);
                    completedResult = { ...completedResult, taskStatus: 'Done', remarks: 'N/A', ...formattedResult };
                    // If Task Type = exclude or include
                } else {
                    // If warehouse returns only one listing
                    if (queryResult.length === 2) {
                        const property = queryResult[1].childNodes[0].childNodes[3];
                        const propertyState = property.dataset.state;
                        // If task type = exclude and the listing is currently included
                        if (taskType === 'exclude' && propertyState === 'included') {
                            property.click();
                            do { await timer(1); } while (document.getElementById('results').style.display === 'none');
                            const verifyExclusionResult = await queryPropertyInWarehouse();
                            const updatedProperty = verifyExclusionResult[1].childNodes[0].childNodes[3];
                            const updatedPropertyState = updatedProperty.dataset.state;
                            formattedResult = formatResult(verifyExclusionResult);
                            // If the state of the listing has changed to excluded
                            if (updatedPropertyState === 'excluded') {
                                completedResult = { ...completedResult, taskStatus: 'Success', remarks: 'Exclusion Successful', ...formattedResult };
                                // If the state of the listing did not change
                            } else {
                                completedResult = { ...completedResult, taskStatus: 'Failed', remarks: 'Unable to exclude', ...formattedResult };
                            }
                            // If task type = include and the listing is currently excluded
                        } else if (taskType === 'include' && propertyState === 'excluded') {
                            property.click();
                            do { await timer(1); } while (document.getElementById('results').style.display === 'none');
                            const verifyExclusionResult = await queryPropertyInWarehouse();
                            const updatedProperty = verifyExclusionResult[1].childNodes[0].childNodes[3];
                            const updatedPropertyState = updatedProperty.dataset.state;
                            formattedResult = formatResult(verifyExclusionResult);
                            // If the state of the listing has changed to included
                            if (updatedPropertyState === 'included') {
                                completedResult = { ...completedResult, taskStatus: 'Success', remarks: 'Inclusion Successful', ...formattedResult };
                                // If the state of the listing did not change
                            } else {
                                completedResult = { ...completedResult, taskStatus: 'Failed', remarks: 'Unable to include', ...formattedResult };
                            }
                            // If task type = include and listing is currently included or task type = exclude and listing is currently excluded
                        } else {
                            formattedResult = formatResult(queryResult);
                            completedResult = { ...completedResult, taskStatus: 'Failed', remarks: `Currently ${propertyState}`, ...formattedResult };
                        }
                        // If warehouse returns 0 or > 2 listings
                    } else {
                        formattedResult = formatResult(queryResult);
                        // If 0 listings found
                        if (queryResult.length === 1) {
                            completedResult = { ...completedResult, taskStatus: 'Failed', remarks: 'No listings found', ...formattedResult };
                            // If multiple listings found
                        } else if (queryResult.length > 2) {
                            completedResult = { ...completedResult, taskStatus: 'Failed', remarks: 'Multiple listings found', ...formattedResult };
                            // If the results container never got to load
                        } else {
                            completedResult = { ...completedResult, taskStatus: 'Failed', remarks: 'Gateway Timeout. Please retry!', ...formattedResult };
                        }
                    }
                }
                allResults.push(completedResult);
            }
        }
    }
    displayResults(allResults);
    setProcessToStop();
};

// Function: Perform initial checks prior to starting task
const checkDependencies = () => {
    const officeSelector = document.getElementById('datacode');
    const inputData = getData();
    // If no task is running
    if (!isTaskRunning) {
        // If an office is selected
        if (officeSelector.value !== '') {
            // If addresses/ids have been entered in the textarea
            if (inputData) {
                mainTaskProcessor();
            } else {
                alert('Please input IDs/Addresses of properties you want to process!');
            }
        } else {
            alert('Please select an office!');
        }
    } else {
        alert('A task is still running!');
    }
};

// Function: START/STOP button clicked handler
const clickedStartStop = startStopBtn => {
    startStopBtn.onclick = () => {
        if (startStopBtn.innerText === 'START') {
            checkDependencies();
        } else {
            const response = confirm('Are you sure you want to stop the task?');
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




