(function () {
  'use strict';

  // Update the price range label on the results page
  const priceRange = document.getElementById('priceRange');
  const priceLabel = document.getElementById('priceRangeValue');
  if (priceRange && priceLabel) {
    const format = value => Number(value).toLocaleString('uk-UA').replace(/,/g, ' ');
    const update = () => {
      priceLabel.textContent = '15 000 — ' + format(priceRange.value) + ' грн';
    };
    priceRange.addEventListener('input', update);
    update();
  }

  // Reset all filters to the values from the design
  const resetFilters = document.getElementById('resetFilters');
  if (resetFilters) {
    resetFilters.addEventListener('click', function () {
      const form = document.getElementById('filtersForm');
      if (!form) return;
      form.reset();
      if (priceRange) {
        priceRange.value = priceRange.max;
        priceRange.dispatchEvent(new Event('input'));
      }
    });
  }

  // Passport validation on the booking page
  const bookingForm = document.getElementById('bookingForm');
  const passport = document.getElementById('passport1');
  const passportField = document.getElementById('passport1Field');
  const passportError = document.getElementById('passport1Error');

  function validatePassport(showError) {
    if (!passport || !passportField) return true;
    const valid = passport.value.trim().length === 8;
    if (valid) {
      passportField.classList.remove('is-invalid');
      if (passportError) passportError.hidden = true;
    } else if (showError) {
      passportField.classList.add('is-invalid');
      if (passportError) passportError.hidden = false;
    }
    return valid;
  }

  if (passport) {
    passport.addEventListener('input', function () {
      if (passport.value.trim().length === 8) validatePassport(false);
    });
  }

  if (bookingForm) {
    bookingForm.addEventListener('submit', function (event) {
      if (!validatePassport(true)) {
        event.preventDefault();
        passport.focus();
      }
    });
  }

  // Keep the search action predictable: blank values are not sent
  const searchForm = document.querySelector('.tg-searchbar');
  if (searchForm) {
    searchForm.addEventListener('submit', function () {
      searchForm.querySelectorAll('.tg-field-control').forEach(function (control) {
        if (!control.value.trim()) control.disabled = true;
      });
    });
  }
})();
document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.querySelector('.tg-searchbar');
  if (!searchForm) return;

  // --- 1. Переключение чипов (Туди-назад / Багаж) ---
  let tripType = 'roundtrip'; // 'roundtrip' | 'oneway'

  document.querySelectorAll('[data-chip-group]').forEach((group) => {
    const groupName = group.dataset.chipGroup;
    const textSpan = group.querySelector('.tg-chip-text');
    const items = group.querySelectorAll('.dropdown-item');

    items.forEach((item) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        items.forEach((el) => el.classList.remove('active'));
        item.classList.add('active');

        const label = item.textContent.trim();
        const val = item.dataset.value || label;
        textSpan.textContent = label;

        if (groupName === 'trip') {
          tripType = val;
          const hiddenTrip = searchForm.querySelector('input[name="trip_type"]');
          if (hiddenTrip) hiddenTrip.value = val;

          if (tripType === 'oneway') {
            endDate = null;
          } else if (startDate && !endDate) {
            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 7);
          }
          updateDatesInput();
          renderCalendar();
        }

        if (groupName === 'baggage') {
          const hiddenBag = searchForm.querySelector('input[name="baggage"]');
          if (hiddenBag) hiddenBag.value = val;
        }
      });
    });
  });

  // --- 2. Выпадающие списки стран (Звідки / Куди) и 3-буквенный код аэропорта ---
  const locationStates = {
    from: { country: 'Україна', city: 'Київ', airport: 'IEV' },
    to: { country: 'Туреччина', city: '', airport: 'AYT' }
  };

  const airportsFromCheckbox = document.querySelector('input[name="airports_from"]');
  const airportsToCheckbox = document.querySelector('input[name="airports_to"]');

  function updateLocationDisplay(fieldKey) {
    const fieldWrapper = document.querySelector(`[data-location-field="${fieldKey}"]`);
    if (!fieldWrapper) return;
    const input = fieldWrapper.querySelector('input[type="text"]');
    const state = locationStates[fieldKey];
    const includeAirports = fieldKey === 'from'
        ? airportsFromCheckbox?.checked
        : airportsToCheckbox?.checked;

    if (includeAirports && state.airport) {
      input.value = `${state.country} (${state.airport})`;
    } else {
      input.value = state.city ? `${state.country} (${state.city})` : state.country;
    }
  }

  document.querySelectorAll('[data-location-field]').forEach((field) => {
    const key = field.dataset.locationField;
    const items = field.querySelectorAll('.tg-location-item');

    field.addEventListener('click', (e) => {
      e.stopPropagation();
      const wasOpen = field.classList.contains('is-open');
      closeAllPopovers();
      if (!wasOpen) field.classList.add('is-open');
    });

    items.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        items.forEach((el) => el.classList.remove('active'));
        btn.classList.add('active');

        locationStates[key] = {
          country: btn.dataset.country || '',
          city: btn.dataset.city || '',
          airport: btn.dataset.airport || ''
        };
        updateLocationDisplay(key);
        field.classList.remove('is-open');
      });
    });
  });

  if (airportsFromCheckbox) {
    airportsFromCheckbox.addEventListener('change', () => updateLocationDisplay('from'));
  }
  if (airportsToCheckbox) {
    airportsToCheckbox.addEventListener('change', () => updateLocationDisplay('to'));
  }

  // --- Стилизованный список для поля "Кількість осіб" ---
  const travelersField = document.querySelector('[data-travelers-field]');
  if (travelersField) {
    const travelersInput = travelersField.querySelector('input[name="travelers"]');
    const travelerItems = travelersField.querySelectorAll('.tg-location-item');

    travelersField.addEventListener('click', (e) => {
      e.stopPropagation();
      const wasOpen = travelersField.classList.contains('is-open');
      closeAllPopovers();
      if (!wasOpen) travelersField.classList.add('is-open');
    });

    travelerItems.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        travelerItems.forEach((el) => el.classList.remove('active'));
        btn.classList.add('active');
        travelersInput.value = btn.dataset.value || btn.textContent.trim();
        travelersField.classList.remove('is-open');
      });
    });
  }



  if (airportsFromCheckbox) {
    airportsFromCheckbox.addEventListener('change', () => updateLocationDisplay('from'));
  }
  if (airportsToCheckbox) {
    airportsToCheckbox.addEventListener('change', () => updateLocationDisplay('to'));
  }

  // --- 3. Календарь выбора дат ---
  const calendarField = document.querySelector('[data-calendar-field]');
  const calendarPopover = document.getElementById('tgCalendarPopover');
  const datesInput = calendarField?.querySelector('input[name="dates"]');
  const dateStartHidden = calendarField?.querySelector('input[name="date_start"]');
  const dateEndHidden = calendarField?.querySelector('input[name="date_end"]');

  const monthsGenitive = [
    'січня', 'лютого', 'березня', 'квітня', 'травня', 'червня',
    'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'
  ];
  const monthsNominative = [
    'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
    'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
  ];
  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

  let startDate = new Date(2026, 6, 12); // 12 липня 2026
  let endDate = new Date(2026, 6, 19);   // 19 липня 2026
  let viewYear = 2026;
  let viewMonth = 6;

  function toISODate(d) {
    if (!d) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function isSameDay(a, b) {
    return a && b &&
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();
  }

  function pluralNights(n) {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return `${n} ніч`;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${n} ночі`;
    return `${n} ночей`;
  }

  function updateDatesInput() {
    if (!datesInput || !startDate) return;
    dateStartHidden.value = toISODate(startDate);

    if (tripType === 'oneway' || !endDate) {
      dateEndHidden.value = '';
      datesInput.value = `${startDate.getDate()} ${monthsGenitive[startDate.getMonth()]} · в один бік`;
      return;
    }

    dateEndHidden.value = toISODate(endDate);
    const diffMs = endDate - startDate;
    const nights = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));

    if (startDate.getMonth() === endDate.getMonth()) {
      datesInput.value = `${startDate.getDate()}–${endDate.getDate()} ${monthsGenitive[endDate.getMonth()]} · ${pluralNights(nights)}`;
    } else {
      datesInput.value = `${startDate.getDate()} ${monthsGenitive[startDate.getMonth()]} – ${endDate.getDate()} ${monthsGenitive[endDate.getMonth()]} · ${pluralNights(nights)}`;
    }
  }

  function renderCalendar() {
    if (!calendarPopover) return;
    const firstDay = new Date(viewYear, viewMonth, 1);
    const startOffset = (firstDay.getDay() + 6) % 7; // Пн = 0
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    let html = `
      <div class="tg-cal-header">
        <button type="button" class="tg-cal-nav" data-cal-prev aria-label="Попередній місяць"><i class="bi bi-chevron-left"></i></button>
        <span class="tg-cal-title">${monthsNominative[viewMonth]} ${viewYear}</span>
        <button type="button" class="tg-cal-nav" data-cal-next aria-label="Наступний місяць"><i class="bi bi-chevron-right"></i></button>
      </div>
      <div class="tg-cal-weekdays">
        ${weekDays.map((d) => `<span>${d}</span>`).join('')}
      </div>
      <div class="tg-cal-days">
    `;

    for (let i = 0; i < startOffset; i++) {
      html += `<span></span>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const current = new Date(viewYear, viewMonth, day);
      const isStart = isSameDay(current, startDate);
      const isEnd = tripType === 'roundtrip' && isSameDay(current, endDate);
      const inRange = tripType === 'roundtrip' && startDate && endDate && current > startDate && current < endDate;

      const classes = ['tg-cal-day'];
      if (isStart) classes.push('is-start');
      if (isEnd) classes.push('is-end');
      if (inRange) classes.push('in-range');

      html += `<button type="button" class="${classes.join(' ')}" data-day="${day}">${day}</button>`;
    }

    const hintText = tripType === 'oneway'
        ? 'Оберіть дату вильоту'
        : (!endDate ? 'Оберіть дату повернення' : 'Оберіть дату вильоту та повернення');

    html += `</div><div class="tg-cal-hint">${hintText}</div>`;
    calendarPopover.innerHTML = html;

    calendarPopover.querySelector('[data-cal-prev]').addEventListener('click', (e) => {
      e.stopPropagation();
      viewMonth--;
      if (viewMonth < 0) {
        viewMonth = 11;
        viewYear--;
      }
      renderCalendar();
    });

    calendarPopover.querySelector('[data-cal-next]').addEventListener('click', (e) => {
      e.stopPropagation();
      viewMonth++;
      if (viewMonth > 11) {
        viewMonth = 0;
        viewYear++;
      }
      renderCalendar();
    });

    calendarPopover.querySelectorAll('.tg-cal-day').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const clickedDate = new Date(viewYear, viewMonth, Number(btn.dataset.day));

        if (tripType === 'oneway') {
          startDate = clickedDate;
          endDate = null;
          updateDatesInput();
          renderCalendar();
          calendarField.classList.remove('is-open');
          return;
        }

        if (!startDate || (startDate && endDate) || clickedDate <= startDate) {
          startDate = clickedDate;
          endDate = null;
        } else {
          endDate = clickedDate;
          calendarField.classList.remove('is-open');
        }
        updateDatesInput();
        renderCalendar();
      });
    });
  }

  if (calendarField) {
    calendarField.addEventListener('click', (e) => {
      e.stopPropagation();
      const wasOpen = calendarField.classList.contains('is-open');
      closeAllPopovers();
      if (!wasOpen) {
        renderCalendar();
        calendarField.classList.add('is-open');
      }
    });

    calendarPopover.addEventListener('click', (e) => e.stopPropagation());
  }

  function closeAllPopovers() {
    document.querySelectorAll('.tg-dropdown-field.is-open').forEach((el) => {
      el.classList.remove('is-open');
    });
  }

  document.addEventListener('click', closeAllPopovers);

  // Инициализация начальных значений
  updateLocationDisplay('from');
  updateLocationDisplay('to');
  updateDatesInput();
  renderCalendar();
});