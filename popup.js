'use strict';

const showHideBtn = document.getElementById('showHideBtn');

showHideBtn.onclick = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    chrome.tabs.sendMessage(tabs[0].id, { panel: 'display' });
  });
};
