import { describe, it, expect, beforeEach, vi } from 'vitest';
import EasyEpoch from '../lib/index';
import { monthTracker, scrapeMonth, scrapeNextMonth, scrapePreviousMonth } from '../lib/date-util';

beforeEach(() => {
  // Clean up any previous picker DOM
  document.body.innerHTML = '';
  // Reset monthTracker between tests
  monthTracker.years = {};
  monthTracker.current = undefined;
});

describe('EasyEpoch constructor', () => {
  it('should create a picker on document.body when no args given', () => {
    const picker = new EasyEpoch();
    const wrapper = document.querySelector('.easyepoch-wrapper');
    expect(wrapper).not.toBeNull();
  });

  it('should create a picker on a CSS selector target', () => {
    const div = document.createElement('div');
    div.id = 'target';
    document.body.appendChild(div);

    const picker = new EasyEpoch('#target');
    const wrapper = div.querySelector('.easyepoch-wrapper');
    expect(wrapper).not.toBeNull();
  });

  it('should create a picker on an HTMLElement target', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);

    const picker = new EasyEpoch(div);
    const wrapper = div.querySelector('.easyepoch-wrapper');
    expect(wrapper).not.toBeNull();
  });

  it('should accept options as first argument', () => {
    const picker = new EasyEpoch({ zIndex: 999 });
    const wrapper = document.querySelector('.easyepoch-wrapper') as HTMLElement;
    expect(wrapper).not.toBeNull();
    expect(wrapper.style.zIndex).toBe('999');
  });

  it('should accept element and options together', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);

    const picker = new EasyEpoch(div, { zIndex: 50 });
    const wrapper = div.querySelector('.easyepoch-wrapper') as HTMLElement;
    expect(wrapper).not.toBeNull();
    expect(wrapper.style.zIndex).toBe('50');
  });

  it('should throw when an invalid selector is passed', () => {
    expect(() => new EasyEpoch('#nonexistent')).toThrow('Invalid selector passed to EasyEpoch!');
  });

  it('should set selectedDate to today by default', () => {
    const picker = new EasyEpoch();
    const now = new Date();
    expect(picker.selectedDate.getFullYear()).toBe(now.getFullYear());
    expect(picker.selectedDate.getMonth()).toBe(now.getMonth());
    expect(picker.selectedDate.getDate()).toBe(now.getDate());
  });

  it('should use selectedDate from options when provided', () => {
    const customDate = new Date(2023, 5, 15);
    const picker = new EasyEpoch({ selectedDate: customDate });
    expect(picker.selectedDate.getMonth()).toBe(5);
    expect(picker.selectedDate.getDate()).toBe(15);
  });
});

describe('EasyEpoch.open() and close()', () => {
  it('should add active class when opened', () => {
    const picker = new EasyEpoch();
    picker.open();
    const wrapper = document.querySelector('.easyepoch-wrapper');
    expect(wrapper!.classList.contains('active')).toBe(true);
  });

  it('should remove active class when closed', () => {
    const picker = new EasyEpoch();
    picker.open();
    picker.close();
    const wrapper = document.querySelector('.easyepoch-wrapper');
    expect(wrapper!.classList.contains('active')).toBe(false);
  });

  it('should not have active class before opening', () => {
    const picker = new EasyEpoch();
    const wrapper = document.querySelector('.easyepoch-wrapper');
    expect(wrapper!.classList.contains('active')).toBe(false);
  });
});

