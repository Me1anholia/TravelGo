(function () {
    'use strict';

    // Comprehensive validation & input masks on the booking page
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        const cardNumberInput = document.getElementById('cardNumber');
        const cardHolderInput = document.getElementById('cardHolder');
        const cardExpiryInput = document.getElementById('cardExpiry');
        const cardCvvInput = document.getElementById('cardCvv');
        const cardSystemLabel = document.getElementById('cardSystemLabel');
        const cardPaymentError = document.getElementById('cardPaymentError');

        const birth2Input = document.getElementById('birth2');
        const passport1Input = document.getElementById('passport1');
        const passport2Input = document.getElementById('passport2');

        // Форматирование номера паспорта (убираем лишнее, верхний регистр)
        [passport1Input, passport2Input].forEach((inp) => {
            if (!inp) return;
            inp.addEventListener('input', () => {
                inp.value = inp.value.replace(/[^a-zA-Zа-яА-ЯіІїЇєЄ0-9]/g, '').toUpperCase().slice(0, 8);
            });
        });

        // Форматирование даты рождения ДД.ММ.РРРР
        if (birth2Input) {
            birth2Input.addEventListener('input', () => {
                const digits = birth2Input.value.replace(/\D/g, '').slice(0, 8);
                let formatted = digits;
                if (digits.length > 4) {
                    formatted = `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
                } else if (digits.length > 2) {
                    formatted = `${digits.slice(0, 2)}.${digits.slice(2)}`;
                }
                birth2Input.value = formatted;
            });
        }

        // Форматирование номера карты (XXXX XXXX XXXX XXXX) и определение системы
        if (cardNumberInput) {
            cardNumberInput.addEventListener('input', () => {
                const digits = cardNumberInput.value.replace(/\D/g, '').slice(0, 16);
                cardNumberInput.value = digits.replace(/(\d{4})(?=\d)/g, '$1 ');

                if (cardSystemLabel) {
                    if (digits.startsWith('4')) cardSystemLabel.textContent = 'VISA';
                    else if (/^5[1-5]|^2[2-7]/.test(digits)) cardSystemLabel.textContent = 'MASTERCARD';
                    else cardSystemLabel.textContent = 'VISA / MC';
                }
            });
        }

        // Только латиница для владельца карты
        if (cardHolderInput) {
            cardHolderInput.addEventListener('input', () => {
                cardHolderInput.value = cardHolderInput.value.replace(/[^a-zA-Z\s'-]/g, '').toUpperCase();
            });
        }

        // Форматирование срока действия MM/РР
        if (cardExpiryInput) {
            cardExpiryInput.addEventListener('input', () => {
                const digits = cardExpiryInput.value.replace(/\D/g, '').slice(0, 4);
                cardExpiryInput.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
            });
        }

        // Только 3 цифры для CVV
        if (cardCvvInput) {
            cardCvvInput.addEventListener('input', () => {
                cardCvvInput.value = cardCvvInput.value.replace(/\D/g, '').slice(0, 3);
            });
        }

        const touristRules = [
            {
                inputId: 'fullname1',
                fieldId: 'fullname1Field',
                errorId: 'fullname1Error',
                validate: (v) => v.trim().split(/\s+/).length >= 2 && v.trim().length >= 5
            },
            {
                inputId: 'passport1',
                fieldId: 'passport1Field',
                errorId: 'passport1Error',
                validate: (v) => /^[A-ZА-ЯІЇЄ]{2}\d{6}$/.test(v.trim())
            },
            {
                inputId: 'phone1',
                fieldId: 'phone1Field',
                errorId: 'phone1Error',
                validate: (v) => v.replace(/\D/g, '').length >= 10
            },
            {
                inputId: 'email1',
                fieldId: 'email1Field',
                errorId: 'email1Error',
                validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
            },
            {
                inputId: 'fullname2',
                fieldId: 'fullname2Field',
                errorId: 'fullname2Error',
                validate: (v) => v.trim().split(/\s+/).length >= 2 && v.trim().length >= 5
            },
            {
                inputId: 'passport2',
                fieldId: 'passport2Field',
                errorId: 'passport2Error',
                validate: (v) => /^[A-ZА-ЯІЇЄ]{2}\d{6}$/.test(v.trim())
            },
            {
                inputId: 'birth2',
                fieldId: 'birth2Field',
                errorId: 'birth2Error',
                validate: (v) => {
                    const m = v.trim().match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
                    if (!m) return false;
                    const day = Number(m[1]);
                    const month = Number(m[2]);
                    const year = Number(m[3]);
                    return day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1920 && year <= 2026;
                }
            },
            {
                inputId: 'citizenship2',
                fieldId: 'citizenship2Field',
                errorId: 'citizenship2Error',
                validate: (v) => v.trim().length >= 3
            }
        ];

        function checkTouristRule(rule, showError) {
            const input = document.getElementById(rule.inputId);
            const field = document.getElementById(rule.fieldId);
            const error = document.getElementById(rule.errorId);
            if (!input || !field) return true;

            const isValid = rule.validate(input.value);
            if (isValid) {
                field.classList.remove('is-invalid');
                input.removeAttribute('aria-invalid');
                if (error) error.hidden = true;
            } else if (showError) {
                field.classList.add('is-invalid');
                input.setAttribute('aria-invalid', 'true');
                if (error) error.hidden = false;
            }
            return isValid;
        }

        touristRules.forEach((rule) => {
            const input = document.getElementById(rule.inputId);
            if (!input) return;
            input.addEventListener('blur', () => checkTouristRule(rule, true));
            input.addEventListener('input', () => {
                if (checkTouristRule(rule, false)) checkTouristRule(rule, true);
            });
        });

        const cardRules = [
            {
                input: cardNumberInput,
                validate: (v) => v.replace(/\D/g, '').length === 16
            },
            {
                input: cardHolderInput,
                validate: (v) => v.trim().split(/\s+/).length >= 2 && v.trim().length >= 4
            },
            {
                input: cardExpiryInput,
                validate: (v) => {
                    const m = v.trim().match(/^(\d{2})\/(\d{2})$/);
                    if (!m) return false;
                    const month = Number(m[1]);
                    const year = 2000 + Number(m[2]);
                    return month >= 1 && month <= 12 && year >= 2026;
                }
            },
            {
                input: cardCvvInput,
                validate: (v) => /^\d{3}$/.test(v.trim())
            }
        ];

        function validateCardFields(showError) {
            let allCardValid = true;
            cardRules.forEach((rule) => {
                if (!rule.input) return;
                const ok = rule.validate(rule.input.value);
                if (ok) {
                    rule.input.classList.remove('is-invalid');
                } else {
                    allCardValid = false;
                    if (showError) rule.input.classList.add('is-invalid');
                }
            });

            if (cardPaymentError) {
                cardPaymentError.hidden = allCardValid || !showError;
            }
            return allCardValid;
        }

        cardRules.forEach((rule) => {
            if (!rule.input) return;
            rule.input.addEventListener('blur', () => validateCardFields(true));
            rule.input.addEventListener('input', () => {
                if (rule.validate(rule.input.value)) {
                    rule.input.classList.remove('is-invalid');
                }
                if (validateCardFields(false) && cardPaymentError) {
                    cardPaymentError.hidden = true;
                }
            });
        });

        bookingForm.addEventListener('submit', function (event) {
            let firstInvalid = null;

            touristRules.forEach((rule) => {
                if (!checkTouristRule(rule, true) && !firstInvalid) {
                    firstInvalid = document.getElementById(rule.inputId);
                }
            });

            if (!validateCardFields(true) && !firstInvalid) {
                firstInvalid = cardRules.find((r) => r.input && r.input.classList.contains('is-invalid'))?.input;
            }

            if (firstInvalid) {
                event.preventDefault();
                firstInvalid.focus();
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
    // =========================================================
    // БЛОК 1: Поисковая форма на главной странице (index.html)
    // =========================================================
    const searchForm = document.querySelector('.tg-searchbar');
    if (searchForm) {
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

        const locationStates = {
            from: {country: 'Україна', city: 'Київ', airport: 'IEV'},
            to: {country: 'Туреччина', city: '', airport: 'AYT'}
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

        let startDate = new Date(2026, 6, 12);
        let endDate = new Date(2026, 6, 19);
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
            const startOffset = (firstDay.getDay() + 6) % 7;
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

        updateLocationDisplay('from');
        updateLocationDisplay('to');
        updateDatesInput();
        renderCalendar();
    }

    // =========================================================
    // БЛОК 2: Фильтры и сортировка на странице результатов (results.html)
    // =========================================================
    const toursGrid = document.getElementById('toursGrid') || document.querySelector('.tours-grid');
    if (toursGrid) {
        const minInput = document.getElementById('priceRangeMin');
        const maxInput = document.getElementById('priceRangeMax');
        const rangeFill = document.getElementById('priceRangeFill');
        const rangeValueLabel = document.getElementById('priceRangeValue');
        const sortSelect = document.getElementById('toursSort') || document.querySelector('.tg-select');
        const resetBtn = document.getElementById('resetFilters');
        const filtersForm = document.getElementById('filtersForm');
        const summaryEl = document.getElementById('resultsSummary');

        const cards = Array.from(toursGrid.querySelectorAll('.tour-card'));
        const minGap = 1000;

        // Автоматически считываем цену и рейтинг из текста карточки, если data-атрибутов нет
        cards.forEach((card, index) => {
            if (!card.dataset.price) {
                const priceText = card.querySelector('.tour-price')?.textContent || '0';
                card.dataset.price = priceText.replace(/\D/g, '');
            }
            if (!card.dataset.rating) {
                const ratingText = card.querySelector('.rating-badge')?.textContent || '0';
                card.dataset.rating = ratingText.replace(/[^\d.]/g, '');
            }
            if (!card.dataset.popular) {
                card.dataset.popular = String(index + 1);
            }
        });

        function formatPrice(val) {
            return Number(val).toLocaleString('uk-UA').replace(/,/g, ' ');
        }

        function getCheckedValues(name) {
            if (!filtersForm) return [];
            return Array.from(filtersForm.querySelectorAll(`input[name="${name}"]:checked`)).map((cb) => cb.value);
        }

        function applyAllFilters() {
            const minVal = minInput ? Number(minInput.value) : 0;
            const maxVal = maxInput ? Number(maxInput.value) : Infinity;

            const selectedStars = getCheckedValues('stars');
            const selectedMeals = getCheckedValues('meal');
            const selectedDistances = getCheckedValues('distance').map(Number);
            const selectedDurations = getCheckedValues('duration');

            let visibleCount = 0;

            cards.forEach((card) => {
                const price = Number(card.dataset.price || 0);
                const stars = card.dataset.stars || '';
                const meal = card.dataset.meal || '';
                const distance = Number(card.dataset.distance || 0);
                const duration = card.dataset.duration || '';

                const matchPrice = price >= minVal && price <= maxVal;
                const matchStars = selectedStars.length === 0 || selectedStars.includes(stars);
                const matchMeal = selectedMeals.length === 0 || selectedMeals.includes(meal);
                const matchDistance = selectedDistances.length === 0 || selectedDistances.some((maxDist) => distance <= maxDist);
                const matchDuration = selectedDurations.length === 0 || selectedDurations.includes(duration);

                const isVisible = matchPrice && matchStars && matchMeal && matchDistance && matchDuration;
                card.style.display = isVisible ? '' : 'none';
                if (isVisible) visibleCount++;
            });

            if (summaryEl) {
                summaryEl.textContent = `Знайдено ${visibleCount} турів · 12–19 липня · 2 дорослих · 7 ночей`;
            }
        }

        function updatePriceSlider(e) {
            if (!minInput || !maxInput) return;

            let minVal = Number(minInput.value);
            let maxVal = Number(maxInput.value);

            if (maxVal - minVal < minGap) {
                if (e && e.target === minInput) {
                    minVal = maxVal - minGap;
                    minInput.value = minVal;
                } else {
                    maxVal = minVal + minGap;
                    maxInput.value = maxVal;
                }
            }

            minInput.style.zIndex = minVal > Number(maxInput.max) - minGap * 2 ? '5' : '3';

            const totalRange = Number(maxInput.max) - Number(minInput.min);
            const leftPercent = ((minVal - Number(minInput.min)) / totalRange) * 100;
            const rightPercent = ((maxVal - Number(minInput.min)) / totalRange) * 100;

            if (rangeFill) {
                rangeFill.style.left = `${leftPercent}%`;
                rangeFill.style.width = `${rightPercent - leftPercent}%`;
            }

            if (rangeValueLabel) {
                rangeValueLabel.textContent = `${formatPrice(minVal)} — ${formatPrice(maxVal)} грн`;
            }

            applyAllFilters();
        }

        function sortTours() {
            if (!sortSelect) return;
            const mode = sortSelect.value;

            const sorted = [...cards].sort((a, b) => {
                const priceA = Number(a.dataset.price || 0);
                const priceB = Number(b.dataset.price || 0);
                const ratingA = Number(a.dataset.rating || 0);
                const ratingB = Number(b.dataset.rating || 0);
                const popA = Number(a.dataset.popular || 999);
                const popB = Number(b.dataset.popular || 999);

                if (mode === 'price-asc') return priceA - priceB;
                if (mode === 'price-desc') return priceB - priceA;
                if (mode === 'rating') return ratingB - ratingA || priceA - priceB;
                if (mode === 'popular') return popA - popB;
                return 0;
            });

            sorted.forEach((card) => toursGrid.appendChild(card));
        }

        if (minInput && maxInput) {
            minInput.addEventListener('input', updatePriceSlider);
            maxInput.addEventListener('input', updatePriceSlider);
            updatePriceSlider();
        }

        if (filtersForm) {
            filtersForm.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
                cb.addEventListener('change', applyAllFilters);
            });
        }

        if (sortSelect) {
            sortSelect.addEventListener('change', sortTours);
            sortTours();
        }

        if (resetBtn && filtersForm) {
            resetBtn.addEventListener('click', () => {
                filtersForm.reset();
                if (minInput && maxInput) {
                    minInput.value = minInput.min;
                    maxInput.value = maxInput.max;
                    updatePriceSlider();
                } else {
                    applyAllFilters();
                }
            });
        }
    }
})
