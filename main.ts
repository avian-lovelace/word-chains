import wordlist from "wordlist-english";

const dictionary = getDictionary();

while (true) {
    const start = dictionary[Math.floor(Math.random() * dictionary.length)];
    findWordChains(start, start, [start]);
}

function getDictionary(): string[] {
    const words: string[] = wordlist["english/10"];
    const onlyLettersRegex = /^[a-z]+$/;
    const filteredWords = words.filter((word: string) =>
        onlyLettersRegex.test(word)
    );
    return filteredWords.sort();
}

function findWordChains(chain: string, tail: string, segments: string[]) {
    console.log(`Expanding ${segments}`);
    prompt("Press enter to continue");
    const findResults = findWordsWithPrefix(tail);
    if (!findResults) {
        console.log(`No continuations found for ${tail}`);
        return;
    }
    const continuations = dictionary.slice(
        findResults.startIndex,
        findResults.endIndex
    );
    continuations.forEach((continuation: string) => {
        if (continuation === tail) {
            console.log(`Found complete chain ${chain}`);
        } else {
            const newTail = continuation.slice(tail.length);
            findWordChains(chain + newTail, newTail, [...segments, newTail]);
        }
    });
}

function findWordsWithPrefix(
    prefix: string
): { startIndex: number; endIndex: number } | undefined {
    const findResults = findWordWithPrefix();
    if (!findResults) return undefined;

    const startIndex = findStart(
        findResults.startIndex,
        findResults.prefixedIndex
    );
    const endIndex = findEnd(findResults.prefixedIndex, findResults.endIndex);
    return { startIndex, endIndex };

    function findWordWithPrefix():
        | { startIndex: number; endIndex: number; prefixedIndex: number }
        | undefined {
        let startIndex = 0;
        let endIndex = dictionary.length;
        while (startIndex < endIndex) {
            const checkIndex = Math.floor((startIndex + endIndex) / 2);
            const checkWord = dictionary[checkIndex];
            if (checkWord.startsWith(prefix)) {
                return { startIndex, endIndex, prefixedIndex: checkIndex };
            } else if (checkWord < prefix) {
                startIndex = checkIndex + 1;
            } else {
                endIndex = checkIndex;
            }
        }
        return undefined;
    }

    function findStart(rangeStart: number, rangeEnd: number): number {
        let startIndex = rangeStart;
        let endIndex = rangeEnd;
        while (endIndex - startIndex > 1) {
            const checkIndex = Math.floor((startIndex + endIndex) / 2);
            const checkWord = dictionary[checkIndex];
            if (checkWord.startsWith(prefix)) {
                endIndex = checkIndex;
            } else {
                startIndex = checkIndex;
            }
        }
        return endIndex;
    }

    function findEnd(rangeStart: number, rangeEnd: number): number {
        let startIndex = rangeStart;
        let endIndex = rangeEnd;
        while (endIndex - startIndex > 1) {
            const checkIndex = Math.floor((startIndex + endIndex) / 2);
            const checkWord = dictionary[checkIndex];
            if (checkWord.startsWith(prefix)) {
                startIndex = checkIndex;
            } else {
                endIndex = checkIndex;
            }
        }
        return endIndex;
    }
}
