chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.sync.set({ taskType: "", toExclude: "", whatList: "", processState: "Stopped", stopIt: false, skipDuplicates: 'yes' }, () => console.log(`
        --background.js--
        Reset to Default: taskType, toExclude, whatList, processState, stopIt, skipDuplicates!
        `)
    );
    chrome.storage.sync.get(['taskType', 'toExclude', 'whatList', 'processState', 'stopIt', 'skipDuplicates'], result =>
        console.log(`
        --background.js--
        taskType: ${result.taskType}
        toExclude: ${result.toExclude}
        processState: ${result.processState}
        stopIt: ${result.stopIt}
        skipDuplicates: ${result.skipDuplicates}
        `)
    );
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.todo == "showPageAction") {
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => chrome.pageAction.show(tabs[0].id));
    }
});
