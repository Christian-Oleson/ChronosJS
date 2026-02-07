type EasyEpochEvent = 'submit' | 'close';
type EasyEpochTheme = 'light' | 'dark' | Record<string, string>;
interface EasyEpochOpts {
    zIndex?: number;
    compactMode?: boolean;
    disableTimeSection?: boolean;
    selectedDate?: Date;
    theme?: EasyEpochTheme;
}
type HandlerFunction = (...args: unknown[]) => void;
interface EventHandlers {
    [key: string]: HandlerFunction[];
}
declare class EasyEpoch {
    selectedDate: Date;
    $easyEpoch: HTMLElement;
    readableDate: string;
    _eventHandlers: EventHandlers;
    _validOnListeners: readonly ["submit", "close"];
    private opts;
    private $;
    private $$;
    private $easyepoch;
    private $easyepochWrapper;
    private $trs;
    private $tds;
    private $lastRow;
    private $headerMonthAndYear;
    private $monthAndYear;
    private $date;
    private $day;
    private $time;
    private $timeInput;
    private $timeSectionIcon;
    private $cancel;
    private $ok;
    private $displayDateElements;
    private $activeCell;
    private monthTracker;
    constructor(arg1?: HTMLElement | string | EasyEpochOpts, arg2?: EasyEpochOpts);
    initElMethod(el: any): void;
    init(el: HTMLElement, opts: EasyEpochOpts): void;
    reset(newDate?: Date): void;
    compactMode(): void;
    disableTimeSection(): void;
    enableTimeSection(): void;
    setTheme(theme: EasyEpochTheme): void;
    injectTemplate(el: HTMLElement): void;
    clearRows(): void;
    updateDateComponents(date: Date): void;
    render(data: any): void;
    updateSelectedDate(el?: HTMLElement): void;
    selectDateElement(el: HTMLElement): void;
    findElementWithDate(date: any, returnLastIfNotFound?: boolean): any;
    handleIconButtonClick(el: HTMLElement): void;
    initListeners(): void;
    callEvent(event: EasyEpochEvent, dispatcher: (a: HandlerFunction) => void): void;
    open(): void;
    close(): void;
    on(event: EasyEpochEvent, handler: HandlerFunction): void;
    toggleDisplayFade(): void;
}
export = EasyEpoch;