describe('EasyEpoch.on()', () => {
  it('should register a submit handler without error', () => {
    const picker = new EasyEpoch();
    expect(() => {
      picker.on('submit', () => {});
    }).not.toThrow();
  });

  it('should register a close handler without error', () => {
    const picker = new EasyEpoch();
    expect(() => {
      picker.on('close', () => {});
    }).not.toThrow();
  });

  it('should throw on invalid event name', () => {
    const picker = new EasyEpoch();
    expect(() => {
      (picker as any).on('invalid', () => {});
    }).toThrow('Not a valid event!');
  });

  it('should call submit handler when OK button is clicked', () => {
    const picker = new EasyEpoch();
    const handler = vi.fn();
    picker.on('submit', handler);
    picker.open();

    const okBtn = document.querySelector('.easyepoch-ok-btn') as HTMLElement;
    okBtn.click();

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(
      expect.any(Date),
      expect.any(String)
    );
  });

  it('should call close handler when Cancel button is clicked', () => {
    const picker = new EasyEpoch();
    const handler = vi.fn();
    picker.on('close', handler);
    picker.open();

    const cancelBtn = document.querySelector('.easyepoch-cancel-btn') as HTMLElement;
    cancelBtn.click();

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should allow multiple handlers for the same event', () => {
    const picker = new EasyEpoch();
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    picker.on('submit', handler1);
    picker.on('submit', handler2);
    picker.open();

    const okBtn = document.querySelector('.easyepoch-ok-btn') as HTMLElement;
    okBtn.click();

    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  it('should close the picker when OK is clicked', () => {
    const picker = new EasyEpoch();
    picker.on('submit', () => {});
    picker.open();

    const okBtn = document.querySelector('.easyepoch-ok-btn') as HTMLElement;
    okBtn.click();

    const wrapper = document.querySelector('.easyepoch-wrapper');
    expect(wrapper!.classList.contains('active')).toBe(false);
  });

  it('should close the picker when Cancel is clicked', () => {
    const picker = new EasyEpoch();
    picker.open();

    const cancelBtn = document.querySelector('.easyepoch-cancel-btn') as HTMLElement;
    cancelBtn.click();

    const wrapper = document.querySelector('.easyepoch-wrapper');
    expect(wrapper!.classList.contains('active')).toBe(false);
  });
});

describe('EasyEpoch.reset()', () => {
  it('should reset to today when called without arguments', () => {
    const picker = new EasyEpoch();
    picker.reset();
    const now = new Date();
    expect(picker.selectedDate.getDate()).toBe(now.getDate());
    expect(picker.selectedDate.getMonth()).toBe(now.getMonth());
  });

  it('should reset to a specific date when provided', () => {
    const picker = new EasyEpoch();
    const targetDate = new Date(2023, 8, 25); // Sep 25, 2023
    picker.reset(targetDate);
    expect(picker.selectedDate.getMonth()).toBe(8);
    expect(picker.selectedDate.getDate()).toBe(25);
  });

  it('should update the calendar display when reset', () => {
    const picker = new EasyEpoch();
    const targetDate = new Date(2024, 5, 15); // June 15, 2024
    picker.reset(targetDate);

    const monthAndYear = document.querySelector('.easyepoch-month-and-year');
    expect(monthAndYear!.innerHTML).toContain('June');
    expect(monthAndYear!.innerHTML).toContain('2024');
  });

  it('should update the time input value when reset', () => {
    const picker = new EasyEpoch();
    const targetDate = new Date(2024, 0, 1, 14, 30); // 2:30 PM
    picker.reset(targetDate);

    // The time input element gets the 24h value directly
    const timeInput = document.querySelector('.easyepoch-time-section input') as HTMLInputElement;
    expect(timeInput.value).toBe('14:30');
  });
});

describe('EasyEpoch.compactMode()', () => {
  it('should hide the date display when compact mode is enabled', () => {
    const picker = new EasyEpoch();
    picker.compactMode();
    const dateEl = document.querySelector('.easyepoch-date') as HTMLElement;
    expect(dateEl.style.display).toBe('none');
  });

  it('should be applied via constructor options', () => {
    const picker = new EasyEpoch({ compactMode: true });
    const dateEl = document.querySelector('.easyepoch-date') as HTMLElement;
    expect(dateEl.style.display).toBe('none');
  });
});

describe('EasyEpoch.disableTimeSection() / enableTimeSection()', () => {
  it('should hide the time icon when disabled', () => {
    const picker = new EasyEpoch();
    picker.disableTimeSection();
    const timeIcon = document.querySelector('.easyepoch-icon-time') as HTMLElement;
    expect(timeIcon.style.visibility).toBe('hidden');
  });

  it('should show the time icon when enabled', () => {
    const picker = new EasyEpoch();
    picker.disableTimeSection();
    picker.enableTimeSection();
    const timeIcon = document.querySelector('.easyepoch-icon-time') as HTMLElement;
    expect(timeIcon.style.visibility).toBe('visible');
  });

  it('should be applied via constructor options', () => {
    const picker = new EasyEpoch({ disableTimeSection: true });
    const timeIcon = document.querySelector('.easyepoch-icon-time') as HTMLElement;
    expect(timeIcon.style.visibility).toBe('hidden');
  });
});

describe('EasyEpoch calendar rendering', () => {
  it('should render calendar cells with day numbers', () => {
    const picker = new EasyEpoch();
    const tds = document.querySelectorAll('.easyepoch-calender tbody td');
    const filledCells = Array.from(tds).filter(td => td.innerHTML.trim() !== '');
    // A month has at least 28 days
    expect(filledCells.length).toBeGreaterThanOrEqual(28);
    expect(filledCells.length).toBeLessThanOrEqual(31);
  });

  it('should mark the selected date as active', () => {
    const picker = new EasyEpoch();
    const activeTd = document.querySelector('.easyepoch-calender tbody td.active');
    expect(activeTd).not.toBeNull();
  });

  it('should display the correct month and year in the header', () => {
    const picker = new EasyEpoch();
    const now = new Date();
    const expectedMonth = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ][now.getMonth()];

    const header = document.querySelector('.easyepoch-month-and-year');
    expect(header!.innerHTML).toContain(expectedMonth);
    expect(header!.innerHTML).toContain(now.getFullYear().toString());
  });
});

describe('EasyEpoch date selection', () => {
  it('should update selectedDate when a calendar cell is clicked', () => {
    const picker = new EasyEpoch();
    const tds = document.querySelectorAll('.easyepoch-calender tbody td');
    // Find a non-empty td that is not active
    let targetTd: HTMLElement | null = null;
    tds.forEach(td => {
      if (td.innerHTML.trim() !== '' && !td.classList.contains('active') && td.getAttribute('data-empty') === null) {
        targetTd = td as HTMLElement;
      }
    });

    if (targetTd) {
      const clickedDay = parseInt((targetTd as HTMLElement).innerHTML.trim());
      (targetTd as HTMLElement).click();
      expect(picker.selectedDate.getDate()).toBe(clickedDay);
    }
  });

  it('should move active class to the clicked cell', () => {
    const picker = new EasyEpoch();
    const tds = document.querySelectorAll('.easyepoch-calender tbody td');
    let targetTd: HTMLElement | null = null;
    tds.forEach(td => {
      if (td.innerHTML.trim() !== '' && !td.classList.contains('active') && td.getAttribute('data-empty') === null) {
        targetTd = td as HTMLElement;
      }
    });

    if (targetTd) {
      (targetTd as HTMLElement).click();
      expect((targetTd as HTMLElement).classList.contains('active')).toBe(true);
      // There should only be one active td
      const activeTds = document.querySelectorAll('.easyepoch-calender tbody td.active');
      expect(activeTds).toHaveLength(1);
    }
  });
});

describe('EasyEpoch month navigation', () => {
  it('should navigate to next month when next button is clicked', () => {
    const picker = new EasyEpoch();
    const now = new Date();
    const expectedNextMonth = (now.getMonth() + 1) % 12;
    const expectedMonthName = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ][expectedNextMonth];

    // The next button is inside the simpilepicker-date-picker, we need to click it directly
    const nextBtn = document.querySelector('.easyepoch-icon-next') as HTMLElement;
    nextBtn.click();

    const selectedDate = document.querySelector('.easyepoch-selected-date');
    expect(selectedDate!.innerHTML).toContain(expectedMonthName);
  });

  it('should navigate to previous month when previous button is clicked', () => {
    const picker = new EasyEpoch();
    const now = new Date();
    const expectedPrevMonth = (now.getMonth() + 11) % 12;
    const expectedMonthName = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ][expectedPrevMonth];

    const prevBtn = document.querySelector('.easyepoch-icon-previous') as HTMLElement;
    prevBtn.click();

    const selectedDate = document.querySelector('.easyepoch-selected-date');
    expect(selectedDate!.innerHTML).toContain(expectedMonthName);
  });
});

