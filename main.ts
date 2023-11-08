import wordlist from "wordlist-english";

const settings: Settings = await loadSettings(Deno.args[0] ?? "settings.json");

const dictionary = getDictionary();
console.log(`Dictionary length: ${dictionary.length}`);
const wordGraph = makeWordGraph(dictionary);
console.log(`Graph nodes: ${wordGraph.nodes.size}`);

async function loadSettings(settingsFile: string): Promise<Settings> {
    const defaultSettings: Settings = {
        dictionary: "english/10",
        minOverlap: 2,
    };
    const settingsFileText = await Deno.readTextFile(settingsFile);
    const fileSettings: Partial<Settings> = JSON.parse(settingsFileText);
    return { ...defaultSettings, ...fileSettings };
}

interface Settings {
    dictionary: string;
    minOverlap: number;
}

function getDictionary(): string[] {
    const words: string[] = wordlist[settings.dictionary];
    const onlyLettersRegex = /^[a-z]+$/;
    const filteredWords = words.filter((word: string) =>
        onlyLettersRegex.test(word)
    );
    return filteredWords.sort();
}

// function getStartWords(dictionary: string[]): string[] {
//     return dictionary.filter((word: string, index: number) =>
//         dictionary[index + 1]?.startsWith(word)
//     );
// }

interface WordGraph {
    nodes: Map<string, Set<string>>;
}

function makeWordGraph(dictionary: string[]): WordGraph {
    const wordGraph: WordGraph = { nodes: new Map() };
    for (const word of dictionary) {
        for (
            let i = settings.minOverlap;
            i < word.length - settings.minOverlap;
            i++
        ) {
            const startFragment = word.slice(0, i);
            const endFragment = word.slice(i);
            if (!wordGraph.nodes.has(startFragment)) {
                wordGraph.nodes.set(startFragment, new Set());
            }
            wordGraph.nodes.get(startFragment)!.add(endFragment);
        }
    }
    return wordGraph;
}
