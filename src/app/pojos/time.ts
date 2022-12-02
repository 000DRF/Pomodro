export class Time {
    private readonly HR = 60 ** 2;
    private readonly MIN = 60;
    public secs: number; // time in seconds;

    constructor(time: number) {
        this.secs = time;
    }

    public toString(): string {
        const leadingZero = (num: number): string => {
            return (num < 10) ? '0' + num : num.toString(); // Add leading zero 
        }
        const HR = 60 ** 2;
        const MIN = 60;

        const hr = Math.floor(this.secs / HR);
        const min = Math.floor((this.secs % HR) / MIN);
        const sec = this.secs % MIN;
        let ans = '';

        if (hr > 0) {
            ans += leadingZero(hr) + ':';
        }
        ans += leadingZero(min) + ':';
        ans += leadingZero(sec);

        return ans;
    }

    public decrement() {
        if (!this.end)
            this.secs--;
    }

    public get end(){
        return this.secs === 0; 
    }

}