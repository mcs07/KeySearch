import semver from 'semver'
import store from './store'
const isInteger = require('lodash/isInteger')


// Abbreviations
const app = safari.application
const ext = safari.extension

// popWindow = ext.popovers[0].contentWindow;

// Safari Application event listeners
app.addEventListener('command', performCommand, false)
app.addEventListener('validate', validateCommand, false)
app.addEventListener('beforeSearch', handleBeforeSearch, false)
app.addEventListener('message', handleMessage, false)


console.log('KeySearch global page loaded')

console.log('======')
for (let k of store) {
  console.log(k)
}
console.log('======')
console.log(store.all())


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
    let url = parseQuery(textEntered)
    if (url) {
      e.preventDefault()
      // TODO: Multiple URLs, open subsequent in background tabs
      e.target.url = url
    }
  }
}


// Run init function when global page is loaded
init()


// Converts the entered text into a URL
function parseQuery(textEntered) {
  console.log('Parsing input: ' + textEntered)
  if (textEntered.substr(0, 1) == '>') {
    // If text starts with > use google site search
    let key = textEntered.split(' ')[0]
    // If no domain provided, get from currently open page
    let siteToSearch = (key.length == 1) ? app.activeBrowserWindow.activeTab.url.match(/:\/\/(www\.)?(.[^/:]+)/)[2] : key.substr(1)
    // Construct query and URL
    let query = 'site:' + siteToSearch + ' ' + textEntered.substr(key.length + 1)
    let url = 'http://www.google.com/search?q=' + encodeURIComponent(query).replace(/%20/g, '+')
    console.log('URL: ' + url)
    return url
  } else {
    let key = textEntered.split(' ')[0]
    let query = textEntered.substr(key.length + 1)
    let data = store.get(key)
    // If no query or no key or disabled key, take entire input as query and use default
    if (query === '' || !data || !data.enabled || key == 'default') {
      query  = textEntered
      data = store.get('default')
    }
    let url = data.url.replace('@@@', encodeURIComponent(query).replace(/%20/g, '+'))
    console.log('URL: ' + url)
    return url
  }
}

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


