import {BaseQueryTokenizer} from "./baseQueryTokenizer";
import {Token} from "../models";
import {TokenType} from "../constants";
import {newCouldNotBeTokenizedError} from "../errors";

export class TextQueryTokenizer extends BaseQueryTokenizer {
    public tokenize(text: string): Token[] {
        const tokens: Token[] = [];

        let remainingText = text;

        while (remainingText.length > 0) {
            const match = this.findMatch(remainingText);
            if (match && match.value.length > 0) {
                const token = this.createToken(tokens, match.tokenType, match.value, match.label);
                if (token) {
                    tokens.push(token);
                }
                remainingText = match.remainingText;
            } else {
                const wsMatch = new RegExp('^\\s+', 'i').exec(remainingText);
                if (wsMatch && wsMatch.length > 0) {
                    const token = this.createToken(tokens, TokenType.TokenTypeSpace, ' ');
                    if (token) {
                        tokens.push(token);
                    }
                    remainingText = remainingText.substring(1);
                } else {
                    const invalidTokenMatch = new RegExp('(^\\S+\\s)|^\\S+', 'i').exec(remainingText);
                    if (!invalidTokenMatch || invalidTokenMatch.length === 0) {
                        throw newCouldNotBeTokenizedError();
                    }

                    const token = this.createToken(tokens, TokenType.TokenTypeNone, invalidTokenMatch[0]);
                    if (token) {
                        tokens.push(token);
                    }
                    remainingText = remainingText.substring(invalidTokenMatch[0].length);
                }
            }
        }

        return tokens;
    }
}
