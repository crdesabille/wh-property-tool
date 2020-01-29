'use strict';

let startStopBtn = document.getElementById('startStopBtn');
let clearBtn = document.getElementById('clearBtn');
let taskType;
let inputType;
let tasktStatus = 'stopped';

// Function: Search Property
const searchProperties = () => {
    /* chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.executeScript(
        tabs[0].id,
        {
          code: `
          
          `
        });
      
    }); */

    const addressTextInput = document.getElementById("address");
    const propertyIdTextInput = document.getElementById("property_id");
    console.log(addressTextInput);
    console.log(propertyIdTextInput);
    console.log(document.getElementsByName('task_type'));
};

const excludeProperties = () => {

};

const includeProperties = () => {

};







startStopBtn.onclick = () => {
    const taskTypeSelectors = document.getElementsByName('task_type');
    const inputTypeSelectors = document.getElementsByName('input_type');
    const inputData = document.getElementById('input_data');

    if (startStopBtn.innerText === 'START') {
        if (inputData.value !== '') {
            taskTypeSelectors.forEach(taskTypeSelector => {
                if (taskTypeSelector.checked) {
                    taskType = taskTypeSelector.value;
                }
            });

            inputTypeSelectors.forEach(inputTypeSelector => {
                if (inputTypeSelector.checked) {
                    inputType = inputTypeSelector.value;
                }
            });

            switch (taskType) {
                case 'search': return searchProperties();
                case 'exclude': return excludeProperties();
                case 'include': return includeProperties();
                default: console.log('Task Type');
            }
        } else {
            alert('Please input data in the text area!');
        }
    } else {
        console.log(startStopBtn.innerText);
    }
};

clearBtn.onclick = () => {
    const inputData = document.getElementById('input_data');
    inputData.value = '';
};


async function clickSearch(ms) {
    log(`Executing clickSearch set to ${ms}ms.`);
    let search = document.getElementById("btn-search");
    search.click();
    await timer(ms);
}  