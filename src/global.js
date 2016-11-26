import semver from 'semver'
import store from './store'
const isInteger = require('lodash/isInteger')


// Abbreviations
const app = safari.application
const ext = safari.extension


// Safari Application event listeners
app.addEventListener('command', performCommand, false)
app.addEventListener('validate', validateCommand, false)
app.addEventListener('beforeSearch', handleBeforeSearch, false)
app.addEventListener('message', handleMessage, false)
ext.settings.addEventListener('change', handleSettingChanged, false);


// Debug logging
console.log('KeySearch global page loaded')
console.log('======')
for (let k of store) {
  console.log(k)
}
console.log('======')


// Runs once per browser session
function init() {
  if (!('version' in ext.settings)) {
    // New installation
    console.log('New KeySearch installation. Doing initial setup...')
    // Initialize the KeySearch store with some example keywords
    store.addPresets()
  } else if (isInteger(ext.settings.version)) {
    // Upgrade older KeySearch where version was stored as an integer
    console.log('Upgrading KeySearch from version ' + ext.settings.version)
    store.upgrade()
  }
  ext.settings.version = '3.0.0'
}


// Accept search input via the address bar
function handleBeforeSearch(e) {
  console.log('beforeSearch')
  console.log(e)
  let textEntered = e.query
  if (textEntered) {
    let urls = parseQuery(textEntered)
    if (urls.length > 0) {
      // Set the first URL as the target of the search event
      e.preventDefault()
      e.target.url = urls.shift()
      for (let url of urls) {
        // Open any additional URLs in background tabs
        app.activeBrowserWindow.openTab('background').url = url
      }
    }
  }
}


// Convert the entered text into URL(s) according to rules
function parseQuery(textEntered) {
  console.log('Parsing input: ' + textEntered)
  const token_re = /\{\{(.*?)\}\}/g
  let urls = []
  for (let rule of store) {
    // Get each token in key
    let tokens = rule.key.match(token_re)
    // Replace tokens with (.+?) and compile to regex
    let query_re = new RegExp('^' + rule.key.replace(token_re, '(.+?)') + '$')
    let queries = textEntered.match(query_re)
    if (queries) {
      // Replace tokens in URL with corresponding query
      let url = rule.url
      queries.shift()  // Remove first element (entire text entered)
      for (let i = 0; i < queries.length; i++) {
        url = url.split(tokens[i]).join(queries[i])
      }
      console.log('URL: ' + url)
      urls.push(url)
    }
  }
  return urls
}


// Open settings page
function openSettings() {
  console.log('Opening KeySearch settings page')
  app.activeBrowserWindow.openTab('foreground').url = ext.baseURI + 'index.html'
}


// Perform commands
function performCommand(e) {
  console.log('Command: ' + e.command)
  if (e.command === 'keySearchButton') {
    console.log('Toolbar button pressed')
    openSettings()
  } else if (e.command === 'keySearchContext') {
    console.log('Context menu item chosen')
    store.set(e.userInfo)
    openSettings()
  }
}


// Validate whether the context menu item should be shown
function validateCommand(e) {
  if (e.userInfo && e.userInfo.url == 'noUrl') {
    e.target.disabled = true
  } else {
    e.target.disabled = false
  }
}


// Handle messages from injected script
function handleMessage(e) {
  if (e.name === 'storeRequest') {
    console.log('global storeRequest')
    console.log(e)
    // Perform operation on keyword store and respond with result message
    let {id, method, args} = e.message
    let response = store[method].apply(store, args)
    e.target.page.dispatchMessage('storeResponse', {id, response})
  }
}


// Handle settings changes
function handleSettingChanged(e) {
  console.log(e)
  if (e.key === 'openSettings') {
    openSettings()
  }
}


// Run init function when global page is loaded
init()
