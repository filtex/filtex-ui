import {FieldType, TokenType} from "../constants";
import {Lookup, Metadata, Token} from "../models";
import {isBoolean, isDate, isDateTime, isNumber, isString, isTime} from "../utils";

class TokenPattern {
    constructor(
        public pattern: string,
        public type: TokenType,
        public label?: string) {
    }
}

export class TokenMatch {
    constructor(
        public remainingText: string,
        public tokenType: TokenType,
        public value: string,
        public label?: string) {
    }
}

export class BaseQueryTokenizer {
    private readonly tokenPatterns: TokenPattern[];

    constructor(public metadata: Metadata) {
        this.tokenPatterns = [
            new TokenPattern('^\\(', TokenType.TokenTypeOpenBracket, '('),
            new TokenPattern('^\\)', TokenType.TokenTypeCloseBracket, ')'),

            new TokenPattern('^,', TokenType.TokenTypeComma, ','),
            new TokenPattern('^/', TokenType.TokenTypeSlash, '/'),

            new TokenPattern('^and\\b', TokenType.TokenTypeAnd, 'And'),
            new TokenPattern('^&&', TokenType.TokenTypeAnd, '&&'),
            new TokenPattern('^or\\b', TokenType.TokenTypeOr, 'Or'),
            new TokenPattern('^\\|\\|', TokenType.TokenTypeOr, '||'),

            new TokenPattern('^=', TokenType.TokenTypeEqual, '='),
            new TokenPattern('^equal\\b', TokenType.TokenTypeEqual, 'Equal'),
            new TokenPattern('^!=', TokenType.TokenTypeNotEqual, '!='),
            new TokenPattern('^not equal\\b', TokenType.TokenTypeNotEqual, 'Not Equal'),

            new TokenPattern('^>=', TokenType.TokenTypeGreaterThanOrEqual, '>='),
            new TokenPattern('^greater than or equal\\b', TokenType.TokenTypeGreaterThanOrEqual, 'Greater Than Or Equal'),
            new TokenPattern('^>', TokenType.TokenTypeGreaterThan, '>'),
            new TokenPattern('^greater than\\b', TokenType.TokenTypeGreaterThan, 'Greater Than'),

            new TokenPattern('^<=', TokenType.TokenTypeLessThanOrEqual, '<='),
            new TokenPattern('^less than or equal\\b', TokenType.TokenTypeLessThanOrEqual, 'Less Than Or Equal'),
            new TokenPattern('^<', TokenType.TokenTypeLessThan, '<'),
            new TokenPattern('^less than\\b', TokenType.TokenTypeLessThan, 'Less Than'),

            new TokenPattern('^\\[\\]', TokenType.TokenTypeBlank, '[]'),
            new TokenPattern('^blank\\b', TokenType.TokenTypeBlank, 'Blank'),
            new TokenPattern('^!\\[\\]', TokenType.TokenTypeNotBlank, '![]'),
            new TokenPattern('^not blank\\b', TokenType.TokenTypeNotBlank, 'Not Blank'),

            new TokenPattern('^~\\*', TokenType.TokenTypeStartWith, '~*'),
            new TokenPattern('^start with\\b', TokenType.TokenTypeStartWith, 'Start With'),
            new TokenPattern('^!~\\*', TokenType.TokenTypeNotStartWith, '!~*'),
            new TokenPattern('^not start with\\b', TokenType.TokenTypeNotStartWith, 'Not Start With'),

            new TokenPattern('^\\*~', TokenType.TokenTypeEndWith, '*~'),
            new TokenPattern('^end with\\b', TokenType.TokenTypeEndWith, 'End With'),
            new TokenPattern('^!\\*~', TokenType.TokenTypeNotEndWith, '!*~'),
            new TokenPattern('^not end with\\b', TokenType.TokenTypeNotEndWith, 'Not End With'),

            new TokenPattern('^~', TokenType.TokenTypeContain, '~'),
            new TokenPattern('^contain\\b', TokenType.TokenTypeContain, 'Contain'),
            new TokenPattern('^!~', TokenType.TokenTypeNotContain, '!~'),
            new TokenPattern('^not contain\\b', TokenType.TokenTypeNotContain, 'Not Contain'),

            new TokenPattern('^in\\b', TokenType.TokenTypeIn, 'In'),
            new TokenPattern('^not in\\b', TokenType.TokenTypeNotIn, 'Not In'),

            ...this.metadata.fields.map(f => new TokenPattern('^' + f.label + '\\b', TokenType.TokenTypeField, f.label)),
            ...this.metadata.fields.map(f => new TokenPattern('^' + f.name + '\\b', TokenType.TokenTypeField, f.label)),

            new TokenPattern('^"[^"]*"', TokenType.TokenTypeStringValue),
            new TokenPattern('^\'[^\']*\'', TokenType.TokenTypeStringValue),
            new TokenPattern('^\\d\\d\\d\\d-\\d\\d-\\d\\d \\d\\d:\\d\\d(:\\d\\d)?', TokenType.TokenTypeDateTimeValue),
            new TokenPattern('^\\d\\d\\d\\d-\\d\\d-\\d\\d', TokenType.TokenTypeDateValue),
            new TokenPattern('^\\d\\d:\\d\\d(:\\d\\d)?', TokenType.TokenTypeTimeValue),
            new TokenPattern('^[0-9]+([.][0-9]+)?', TokenType.TokenTypeNumberValue),
            new TokenPattern('^(true)', TokenType.TokenTypeBooleanValue, 'True'),
            new TokenPattern('^(false)', TokenType.TokenTypeBooleanValue, 'False'),
            new TokenPattern('^[a-zA-Z0-9-_]+', TokenType.TokenTypeLiteral)
        ];
    }

