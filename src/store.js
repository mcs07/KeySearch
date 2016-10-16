import uuid from 'node-uuid'

// KeySearch data store

// This makes use of the Safari extension settings API to store the necessary data for each saved rule.
// Data is stored with ids starting with 'rule_' as a rudimentary namespace to distinguish from any other
// KeySearch settings.


const presets = [
  {key: 'wiki {{query}}', name: 'Wikipedia', url: 'http://en.wikipedia.org/w/index.php?search={{query}}', enabled: true},
  {key: '! {{url}}', name: 'Open URL', url: 'http://{{url}}', enabled: true},
  {key: 'amazon {{query}}', name: 'Amazon', url: 'http://www.amazon.com/s/ref=nb_sb_noss?field-keywords={{query}}&url=search-alias%3Daps&tag=moxt-20', enabled: true},
  {key: 'image {{query}}', name: 'Google Images', url: 'http://www.google.com/images?q={{query}}', enabled: true},
  {key: 'gmail {{query}}', name: 'GMail', url: 'https://mail.google.com/mail/?shva=1#search/{{query}}', enabled: true},
  {key: 'map {{where}}', name: 'Google Maps', url: 'http://maps.google.com/maps?q={{where}}', enabled: true},
  {key: 'imdb {{query}}', name: 'IMDb', url: 'http://www.imdb.com/find?s=all&q={{query}}', enabled: true},
  {key: 'youtube {{query}}', name: 'YouTube', url: 'http://www.youtube.com/results?search_query={{query}}', enabled: true},
  {key: 'fb {{query}}', name: 'FaceBook', url: 'https://www.facebook.com/search.php?q={{query}}', enabled: true},
  {key: 'r {{query}}', name: 'reddit', url: 'http://www.reddit.com/search?q={{query}}', enabled: true}
]


class Store {

  // Initialize the store with example rules on first run
  addPresets() {
    for (let preset of presets) {
      console.log(`Adding preset rule ${preset.key}`)
      this.create(preset)
    }
  }

  // Get the stored data for a rule
  get(id) {
    console.log('Getting rule')
    let jsonString = safari.extension.settings.getItem('rule_' + id)
    if (jsonString) {
      let data = JSON.parse(jsonString)
      return data
    }
  }

  // Set the stored data for a new rule
  create(data) {
    console.log('Creating rule')
    data.created = Date.now()
    data.updated = data.created
    data.id = data.created + '_' + uuid.v4()
    let jsonString = JSON.stringify(data)
    safari.extension.settings.setItem('rule_' + data.id, jsonString)
    return this.get(data.id)
  }

  // Update stored data for an existing rule
  update(data) {
    console.log('Updating rule')
    data.updated = Date.now()
    let jsonString = JSON.stringify(data)
    safari.extension.settings.setItem('rule_' + data.id, jsonString)
    return this.get(data.id)
  }

  // Remove stored data for a rule
  delete(id) {
    console.log('Deleting rule')
    safari.extension.settings.removeItem('rule_' + id)
    return id
  }

  all() {
    console.log('Getting all rules')
    return Array.from(this)
  }

  // Iterator for rule data
  [Symbol.iterator]() {
    let i = 0
    let ids = null
    return {
      next: () => {
        if (ids === null) {
          ids = []
          for (let id in safari.extension.settings) {
            if (id.substr(0, 5) == 'rule_') {
              ids.push(id.substr(5))
            }
          }
          ids.sort().reverse()
        }
        if (i >= ids.length) {
          return {done: true}
        } else {
          return {done: false, value: this.get(ids[i++])}
        }
      }
    }
  }

  // Upgrade data store from old versions of KeySearch
  upgrade() {
    for (let id in safari.extension.settings) {
      if (id.substr(0, 2) == '__') {
        let jsonString = safari.extension.settings.getItem(id)
        if (jsonString) {
          let data = JSON.parse(jsonString)
          data.key = data.keyword + ' {{query}}'
          data.url = data.url.replace('@@@', '{{query}}')
          delete data.keyword
          this.create(data)
          safari.extension.settings.removeItem(id)
        }
      }
    }
  }
}

export default new Store()