describe('EasyEpoch zIndex option', () => {
  it('should set z-index on the wrapper when provided', () => {
    const picker = new EasyEpoch({ zIndex: 1000 });
    const wrapper = document.querySelector('.easyepoch-wrapper') as HTMLElement;
    expect(wrapper.style.zIndex).toBe('1000');
  });

  it('should not set z-index when not provided', () => {
    const picker = new EasyEpoch();
    const wrapper = document.querySelector('.easyepoch-wrapper') as HTMLElement;
    expect(wrapper.style.zIndex).toBe('');
  });
});

describe('EasyEpoch multiple instances', () => {
  it('should allow creating multiple pickers on different elements', () => {
    const div1 = document.createElement('div');
    div1.className = 'picker-1';
    document.body.appendChild(div1);

    const div2 = document.createElement('div');
    div2.className = 'picker-2';
    document.body.appendChild(div2);

    const picker1 = new EasyEpoch('.picker-1');
    const picker2 = new EasyEpoch('.picker-2');

    const wrappers = document.querySelectorAll('.easyepoch-wrapper');
    expect(wrappers.length).toBe(2);
  });

  it('should open/close independently', () => {
    const div1 = document.createElement('div');
    div1.className = 'picker-1';
    document.body.appendChild(div1);

    const div2 = document.createElement('div');
    div2.className = 'picker-2';
    document.body.appendChild(div2);

    const picker1 = new EasyEpoch('.picker-1');
    const picker2 = new EasyEpoch('.picker-2');

    picker1.open();
    expect(div1.querySelector('.easyepoch-wrapper')!.classList.contains('active')).toBe(true);
    expect(div2.querySelector('.easyepoch-wrapper')!.classList.contains('active')).toBe(false);

    picker2.open();
    expect(div1.querySelector('.easyepoch-wrapper')!.classList.contains('active')).toBe(true);
    expect(div2.querySelector('.easyepoch-wrapper')!.classList.contains('active')).toBe(true);

    picker1.close();
    expect(div1.querySelector('.easyepoch-wrapper')!.classList.contains('active')).toBe(false);
    expect(div2.querySelector('.easyepoch-wrapper')!.classList.contains('active')).toBe(true);
  });
});

