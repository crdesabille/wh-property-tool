'use strict';

const showHideBtn = document.getElementById('showHideBtn');
// let showHideBtnText = false;

showHideBtn.onclick = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    chrome.tabs.sendMessage(tabs[0].id, { panel: 'togglePanelVisibility' });
  });
  // showHideBtnText = !showHideBtnText;
  // showHideBtn.innerText = showHideBtnText ? 'Hide Panel' : 'Show Panel';
};


chrome.storage.sync.get(['isMainPanelVisible'], result => {
  // showHideBtn.innerText = result.isMainPanelVisible ? 'Hide Panel' : !result.isMainPanelVisible ? 'Show Panel' : 'Show Panel';
});