chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.sync.set({ isMainPanelVisible: false },
        () => console.log(`
        --background.js--
            Reset isMainPanelVisible: false
        `)
    );
    chrome.storage.sync.get(['isMainPanelVisible'],
        result =>
            console.log(`
        --background.js--
            isMainPanelVisible: ${result.isMainPanelVisible}
        `)
    );
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.todo == "showPageAction") {
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => chrome.pageAction.show(tabs[0].id));
    }
});