describe('EasyEpoch public properties', () => {
  it('should expose selectedDate as a Date object', () => {
    const picker = new EasyEpoch();
    expect(picker.selectedDate).toBeInstanceOf(Date);
  });

  it('should expose _eventHandlers object', () => {
    const picker = new EasyEpoch();
    expect(typeof picker._eventHandlers).toBe('object');
  });

  it('should expose _validOnListeners', () => {
    const picker = new EasyEpoch();
    expect(picker._validOnListeners).toContain('submit');
    expect(picker._validOnListeners).toContain('close');
  });
});

describe('EasyEpoch theming', () => {
  it('should use dark theme by default (no theme class)', () => {
    const picker = new EasyEpoch();
    const wrapper = document.querySelector('.easyepoch-wrapper') as HTMLElement;
    expect(wrapper.classList.contains('easyepoch-theme-light')).toBe(false);
    expect(wrapper.classList.contains('easyepoch-theme-dark')).toBe(false);
  });

  it('should apply light theme via constructor option', () => {
    const picker = new EasyEpoch({ theme: 'light' });
    const wrapper = document.querySelector('.easyepoch-wrapper') as HTMLElement;
    expect(wrapper.classList.contains('easyepoch-theme-light')).toBe(true);
  });

  it('should apply dark theme via constructor option', () => {
    const picker = new EasyEpoch({ theme: 'dark' });
    const wrapper = document.querySelector('.easyepoch-wrapper') as HTMLElement;
    expect(wrapper.classList.contains('easyepoch-theme-dark')).toBe(true);
  });

  it('should apply custom theme object via constructor option', () => {
    const picker = new EasyEpoch({ theme: { bg: '#ff0000', text: '#00ff00' } });
    const wrapper = document.querySelector('.easyepoch-wrapper') as HTMLElement;
    expect(wrapper.style.getPropertyValue('--easyepoch-bg')).toBe('#ff0000');
    expect(wrapper.style.getPropertyValue('--easyepoch-text')).toBe('#00ff00');
  });

  it('should switch from dark to light theme at runtime with setTheme()', () => {
    const picker = new EasyEpoch();
    const wrapper = document.querySelector('.easyepoch-wrapper') as HTMLElement;
    picker.setTheme('light');
    expect(wrapper.classList.contains('easyepoch-theme-light')).toBe(true);
  });

  it('should switch from light to dark theme at runtime with setTheme()', () => {
    const picker = new EasyEpoch({ theme: 'light' });
    const wrapper = document.querySelector('.easyepoch-wrapper') as HTMLElement;
    expect(wrapper.classList.contains('easyepoch-theme-light')).toBe(true);
    picker.setTheme('dark');
    expect(wrapper.classList.contains('easyepoch-theme-light')).toBe(false);
    expect(wrapper.classList.contains('easyepoch-theme-dark')).toBe(true);
  });

  it('should apply custom theme object at runtime with setTheme()', () => {
    const picker = new EasyEpoch();
    const wrapper = document.querySelector('.easyepoch-wrapper') as HTMLElement;
    picker.setTheme({ primary: '#ff6b6b', accent: '#ffd93d' });
    expect(wrapper.style.getPropertyValue('--easyepoch-primary')).toBe('#ff6b6b');
    expect(wrapper.style.getPropertyValue('--easyepoch-accent')).toBe('#ffd93d');
  });

  it('should clean up custom properties when switching from custom to built-in theme', () => {
    const picker = new EasyEpoch();
    const wrapper = document.querySelector('.easyepoch-wrapper') as HTMLElement;
    picker.setTheme({ primary: '#ff6b6b' });
    expect(wrapper.style.getPropertyValue('--easyepoch-primary')).toBe('#ff6b6b');

    picker.setTheme('light');
    expect(wrapper.style.getPropertyValue('--easyepoch-primary')).toBe('');
    expect(wrapper.classList.contains('easyepoch-theme-light')).toBe(true);
  });

  it('should accept custom properties with -- prefix', () => {
    const picker = new EasyEpoch();
    const wrapper = document.querySelector('.easyepoch-wrapper') as HTMLElement;
    picker.setTheme({ '--easyepoch-bg': '#123456' });
    expect(wrapper.style.getPropertyValue('--easyepoch-bg')).toBe('#123456');
  });

  it('should remove previous theme class when switching themes', () => {
    const picker = new EasyEpoch({ theme: 'light' });
    const wrapper = document.querySelector('.easyepoch-wrapper') as HTMLElement;
    expect(wrapper.classList.contains('easyepoch-theme-light')).toBe(true);

    picker.setTheme('dark');
    expect(wrapper.classList.contains('easyepoch-theme-light')).toBe(false);
    expect(wrapper.classList.contains('easyepoch-theme-dark')).toBe(true);
  });
});

