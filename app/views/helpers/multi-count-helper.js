import Utils from '../../utils';

export default class MultiCountHelper {
    static isMaxMultiCountReached(selectedAnswerCount, multiCount) {
        const {equal, max} = multiCount;

        return !Utils.isEmpty(equal) && selectedAnswerCount >= equal || !Utils.isEmpty(max) && selectedAnswerCount >= max;
    }
}