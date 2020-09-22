export default class GlobalEventsService {
    static dispatch(type, data) {
        const event = new CustomEvent(type, {
            detail: data,
        });
        window["document"].dispatchEvent(event);
    }
}