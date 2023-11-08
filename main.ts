import wordlist from "wordlist-english";

const settings: Settings = await loadSettings(Deno.args[0] ?? "settings.json");

const dictionary = getDictionary();
const startWords = getStartWords(dictionary);

while (true) {
    const start = startWords[Math.floor(Math.random() * startWords.length)];
    findWordChains(start, start, [start]);
}

async function loadSettings(settingsFile: string): Promise<Settings> {
    const defaultSettings: Settings = {
        dictionary: "english/10",
    };
    const settingsFileText = await Deno.readTextFile(settingsFile);
    const fileSettings: Settings = JSON.parse(settingsFileText);
    return { ...defaultSettings, ...fileSettings };
}

interface Settings {
    dictionary: string;
}

function getDictionary(): string[] {
    const words: string[] = wordlist[settings.dictionary];
    const onlyLettersRegex = /^[a-z]+$/;
    const filteredWords = words.filter((word: string) =>
        onlyLettersRegex.test(word)
    );
    return filteredWords.sort();
}

function getStartWords(dictionary: string[]): string[] {
    return dictionary.filter((word: string, index: number) =>
        dictionary[index + 1]?.startsWith(word)
    );
}

function findWordChains(chain: string, tail: string, segments: string[]) {
    console.log(`Expanding ${segments}`);
    console.log(tail);
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
