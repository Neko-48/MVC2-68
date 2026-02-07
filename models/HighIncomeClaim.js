import Claim from './Claim.js';

class HighIncomeClaim extends Claim {
    calculate() {
        return Math.min(this.income / 5, this.maxCompensation);
    }
}
export default HighIncomeClaim;