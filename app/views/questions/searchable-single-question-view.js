import Utils from '../../utils';
import SearchableQuestionViewBase from './base/searchable-question-view-base';

export default class SearchableSingleQuestionView extends SearchableQuestionViewBase {
    constructor(question, settings = null) {
        super(question, settings);

        this._selectedAnswerCssClass = 'cf-radio-answer--selected';
        this._selectedControlCssClass = 'cf-radio--selected';

        this._storedOtherValues =  this._question.value !== null ? {[this._question.value]: this._question.otherValue} : {};
    }

    _attachHandlersToDOM() {
        super._attachHandlersToDOM();

        this.answers.forEach(answer => {
            this._getAnswerNode(answer.code).on('click', this._onAnswerNodeClick.bind(this, answer));

            if (answer.isOther) {
                const otherInput = this._getAnswerOtherNode(answer.code);
                otherInput.on('click', e => e.stopPropagation());
                otherInput.on('focus', () => this._onAnswerOtherNodeFocus(answer));
                otherInput.on('input', e => this._onAnswerOtherNodeValueChange(answer, e.target.value));
            }
        });
    }

    _getSelectedAnswerText(answer) {
        return answer.isOther && !Utils.isEmpty(this._question.otherValue) ? this._question.otherValue : answer.text;
    }

    _renderAnswer(answer) {
        const isSelected = answer.code === this._question.value;
        const rtlCssModifier = Utils.getRtlCSSClassModifier(this._question, 'cf-radio-answer');

        return `           
            <div class="cf-radio-answer ${rtlCssModifier} ${isSelected ? this._selectedAnswerCssClass : ''}" id="${this._getAnswerNodeId(answer.code)}">
                <div class="cf-radio-answer__control">
                     <div class="cf-radio ${isSelected ? this._selectedControlCssClass : ''}" ${this._getAnswerColorStyle(answer)} id="${this._getAnswerControlNodeId(answer.code)}"></div>              
                </div>
                <div class="cf-radio-answer__content">
                     <div class="cf-radio-answer__text" id="${this._getAnswerTextNodeId(answer.code)}">${answer.text}</div>              
                </div>
            </div>
        `;
    }

    _getAnswerColorStyle(answer) {
        return answer.code === this._question.value && !Utils.isEmpty(answer.backgroundColor) ?
            `style="background-color: ${answer.backgroundColor}; border-color: ${answer.backgroundColor}"`
            :
            '';
    }

    // eslint-disable-next-line no-unused-vars
    _unselectAnswer(answer) {
        this._question.setValue(null);
    }

    _updateAnswerNodes({value}) {
        if (value === undefined) {
            return;
        }

        this._question.answers.forEach(answer => {
            this._getAnswerNode(answer.code).removeClass(this._selectedAnswerCssClass);
            this._getAnswerControlNode(answer.code)
              .removeClass(this._selectedControlCssClass)
              .css('background-color', '')
              .css('border-color', '');
        });

        if (this._question.value === null) {
            return;
        }

        const answer = this._question.getAnswer(this._question.value);
        this._getAnswerNode(answer.code).addClass(this._selectedAnswerCssClass);

        const controlNode = this._getAnswerControlNode(answer.code);
        controlNode.addClass(this._selectedControlCssClass);
        if (!Utils.isEmpty(answer.backgroundColor)) {
            controlNode.css({backgroundColor: answer.backgroundColor, borderColor: answer.backgroundColor});
        }
    }

    _updateAnswerOtherNodes(changes) {
        if (changes.otherValue) {
            this._setOtherNodeValue(this._question.value, this._question.otherValue);
            return;
        }

        this._question.otherAnswers.forEach(answer => {
            if (this._question.value !== answer.code) {
                this._setOtherNodeValue(answer.code, null)
            }
        });

        const cached = !Utils.isEmpty(this._storedOtherValues[this._question.value]);
        const checked = changes.value && this._question.value !== null;

        if (checked && cached) {
            this._question.setOtherValue(this._storedOtherValues[this._question.value]);
            delete this._storedOtherValues[this._question.value];
        }
    }

    // eslint-disable-next-line no-unused-vars
    _updateStoredOtherValues(changes) {
        if(!Utils.isEmpty(this._question.otherValue)) {
            this._storedOtherValues[this._question.value] = this._question.otherValue;
        }
    }

    _selectAnswer(answer) {
        this._question.setValue(answer.code);

        if (answer.isOther) {
            const otherInput = this._getAnswerOtherNode(answer.code);
            this._question.setOtherValue(otherInput.val());
            if (Utils.isEmpty(otherInput.val())) {
                otherInput.focus();
            }
        }
    }

    _onModelValueChange(data) {
        super._onModelValueChange(data.changes);

        this._updateAnswerNodes(data.changes);
        this._updateAnswerOtherNodes(data.changes);
        this._updateStoredOtherValues(data.changes);
    }

    _onAnswerNodeClick(answer) {
        this._selectAnswer(answer);
    }

    _onAnswerOtherNodeFocus(answer) {
        if (Utils.isEmpty(this._storedOtherValues[answer.code])) {
            return;
        }

        this._question.setValue(answer.code);
    }

    _onAnswerOtherNodeValueChange(answer, otherValue) {
        if (!Utils.isEmpty(otherValue)) { // select answer
            this._question.setValue(answer.code);
        }

        if (this._question.value === answer.code) { // update other value for currently selected answer
            this._question.setOtherValue(otherValue);
        }
    }
}