import { TokenType } from "../constants";
import { Metadata, Token } from "../models";
import { TextQueryTokenizer } from "../tokenizers";

export class TextQueryConverter {
    constructor(public metadata: Metadata) {
    }

    public convert(query: string): any[] {
        const queryTokenizer = new TextQueryTokenizer(this.metadata);
        const tokens = queryTokenizer.tokenize(query);
        const ref = {result: ['', '', '']};
        return this.convertInternal(tokens, ref);
    }

    private convertInternal(queue: Token[], ref: { result: any[] }, isValueExpected: boolean = false): any[] {
        let index = 0;

        while (queue.length > 0) {
            const token = queue.shift();

            if (!token || token.type === TokenType.TokenTypeSpace) {
                continue;
            }

            if (token.type.isFieldTokenType()) {
                ref.result[0] = token.value;
                index = 1;
            } else if (token.type.isComparerTokenType()) {
                ref.result[1] = token.value;
                index = 2;
            } else if (token.type.isNotComparerTokenType()) {
                ref.result[1] = token.value;
                ref.result[2] = '';
                index = 0;

                if (isValueExpected) {
                    return ref.result;
                }
            } else if (token.type.isValueTokenType()) {
                if (Array.isArray(ref.result[2])) {
                    ref.result[2].push(token.value.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1'));
                } else {
                    ref.result[2] = token.value.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
                }

                index = 0;

                if (isValueExpected) {
                    return ref.result;
                }
            } else if (token.type.isLogicTokenType()) {
                const logicInner = {result: ['', '', '']};
                const logicResult = this.convertInternal(queue, logicInner, true);
                if (Array.isArray(ref.result) && ref.result.length > 0 && ref.result[0].toLowerCase() === token.type.name.toLowerCase()) {
                    ref.result = [token.value, [...ref.result[1], logicResult]];
                } else {
                    ref.result = [token.value, [ref.result, logicResult]];
                }
            } else if (token.type.isSeparatorTokenType()) {
                if (Array.isArray(ref.result[2])) {
                    ref.result[2] = [...ref.result[2]];
                } else {
                    ref.result[2] = [ref.result[2]];
                }
            } else if (token.type.isOpenGroupTokenType()) {
                const bracketInner = {result: ['', '', '']};
                ref.result = this.convertInternal(queue, bracketInner);
            } else if (token.type.isCloseGroupTokenType()) {
                return ref.result;
            } else {
                ref.result[index] = token.value;
            }
        }

        return ref.result;
    }
}
