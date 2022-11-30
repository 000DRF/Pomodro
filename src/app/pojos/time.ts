export class Time {
    private readonly HR = 60 ** 2;
    private readonly MIN = 60;
    public time: number; // time in seconds;

    constructor(time: number) {
        this.time = time;
    }

    public toString(): string {
        const leadingZero = (num: number): string => {
            return (num < 10) ? '0' + num : num.toString(); // Add leading zero 
        }
        const HR = 60 ** 2;
        const MIN = 60;

        const hr = Math.floor(this.time / HR);
        const min = Math.floor((this.time % HR) / MIN);
        const sec = this.time % MIN;
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
            this.time--;
    }

    public get end(){
        return this.time === 0; 
    }

}