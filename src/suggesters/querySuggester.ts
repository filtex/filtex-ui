import { Operator, TokenType } from '../constants';
import { Metadata, Token } from '../models';

export class QuerySuggester {
    constructor(public metadata: Metadata) {

    }

    suggest(tokens: Token[], selectedTokenIndex?: number): { suggestions: { value: string, onSelected: () => Token[] }[], selectedToken: Token | null } {
        const prevTokens = selectedTokenIndex !== null ? tokens.slice(0, selectedTokenIndex) : tokens;
        const selectedToken = selectedTokenIndex !== null ? tokens[selectedTokenIndex || 0] : null;
        const lastToken = prevTokens.filter(x => x.type !== TokenType.TokenTypeSpace).at(-1) ?? null;

        let items: any[] = [];
        let willCurTokenRemove: boolean | null = false;

        if (lastToken === null) {
            items = this.metadata.fields.map(prop => prop.label);
            willCurTokenRemove = selectedToken && (
                selectedToken.type === TokenType.TokenTypeNone ||
                selectedToken.type === TokenType.TokenTypeField);
        } else {
            switch (lastToken.type) {
                case TokenType.TokenTypeValue:
                case TokenType.TokenTypeStringValue:
                case TokenType.TokenTypeNumberValue:
                case TokenType.TokenTypeBooleanValue:
                case TokenType.TokenTypeDateValue:
                case TokenType.TokenTypeTimeValue:
                case TokenType.TokenTypeDateTimeValue:
                case TokenType.TokenTypeBlank:
                case TokenType.TokenTypeNotBlank:
                    items = ['And', 'Or'];
                    willCurTokenRemove = selectedToken && (
                        selectedToken.type === TokenType.TokenTypeNone ||
                        selectedToken.type === TokenType.TokenTypeAnd ||
                        selectedToken.type === TokenType.TokenTypeOr);
                    break;
                case TokenType.TokenTypeEqual:
                case TokenType.TokenTypeNotEqual:
                case TokenType.TokenTypeGreaterThan:
                case TokenType.TokenTypeGreaterThanOrEqual:
                case TokenType.TokenTypeLessThan:
                case TokenType.TokenTypeLessThanOrEqual:
                case TokenType.TokenTypeContain:
                case TokenType.TokenTypeNotContain:
                case TokenType.TokenTypeStartWith:
                case TokenType.TokenTypeNotStartWith:
                case TokenType.TokenTypeEndWith:
                case TokenType.TokenTypeNotEndWith:
                case TokenType.TokenTypeIn:
                case TokenType.TokenTypeNotIn: {
                    const propTokensExceptSpace = prevTokens.filter(token => token.type !== TokenType.TokenTypeSpace);
                    const propToken = propTokensExceptSpace[propTokensExceptSpace.length - 2];
                    const selectedProperties = this.metadata.fields
                        .filter(prop => prop.label.toLowerCase() === propToken.value.toLowerCase());
                    if (selectedProperties.length > 0) {
                        items = selectedProperties[0].values.map(val => val.name);
                        willCurTokenRemove = selectedToken && (
                            selectedToken.type === TokenType.TokenTypeNone ||
                            selectedToken.type === TokenType.TokenTypeValue ||
                            selectedToken.type === TokenType.TokenTypeStringValue ||
                            selectedToken.type === TokenType.TokenTypeNumberValue ||
                            selectedToken.type === TokenType.TokenTypeBooleanValue ||
                            selectedToken.type === TokenType.TokenTypeDateValue ||
                            selectedToken.type === TokenType.TokenTypeTimeValue ||
                            selectedToken.type === TokenType.TokenTypeDateTimeValue);
                    }
                }
                    break;
                case TokenType.TokenTypeSlash:
                case TokenType.TokenTypeComma: {
                    let prevFieldToken: Token | undefined;
                    let prevValues: any[] = [];

                    for (let i = prevTokens.length - 1; i >= 0; i--) {
                        const prevToken = prevTokens[i];

                        if (prevToken.type === TokenType.TokenTypeValue ||
                            prevToken.type === TokenType.TokenTypeStringValue ||
                            prevToken.type === TokenType.TokenTypeNumberValue ||
                            prevToken.type === TokenType.TokenTypeBooleanValue ||
                            prevToken.type === TokenType.TokenTypeDateValue ||
                            prevToken.type === TokenType.TokenTypeTimeValue ||
                            prevToken.type === TokenType.TokenTypeDateTimeValue) {
                            prevValues.push(prevToken.value.toString().toLowerCase());
                            continue;
                        }

                        if (prevToken.type === TokenType.TokenTypeField) {
                            prevFieldToken = prevToken;
                            break;
                        }
                    }

                    if (prevFieldToken) {
                        const selectedProperties = this.metadata.fields
                            .filter(prop => prop.label.toLowerCase() === prevFieldToken?.value.toLowerCase());
                        if (selectedProperties.length > 0) {
                            items = selectedProperties[0].values.filter((x) => !prevValues.includes(x.name.toLowerCase())).map(val => val.name);
                            willCurTokenRemove = selectedToken && (
                                selectedToken.type === TokenType.TokenTypeNone ||
                                selectedToken.type === TokenType.TokenTypeValue ||
                                selectedToken.type === TokenType.TokenTypeStringValue ||
                                selectedToken.type === TokenType.TokenTypeNumberValue ||
                                selectedToken.type === TokenType.TokenTypeBooleanValue ||
                                selectedToken.type === TokenType.TokenTypeDateValue ||
                                selectedToken.type === TokenType.TokenTypeTimeValue ||
                                selectedToken.type === TokenType.TokenTypeDateTimeValue);
                        }
                    }
                }
                    break;
                case TokenType.TokenTypeField: {
                    const selectedProperties = this.metadata.fields
                        .filter(prop => lastToken && prop.label.toLowerCase() === lastToken.value.toLowerCase());
                    if (selectedProperties.length > 0) {
                        items = selectedProperties[0].operators.map(op => Operator.parseOperator(op).label);
                        willCurTokenRemove = selectedToken && (
                            selectedToken.type === TokenType.TokenTypeNone ||
                            selectedToken.type === TokenType.TokenTypeEqual ||
                            selectedToken.type === TokenType.TokenTypeNotEqual ||
                            selectedToken.type === TokenType.TokenTypeGreaterThan ||
                            selectedToken.type === TokenType.TokenTypeGreaterThanOrEqual ||
                            selectedToken.type === TokenType.TokenTypeLessThan ||
                            selectedToken.type === TokenType.TokenTypeLessThanOrEqual ||
                            selectedToken.type === TokenType.TokenTypeBlank ||
                            selectedToken.type === TokenType.TokenTypeNotBlank ||
                            selectedToken.type === TokenType.TokenTypeContain ||
                            selectedToken.type === TokenType.TokenTypeNotContain ||
                            selectedToken.type === TokenType.TokenTypeStartWith ||
                            selectedToken.type === TokenType.TokenTypeNotStartWith ||
                            selectedToken.type === TokenType.TokenTypeEndWith ||
                            selectedToken.type === TokenType.TokenTypeNotEndWith ||
                            selectedToken.type === TokenType.TokenTypeIn ||
                            selectedToken.type === TokenType.TokenTypeNotIn);
                    }
                }
                    break;
                case TokenType.TokenTypeOpenBracket:
                case TokenType.TokenTypeAnd:
                case TokenType.TokenTypeOr:
                    items = this.metadata.fields.map(prop => prop.label);
                    willCurTokenRemove = selectedToken && (
                        selectedToken.type === TokenType.TokenTypeNone ||
                        selectedToken.type === TokenType.TokenTypeField);
                    break;
                case TokenType.TokenTypeCloseBracket:
                    items = ['And', 'Or'];
                    willCurTokenRemove = selectedToken && (
                        selectedToken.type === TokenType.TokenTypeNone ||
                        selectedToken.type === TokenType.TokenTypeAnd ||
                        selectedToken.type === TokenType.TokenTypeOr);
                    break;
            }
        }

        const suggestions = items.map(item => {
            return {
                value: item,
                onSelected: () => {
                    const newTokens = [...prevTokens];

                    let sliceCount = 1;

                    if (willCurTokenRemove === false) {
                        newTokens.push(tokens[selectedTokenIndex || 0]);
                        sliceCount++;
                    }

                    newTokens.push(new Token(TokenType.TokenTypeNone, item));

                    const nextTokens = tokens
                        .slice((selectedTokenIndex || 0) + sliceCount, tokens.length);

                    if (nextTokens.length === 0) {
                        newTokens.push(new Token(TokenType.TokenTypeSpace, ' '));
                    }

                    nextTokens
                        .forEach(token => newTokens.push(token));

                    return newTokens;
                }
            };
        });

        return {
            suggestions,
            selectedToken
        };
    }
}