describe('EasyEpoch inline SVG icons', () => {
  it('should render SVG elements inside icon buttons', () => {
    const picker = new EasyEpoch();
    const icons = document.querySelectorAll('.easyepoch-icon');
    icons.forEach(icon => {
      const svg = icon.querySelector('svg');
      expect(svg).not.toBeNull();
    });
  });

  it('should use currentColor for stroke on SVG icons', () => {
    const picker = new EasyEpoch();
    const svg = document.querySelector('.easyepoch-icon svg');
    expect(svg).not.toBeNull();
    expect(svg!.getAttribute('stroke')).toBe('currentColor');
  });
});

describe('Bug fixes', () => {
  describe('readableDate includes ordinal suffix', () => {
    it('readableDate should contain ordinal suffix like "1st"', () => {
      const picker = new EasyEpoch({ selectedDate: new Date(2024, 0, 1, 12, 0) });
      picker.open();

      const okBtn = document.querySelector('.easyepoch-ok-btn') as HTMLElement;
      let capturedReadable = '';
      picker.on('submit', (_date, readable) => {
        capturedReadable = readable as string;
      });
      okBtn.click();

      expect(capturedReadable).toMatch(/^1st January 2024/);
    });
  });

  describe('clicking empty calendar cell is ignored', () => {
    it('should not select empty cells when clicked', () => {
      const picker = new EasyEpoch();
      const activeBefore = document.querySelector('.easyepoch-calender tbody td.active');
      const activeContentBefore = activeBefore ? activeBefore.innerHTML.trim() : '';

      const tds = document.querySelectorAll('.easyepoch-calender tbody td');
      let emptyTd: HTMLElement | null = null;
      tds.forEach(td => {
        if (td.getAttribute('data-empty') !== null) {
          emptyTd = td as HTMLElement;
        }
      });

      if (emptyTd) {
        (emptyTd as HTMLElement).click();
        // Active cell should not have changed
        const activeAfter = document.querySelector('.easyepoch-calender tbody td.active');
        expect(activeAfter).not.toBeNull();
        expect(activeAfter!.innerHTML.trim()).toBe(activeContentBefore);
        // The empty cell should not become active
        expect((emptyTd as HTMLElement).classList.contains('active')).toBe(false);
      }
    });
  });

  describe('error messages have correct function names', () => {
    it('scrapeNextMonth error message says "scrapeNextMonth"', () => {
      monthTracker.current = undefined;
      let errorMessage = '';
      try {
        scrapeNextMonth();
      } catch (e: any) {
        errorMessage = e.message;
      }
      expect(errorMessage).toContain('scrapeNextMonth');
    });
  });

  describe('easyepoch class name is spelled correctly', () => {
    it('inner picker div uses "easyepoch-date-picker"', () => {
      const picker = new EasyEpoch();
      expect(document.querySelector('.easyepoch-date-picker')).not.toBeNull();
      // The old typo should NOT exist
      expect(document.querySelector('.simpilepicker-date-picker')).toBeNull();
    });
  });

  describe('scrapeMonth handles months with exactly 4 calendar rows', () => {
    it('should not crash for February 2026 (starts Sunday, 28 days = exactly 4 rows)', () => {
      expect(() => scrapeMonth(new Date(2026, 1, 1))).not.toThrow();
    });
  });

  describe('multiple instances have independent month tracking', () => {
    it('navigating months in one picker should not affect another', () => {
      const div1 = document.createElement('div');
      div1.className = 'picker-a';
      document.body.appendChild(div1);

      const div2 = document.createElement('div');
      div2.className = 'picker-b';
      document.body.appendChild(div2);

      const picker1 = new EasyEpoch('.picker-a');
      const picker2 = new EasyEpoch('.picker-b');

      // Navigate picker1 forward
      const nextBtn1 = div1.querySelector('.easyepoch-icon-next') as HTMLElement;
      nextBtn1.click();

      // Picker2's selected-date should still show the current month
      const now = new Date();
      const currentMonthName = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ][now.getMonth()];

      const picker2SelectedDate = div2.querySelector('.easyepoch-selected-date');
      expect(picker2SelectedDate!.innerHTML).toContain(currentMonthName);
    });
  });
});
