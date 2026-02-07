class Claim {
    constructor(income) {
        this.income = parseFloat(income);
        this.maxCompensation = 20000;
    }

    calculate() {
        if (this.income >= 6500 && this.income <= 50000) {
            return Math.min(this.income, this.maxCompensation);
        }
        return 0;
    }
}
export default Claim;