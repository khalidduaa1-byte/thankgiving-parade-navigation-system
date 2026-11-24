// Places API (New). Existing inputs and manual address entry stay usable.
// No device-location permission is requested by this module.
(function () {
  'use strict';
  window.initAddressAutocomplete = async function (options = {}) {
    const fields = ['from', 'to', 'hereInput'].map(id => document.getElementById(id));
    const status = document.getElementById('addressStatus');
    const unavailable = 'Address suggestions unavailable. Check Places API (New), billing, and this website’s API-key restrictions. You can still enter a full address.';
    let places;
    try {
      places = await google.maps.importLibrary('places');
    } catch {
      status.textContent = unavailable;
      return;
    }
    fields.forEach(input => attach(input, places, status, unavailable, options[input.id] || {}));
    status.textContent = 'Type at least 2 characters for address suggestions.';
  };

  function attach(input, places, status, unavailable, options) {
    const popup = document.createElement('div');
    popup.className = 'address-popup';
    popup.hidden = true;
    const list = document.createElement('div');
    list.id = input.id + '-suggestions';
    list.setAttribute('role', 'listbox');
    list.setAttribute('aria-label', 'Address suggestions');
    const attribution = document.createElement('div');
    attribution.className = 'address-attribution';
    attribution.textContent = 'Google Maps';
    popup.append(list, attribution);
    // Body-level positioning avoids clipping by the scrolling Maps panel.
    document.body.appendChild(popup);
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-controls', list.id);
    input.setAttribute('aria-expanded', 'false');
    input.setAttribute('autocomplete', 'off');
    let timer, version = 0, active = -1, predictions = [], token;

    function hide() {
      popup.hidden = true;
      input.setAttribute('aria-expanded', 'false');
      input.removeAttribute('aria-activedescendant');
      active = -1;
    }
    function cancel() {
      clearTimeout(timer);
      version++;
      hide();
    }
    function position() {
      const r = input.getBoundingClientRect();
      const width = Math.max(0, Math.min(Math.max(r.width, 280), window.innerWidth - 16));
      popup.style.width = width + 'px';
      popup.style.left = Math.max(8, Math.min(r.left, window.innerWidth - width - 8)) + 'px';
      const below = window.innerHeight - r.bottom - 8;
      const above = r.top - 8;
      const up = below < 180 && above > below;
      popup.style.top = up ? 'auto' : (r.bottom + 4) + 'px';
      popup.style.bottom = up ? (window.innerHeight - r.top + 4) + 'px' : 'auto';
      popup.style.maxHeight = Math.max(0, Math.min(300, (up ? above : below) - 4)) + 'px';
    }
    function highlight(index) {
      active = index;
      Array.from(list.children).forEach((option, i) => option.setAttribute('aria-selected', String(i === active)));
      input.setAttribute('aria-activedescendant', list.children[active].id);
      list.children[active].scrollIntoView({block: 'nearest'});
    }
    async function choose(index) {
      const prediction = predictions[index];
      if (!prediction) return;
      cancel();
      if (prediction.gps) { token = undefined; options.onGPS(); return; }
      const requestVersion = version, query = input.value;
      // A new selection ends this query session, even if the details call fails.
      token = undefined;
      status.textContent = 'Loading selected address…';
      try {
        const place = prediction.toPlace();
        await place.fetchFields({fields: options.needsLocation ? ['formattedAddress', 'location'] : ['formattedAddress']});
        if (version !== requestVersion || input.value !== query || document.activeElement !== input) return;
        // Prediction text preserves the landmark name as well as the address.
        input.value = prediction.text.toString() || place.formattedAddress;
        if (!input.value) throw new Error('Missing address');
        input.dispatchEvent(new Event('input', {bubbles: true}));
        cancel(); // Do not reopen suggestions for our programmatic input event.
        status.textContent = 'Address selected. Use Plan or Set when ready.';
        if (options.onSelect) options.onSelect({text: input.value, location: place.location});
      } catch {
        if (version === requestVersion && document.activeElement === input) status.textContent = unavailable;
      }
    }
    async function search(query, requestVersion) {
      token ||= new places.AutocompleteSessionToken();
      try {
        const result = await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: query,
          sessionToken: token,
          includedRegionCodes: ['us'],
          locationBias: {south: 40.49, west: -74.27, north: 40.92, east: -73.68}
        });
        if (requestVersion !== version || input.value.trim() !== query || document.activeElement !== input) return;
        predictions = result.suggestions.map(s => s.placePrediction).filter(Boolean);
        list.replaceChildren();
        if (!predictions.length) {
          hide();
          status.textContent = 'No suggestions found. Try a street, station, or landmark with its borough.';
          return;
        }
        if (options.onGPS) predictions.unshift({gps: true, text: {toString: () => 'Use my current location (GPS)'}});
        predictions.forEach((prediction, index) => {
          const option = document.createElement('div');
          option.id = list.id + '-' + index;
          option.className = 'address-option';
          option.setAttribute('role', 'option');
          option.setAttribute('aria-selected', 'false');
          option.textContent = prediction.text.toString();
          // Keep input focus for combobox keyboard and touch interaction.
          option.addEventListener('pointerdown', event => event.preventDefault());
          option.addEventListener('click', () => choose(index));
          list.appendChild(option);
        });
        position();
        popup.hidden = false;
        input.setAttribute('aria-expanded', 'true');
        status.textContent = 'Suggestions available. Use arrow keys and Enter to select.';
      } catch {
        if (requestVersion !== version || document.activeElement !== input) return;
        hide();
        token = undefined;
        status.textContent = unavailable;
      }
    }
    input.addEventListener('input', event => {
      cancel();
      if (event.isComposing) return;
      const query = input.value.trim();
      if (query.length < 2) { token = undefined; return; }
      const requestVersion = version;
      timer = setTimeout(() => search(query, requestVersion), 250);
    });
    input.addEventListener('keydown', event => {
      if (popup.hidden) return;
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const next = active < 0 ? (event.key === 'ArrowDown' ? 0 : predictions.length - 1)
          : (active + (event.key === 'ArrowDown' ? 1 : -1) + predictions.length) % predictions.length;
        highlight(next);
      } else if (event.key === 'Enter' && active >= 0) {
        event.preventDefault();
        choose(active);
      } else if (event.key === 'Escape') {
        event.preventDefault();
        cancel();
      }
    });
    input.addEventListener('blur', () => { cancel(); token = undefined; });
    window.addEventListener('resize', () => { if (!popup.hidden) position(); });
    document.addEventListener('scroll', () => { if (!popup.hidden) position(); }, true);
  }
})();