    public findMatch(text: string): TokenMatch | null {
        for (const tokenPattern of this.tokenPatterns) {
            const match = new RegExp(tokenPattern.pattern, 'i').exec(text);
            if (match && match.length > 0) {
                let remainingText = '';
                if (match[0].length !== text.length) {
                    remainingText = text.substring(match[0].length);
                }

                return new TokenMatch(
                    remainingText,
                    tokenPattern.type,
                    match[0],
                    tokenPattern.label);
            }
        }

        return null;
    }

    public createToken(tokens: Token[], tokenType: TokenType, value: string, label?: string): Token | null {
        if (tokenType === TokenType.TokenTypeSpace) {
            if (tokens.length > 0 && tokens[tokens.length - 1].type === TokenType.TokenTypeSpace) {
                return null;
            }
            return new Token(tokenType, value);
        }

        const allTokens = tokens.filter(x => x.type !== TokenType.TokenTypeSpace);
        const fieldTokens = tokens.filter(x => x.type.isFieldTokenType());
        const operatorTokens = tokens.filter(x => x.type.isOperatorTokenType());
        const lastToken = allTokens.length > 0 ? allTokens[allTokens.length - 1] : null;
        const lastTokenType = allTokens.length > 0 ? allTokens[allTokens.length - 1].type : null;
        const lastFieldToken = fieldTokens.length > 0 ? fieldTokens[fieldTokens.length - 1] : null;
        const lastOperatorToken = operatorTokens.length > 0 ? operatorTokens[operatorTokens.length - 1] : null;

        if (lastTokenType === null) {
            if (tokenType === TokenType.TokenTypeField || tokenType === TokenType.TokenTypeLiteral) {
                if (this.validateField(value)) {
                    return new Token(TokenType.TokenTypeField, label ?? value);
                } else {
                    return new Token(TokenType.TokenTypeNone, value);
                }
            } else if (tokenType.isOpenGroupTokenType()) {
                return new Token(tokenType, value);
            }
        } else if (tokenType.isFieldTokenType()) {
            if (lastTokenType.isPreFieldTokenType()) {
                if (this.validateField(value)) {
                    return new Token(TokenType.TokenTypeField, label ?? value);
                } else {
                    return new Token(TokenType.TokenTypeNone, value);
                }
            } else if (lastTokenType.isComparerTokenType() || lastTokenType.isSeparatorTokenType()) {
                if (this.validateValue(lastFieldToken?.value, value)) {
                    if (lastOperatorToken && lastOperatorToken.type.isComparerTokenType()) {
                        return new Token(TokenType.TokenTypeValue, this.getFieldValue(lastFieldToken?.value, value)?.name ?? value);
                    } else {
                        return new Token(TokenType.TokenTypeNone, value);
                    }
                } else {
                    return new Token(TokenType.TokenTypeNone, value);
                }
            }
        } else if (tokenType === TokenType.TokenTypeLiteral) {
            if (lastTokenType.isComparerTokenType() || lastTokenType.isSeparatorTokenType()) {
                if (this.validateValue(lastFieldToken?.value, value)) {
                    if (lastOperatorToken && lastOperatorToken.type.isComparerTokenType()) {
                        return new Token(TokenType.TokenTypeValue, this.getFieldValue(lastFieldToken?.value, value)?.name ?? value);
                    } else {
                        return new Token(TokenType.TokenTypeNone, value);
                    }
                } else {
                    return new Token(TokenType.TokenTypeNone, value);
                }
            } else if (lastTokenType.isPreFieldTokenType()) {
                if (this.validateField(value)) {
                    return new Token(TokenType.TokenTypeField, label ?? value);
                } else {
                    return new Token(TokenType.TokenTypeNone, value);
                }
            }
        } else if (tokenType.isValueTokenType()) {
            if (lastTokenType.isComparerTokenType() || lastTokenType.isSeparatorTokenType()) {
                if (this.validateValue(lastFieldToken?.value, value)) {
                    if (lastOperatorToken && lastOperatorToken.type.isComparerTokenType()) {
                        return new Token(tokenType, this.getFieldValue(lastFieldToken?.value, value)?.name ?? value);
                    } else {
                        return new Token(TokenType.TokenTypeNone, value);
                    }
                } else {
                    return new Token(TokenType.TokenTypeNone, value);
                }
            }
        } else if (tokenType.isOperatorTokenType()) {
            if (lastTokenType === TokenType.TokenTypeField) {
                if (this.validateOperator(lastToken?.value, tokenType.toOperator().name)) {
                    return new Token(tokenType, label ?? value);
                } else {
                    return new Token(TokenType.TokenTypeNone, value);
                }
            }
        } else if (tokenType.isLogicTokenType()) {
            if (lastTokenType.isValueTokenType() || lastTokenType.isCloseGroupTokenType() || lastTokenType.isNotComparerTokenType()) {
                return new Token(tokenType, label ?? value);
            }
        } else if (tokenType.isOpenGroupTokenType()) {
            if (lastTokenType.isLogicTokenType() || lastTokenType.isOpenGroupTokenType()) {
                return new Token(tokenType, label ?? value);
            }
        } else if (tokenType.isCloseGroupTokenType()) {
            const openGroupTokenCount = allTokens.filter(x => x.type.isOpenGroupTokenType()).length;
            const closeGroupTokenCount = allTokens.filter(x => x.type.isCloseGroupTokenType()).length;

            if (openGroupTokenCount > closeGroupTokenCount && (lastTokenType.isValueTokenType() || lastTokenType.isCloseGroupTokenType() || lastTokenType.isNotComparerTokenType())) {
                return new Token(tokenType, label ?? value);
            }
        } else if (tokenType.isSeparatorTokenType()) {
            if (lastOperatorToken && lastOperatorToken.type.isComparerTokenType() && lastOperatorToken.type.isMultiAllowedTokenType()) {
                if (lastTokenType.isValueTokenType()) {
                    return new Token(tokenType, label ?? value);
                }
            }
        }

        return new Token(TokenType.TokenTypeNone, value);
    }

