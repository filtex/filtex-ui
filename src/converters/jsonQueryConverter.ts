import { TokenType } from "../constants";
import { Metadata, Token } from "../models";
import { JsonQueryTokenizer } from "../tokenizers";

export class JsonQueryConverter {
    constructor(public metadata: Metadata) {
    }

    public convert(data: any[]): string {
        const queryTokenizer = new JsonQueryTokenizer(this.metadata);
        const tokens = queryTokenizer.tokenize(JSON.stringify(data));
        let result = this.convertInternal(tokens);

        if (result.length > 0) {
            if (result[0].type === TokenType.TokenTypeOpenBracket) {
                result = result.slice(1, result.length - 1);
            } else if (result[result.length - 1].type === TokenType.TokenTypeCloseBracket) {
                result = result.slice(0, result.length - 2);
            }
        }

        return result.map(x => x.value).join('');
    }

    private convertInternal(data: any[]): Token[] {
        const tokens: Token[] = [];

        if (Array.isArray(data[1])) {
            data[1].forEach((x: any, i: number) => {
                const inner = this.convertInternal(x);
                if (i !== 0) {
                    if (data[0]) {
                        tokens.push(new Token(TokenType.TokenTypeNone, data[0].value));
                    } else {
                        tokens.push(new Token(TokenType.TokenTypeNone, ''));
                    }
                    tokens.push(new Token(TokenType.TokenTypeSpace, ' '));
                } else {
                    tokens.push(new Token(TokenType.TokenTypeOpenBracket, '('));
                }
                tokens.push(...inner);
                if (i === data[1].length - 1) {
                    if (tokens[tokens.length - 1].type === TokenType.TokenTypeSpace) {
                        tokens.pop();
                    }
                    tokens.push(new Token(TokenType.TokenTypeCloseBracket, ')'));
                }
            })
        } else if (data[0] || data[1] || data[2]) {
            if (data[0]) {
                tokens.push(new Token(TokenType.TokenTypeNone, data[0].value));
            } else {
                tokens.push(new Token(TokenType.TokenTypeNone, ''));
            }
            tokens.push(new Token(TokenType.TokenTypeSpace, ' '));

            if (data[1]) {
                tokens.push(new Token(TokenType.TokenTypeNone, data[1].value));
            } else {
                tokens.push(new Token(TokenType.TokenTypeNone, ''));
            }
            tokens.push(new Token(TokenType.TokenTypeSpace, ' '));

            if (Array.isArray(data[2])) {
                for (let i = 0; i < data[2].length; i++) {
                    const item = data[2][i];
                    let value = '';
                    if (item) {
                        value = item.value || '';
                    }

                    if (value.includes(' ')) {
                        tokens.push(new Token(TokenType.TokenTypeNone, '"' + value + '"'));
                    } else {
                        tokens.push(new Token(TokenType.TokenTypeNone, value));
                    }
                    tokens.push(new Token(TokenType.TokenTypeSpace, ' '));
                    if (i !== data[2].length - 1) {
                        tokens.push(new Token(TokenType.TokenTypeSlash, '/'));
                        tokens.push(new Token(TokenType.TokenTypeSpace, ' '));
                    }
                }
            } else {
                if (data[2]) {
                    if (data[2].value.includes(' ')) {
                        tokens.push(new Token(TokenType.TokenTypeNone, '"' + data[2].value + '"'));
                    } else {
                        tokens.push(new Token(TokenType.TokenTypeNone, data[2].value));
                    }
                } else {
                    tokens.push(new Token(TokenType.TokenTypeNone, ''));
                }
                tokens.push(new Token(TokenType.TokenTypeSpace, ' '));
            }
        }

        return tokens;
    }
}