    public validateField(field: string): boolean {
        return this.metadata.fields.some(x => x.name.toLowerCase() === field.toLowerCase() || x.label.toLowerCase() === field.toLowerCase());
    }

    public validateOperator(field: any, value: any): boolean {
        const fieldValue = this.metadata.fields.find(x => x.name.toLowerCase() === field.toLowerCase() || x.label.toLowerCase() === field.toLowerCase());

        if (!fieldValue) {
            return false;
        }

        return fieldValue.operators.some(x => x.toLowerCase() === value.toString().toLowerCase());
    }

    public validateValue(field: any, value: any): boolean {
        const fieldValue = this.metadata.fields.find(x => x.name.toLowerCase() === field.toLowerCase() || x.label.toLowerCase() === field.toLowerCase());

        if (!fieldValue) {
            return false;
        }

        if (fieldValue.values.length === 0) {
            if (fieldValue.type === FieldType.FieldTypeString.name ||
                fieldValue.type === FieldType.FieldTypeStringArray.name) {
                return isString(value);
            }

            if (fieldValue.type === FieldType.FieldTypeNumber.name ||
                fieldValue.type === FieldType.FieldTypeNumberArray.name) {
                return isNumber(value);
            }

            if (fieldValue.type === FieldType.FieldTypeBoolean.name ||
                fieldValue.type === FieldType.FieldTypeBooleanArray.name) {
                return isBoolean(value);
            }

            if (fieldValue.type === FieldType.FieldTypeDate.name ||
                fieldValue.type === FieldType.FieldTypeDateArray.name) {
                return isDate(value);
            }

            if (fieldValue.type === FieldType.FieldTypeTime.name ||
                fieldValue.type === FieldType.FieldTypeTimeArray.name) {
                return isTime(value);
            }

            if (fieldValue.type === FieldType.FieldTypeDateTime.name ||
                fieldValue.type === FieldType.FieldTypeDateTimeArray.name) {
                return isDateTime(value);
            }

            return false;
        }

        return fieldValue.values.some(x => x.name.toString().toLowerCase() === value.toString().toLowerCase() || x.value.toString().toLowerCase() === value.toString().toLowerCase());
    }

    public getFieldType(str: string): FieldType {
        for (let item of this.metadata.fields) {
            if (item.label.toLowerCase() === str?.toLowerCase() || item.name.toLowerCase() === str?.toLowerCase()) {
                return FieldType.parseFieldType(item.type);
            }
        }
        return FieldType.FieldTypeUnknown;
    }

    public getFieldValue(fieldString: string, valueStr: string): Lookup | null {
        for (let item of this.metadata.fields) {
            if (item.label.toLowerCase() === fieldString?.toLowerCase() || item.name.toLowerCase() === fieldString?.toLowerCase()) {
                return item.values.find(x => x.name.toLowerCase() === valueStr?.toLowerCase()) || null;
            }
        }
        return null;
    }
}
